import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Trash2, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { CommonService } from "@/service/commonservice.page";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
export default function AdminUsers() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<any>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([
        CommonService.GetAll("/User/List"),
        CommonService.GetAll("/UserRole/List")
      ]);

      setUsers(Array.isArray(usersData) ? usersData : (usersData?.AddtionalData || []));
      setRoles(Array.isArray(rolesData) ? rolesData : (rolesData?.AddtionalData || []));
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteUser) return;
    try {
      await CommonService.CommonDelete(`/User/Delete/${deleteUser.id}`);
      setDeleteOpen(false);
      setDeleteUser(null);
      fetchData();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const confirmRoleChange = async () => {
    if (!selectedUser) return;
    try {
      await CommonService.CommonPatch(
        { user_role_id: selectedRole },
        `/User/UpdateRole/${selectedUser.id}`
      );
      setRoleDialogOpen(false);
      setSelectedUser(null);
      fetchData();
    } catch (err) {
      console.error("Role update failed:", err);
    }
  };

  const filtered = users.filter((u: any) =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.firstName || "").toLowerCase().includes(search.toLowerCase())
  );

  const roleColors: Record<string, string> = {
    super_admin: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    admin: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    user: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight">System Users</h1>
          <p className="text-muted-foreground">Manage accounts and platform roles.</p>
        </motion.div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 glass-input rounded-2xl"
          />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass-card border-[#f0e8e2] dark:border-[#f0e8e2]">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center text-muted-foreground">Loading users...</div>
            ) : (
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-[#f0e8e2] dark:border-[#f0e8e2]">
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filtered.map((user: any) => (
                    <TableRow key={user.id} className="hover:bg-white/20 dark:hover:bg-white/5 transition-colors border-[#f0e8e2] group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center text-sm font-bold text-red-600 dark:text-red-400">
                            {user.firstName?.charAt(0) || user.username?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{(user.firstName || user.first_name) ? `${user.firstName || user.first_name} ${user.lastName || user.last_name || ''}` : (user.username || "System User")}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Select
                          value={user.user_role_id}
                          onValueChange={(val) => {
                            setSelectedUser(user);
                            setSelectedRole(val);
                            setRoleDialogOpen(true);
                          }}
                        >
                          <SelectTrigger className="h-7 w-fit min-w-[130px] text-xs bg-transparent border-none pl-0 pr-2 focus:ring-0 gap-2">
                            <Badge variant="secondary" className={cn("capitalize font-semibold text-[10px] h-5", roleColors[user.user_role?.name] || "bg-gray-100 text-gray-600")}>
                              {user.user_role?.name || "No Role"}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role: any) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell className="text-muted-foreground text-sm">
                        {user.created_on ? new Date(user.created_on).toLocaleDateString() : 'N/A'}
                      </TableCell>

                      <TableCell className="text-right flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/user/${user.id}`)}
                        >
                          Edit
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeleteUser(user);
                            setDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">No users found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="text-center space-y-5"
          >
            <div className="flex justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  rotate: [0, -8, 8, -8, 0],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="bg-red-100 dark:bg-red-900/30 rounded-full p-6 cursor-pointer"
                onClick={() => setDeleteOpen(false)}
              >
                <span className="text-red-600 text-4xl">⚠️</span>
              </motion.div>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Are you Sure?</h2>
            <div className="bg-muted rounded-lg p-3 text-sm">
              You want to delete: <span className="font-semibold text-red-600">
                {deleteUser?.firstName} {deleteUser?.lastName || deleteUser?.username}
              </span>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Button variant="cancel" onClick={() => setDeleteOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDelete} className="shadow-lg">Delete User</Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="max-w-md p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="text-center space-y-5"
          >
            <div className="flex justify-center">
              <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full p-6">
                <span className="text-orange-600 text-4xl">⚠️</span>
              </div>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Change Role?</h2>
            <div className="bg-muted rounded-lg p-3 text-sm">
              Change role from
              <span className="font-semibold text-red-600">{" "}{selectedUser?.role}</span>
              {" "}to
              <span className="font-semibold text-green-600">{" "}{roles.find(r => r.id === selectedRole)?.name}</span>?
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Button variant="cancel" onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
              <Button onClick={confirmRoleChange} className="bg-orange-600 text-white">Yes, Change Role</Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
