import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";

import { Users, Search, Trash2, Shield, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CommonService } from "@/service/commonservice.page";
import { useToast } from "@/hooks/use-toast";

export default function AdminUserRoles() {

  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteRole, setDeleteRole] = useState<any>(null);

  const [roleForm, setRoleForm] = useState({
    name: "",
    code: "",
  });

  useEffect(() => {
    fetchRoles();
  }, []);


  const fetchRoles = async () => {
    setLoading(true);

    try {

      const res = await CommonService.GetAll("/UserRole/List");

      const data = Array.isArray(res) ? res : (res?.AddtionalData || []);

      setRoles(data);

    } catch (err) {

      console.error(err);

      toast({
        title: "Failed to load roles",
        variant: "destructive",
      });

    } finally {

      setLoading(false);

    }
  };

  const handleCreate = () => {

    setEditingRole(null);

    setRoleForm({
      name: "",
      code: "",
    });

    setDialogOpen(true);

  };


  const handleUpdate = (role: any) => {

    setEditingRole(role);

    setRoleForm({
      name: role.name,
      code: role.code,
    });

    setDialogOpen(true);

  };

  const handleSave = async () => {

    if (!roleForm.name || !roleForm.code) {

      toast({
        title: "Enter all fields",
        variant: "destructive",
      });

      return;
    }

    try {

      if (editingRole) {

        await CommonService.CommonPut(
          roleForm,
          `/UserRole/Update/${editingRole.id}`
        );

        toast({ title: "Role updated successfully" });

      } else {

        await CommonService.CommonPost(
          roleForm,
          "/UserRole/Insert"
        );

        toast({ title: "Role created successfully" });

      }

      setDialogOpen(false);

      fetchRoles();

    } catch {

      toast({
        title: "Save failed",
        variant: "destructive",
      });

    }

  };

  const confirmDelete = async () => {
    if (!deleteRole) return;

    try {

      await CommonService.CommonDelete(
        `/UserRole/Delete/${deleteRole.id}`
      );

      toast({
        title: "Role deleted successfully",
      });

      setDeleteOpen(false);
      setDeleteRole(null);
      fetchRoles();

    } catch {

      toast({
        title: "Delete failed",
        variant: "destructive",
      });

    }
  };
  const filtered = roles.filter((r: any) =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (

    <div className="space-y-8">



      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 mb-1">
            {/* <Shield className="h-8 w-8 text-3xl font-bold tracking-tight" /> */}

            <h1 className="text-3xl font-bold tracking-tight">
              User Roles
            </h1>

          </div>

          <p className="text-muted-foreground">
            Manage roles and permissions
          </p>

        </motion.div>

        <div className="flex gap-3">

          <div className="relative w-64">

            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />

            <Input
              placeholder="Search roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />

          </div>

          <Button onClick={handleCreate}
            className="gap-2 glossy-button-primary rounded-full border-none whitespace-nowrap"
          >
            Add Role
          </Button>

        </div>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-4 gap-4">

        <Card>

          <CardContent className="pt-4 pb-6 flex items-center gap-3">

            <Users className="h-6 w-6 text-blue-500" />

            <div>
              <p className="text-xl font-bold">{roles.length}</p>
              <p className="text-xs text-muted-foreground">
                Total Roles
              </p>
            </div>

          </CardContent>

        </Card>

      </div>

      {/* TABLE */}

      <Card>

        <CardContent className="p-0">

          {loading ? (

            <div className="p-12 text-center text-muted-foreground">
              Loading roles...
            </div>

          ) : (

            <Table>

              <TableHeader>

                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>

              </TableHeader>

              <TableBody>

                {filtered.map((role: any) => (

                  <TableRow key={role.id}>

                    <TableCell className="font-medium">
                      {role.name}
                    </TableCell>

                    <TableCell>
                      {role.code}
                    </TableCell>

                    <TableCell>
                      {role.created_on
                        ? new Date(role.created_on).toLocaleDateString()
                        : "-"
                      }
                    </TableCell>

                    <TableCell className="text-right flex justify-end gap-2">

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdate(role)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeleteRole(role);
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

                    <TableCell colSpan={4} className="text-center py-12">
                      No roles found
                    </TableCell>

                  </TableRow>

                )}

              </TableBody>

            </Table>

          )}

        </CardContent>

      </Card>

      {/* DIALOG */}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>

        <DialogContent>

          <DialogHeader>

            <DialogTitle>
              {editingRole ? "Update Role" : "Add New Role"}
            </DialogTitle>

          </DialogHeader>

          <div className="space-y-4 py-4">

            <div className="space-y-2">

              <Label>Role Name</Label>

              <Input
                value={roleForm.name}
                onChange={(e) => setRoleForm({
                  ...roleForm,
                  name: e.target.value
                })}
                placeholder="Admin"
              />

            </div>

            <div className="space-y-2">

              <Label>Role Code</Label>

              <Input
                value={roleForm.code}
                onChange={(e) => setRoleForm({
                  ...roleForm,
                  code: e.target.value
                })}
                placeholder="admin"
              />

            </div>

          </div>

          <DialogFooter>

            <Button
              variant="cancel"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>

            <Button onClick={handleSave}
              className="gap-2 glossy-button-primary rounded-full border-none whitespace-nowrap"
            >

              {editingRole
                ? "Update Role"
                : "Create Role"
              }

            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>
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

            {/* Title */}
            <h2 className="text-2xl font-semibold tracking-tight">
              Delete Role
            </h2>

            {/* Description */}
            <p className="text-muted-foreground text-sm">
              This action cannot be undone.
            </p>

            {/* Role Name */}
            <div className="bg-muted rounded-lg p-3 text-sm">
              Role: <span className="font-semibold text-red-600">{deleteRole?.name}</span>
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-3 pt-2">

              <Button
                variant="cancel"
                onClick={() => setDeleteOpen(false)}
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="shadow-lg"
              >
                Delete Role
              </Button>

            </div>

          </motion.div>

        </DialogContent>
      </Dialog>
    </div>

  );

}