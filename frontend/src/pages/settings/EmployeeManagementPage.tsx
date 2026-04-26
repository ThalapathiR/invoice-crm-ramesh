import React, { useState, useEffect } from "react";
import { 
  UserCog, 
  Plus, 
  Trash2, 
  Edit3, 
  Search,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  UserPlus,
  ShieldCheck,
  UserMinus,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CommonService } from "@/service/commonservice.page";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EmployeeManagementPage: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    user_role_id: ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, rolesRes] = await Promise.all([
        CommonService.GetAll("/employee/List"),
        CommonService.GetAll("/tenant-role/List")
      ]);
      setEmployees(Array.isArray(empRes) ? empRes : (empRes.result || []));
      setRoles(Array.isArray(rolesRes) ? rolesRes : (rolesRes.result || []));
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!formData.firstName || !formData.email || (!selectedEmployee && !formData.password) || !formData.user_role_id) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const data = {
        id: selectedEmployee?.id,
        ...formData,
        first_name: formData.firstName,
        last_name: formData.lastName
      };
      await CommonService.CommonPost(data, "/employee/Save");
      toast.success(selectedEmployee ? "Employee updated" : "Employee added");
      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error("Failed to save employee");
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await CommonService.CommonPost({ id }, "/employee/ToggleStatus");
      toast.success("Employee status updated");
      fetchData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const resetForm = () => {
    setSelectedEmployee(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      password: "",
      user_role_id: ""
    });
  };

  const openEditDialog = (emp: any) => {
    setSelectedEmployee(emp);
    setFormData({
      firstName: emp.first_name || "",
      lastName: emp.last_name || "",
      email: emp.email || "",
      mobile: emp.mobile || "",
      password: "", // Don't show password
      user_role_id: emp.user_role_id || ""
    });
    setIsDialogOpen(true);
  };

  const filtered = employees.filter(e => 
    e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <UserCog className="w-6 h-6" />
            </div>
            Employee Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage your team members and their application access.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl font-bold gap-2 shadow-lg shadow-primary/20">
              <UserPlus className="w-4 h-4" /> Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl rounded-[32px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">
                {selectedEmployee ? "Edit Employee" : "Add New Employee"}
              </DialogTitle>
              <DialogDescription>
                Fill in the details to create or update an employee account.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2 col-span-1">
                <Label htmlFor="firstName" className="font-bold">First Name</Label>
                <Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="rounded-xl" />
              </div>
              <div className="space-y-2 col-span-1">
                <Label htmlFor="lastName" className="font-bold">Last Name</Label>
                <Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="rounded-xl" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="email" className="font-bold">Email Address</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="rounded-xl" disabled={!!selectedEmployee} />
              </div>
              <div className="space-y-2 col-span-1">
                <Label htmlFor="mobile" className="font-bold">Mobile Number</Label>
                <Input id="mobile" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} className="rounded-xl" />
              </div>
              <div className="space-y-2 col-span-1">
                <Label htmlFor="role" className="font-bold">Assigned Role</Label>
                <Select value={formData.user_role_id} onValueChange={(val) => setFormData({...formData, user_role_id: val})}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles
                      .filter(role => role.code !== 'TENANT' && role.code !== 'USER')
                      .map(role => (
                      <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {!selectedEmployee && (
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="pass" className="font-bold">Initial Password</Label>
                  <Input id="pass" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="rounded-xl" />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl font-bold">Cancel</Button>
              <Button onClick={handleSave} className="rounded-xl font-bold px-8">Save Employee</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-muted bg-muted/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl bg-background border-none focus:ring-2 ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500" /> {employees.filter(e => e.status).length} Active
            <span className="w-2 h-2 rounded-full bg-red-500 ml-2" /> {employees.filter(e => !e.status).length} Suspended
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/5">
              <TableHead className="font-bold py-4">Employee</TableHead>
              <TableHead className="font-bold">Role</TableHead>
              <TableHead className="font-bold">Contact</TableHead>
              <TableHead className="font-bold">Joined</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [1, 2, 3].map(i => (
                <TableRow key={i}>
                  <TableCell colSpan={6} className="h-20"><div className="w-full h-8 bg-muted animate-pulse rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-muted-foreground italic">No employees found matching your search.</TableCell>
              </TableRow>
            ) : (
              filtered.map((emp) => (
                <TableRow key={emp.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-inner",
                        emp.status ? "bg-gradient-to-br from-primary to-blue-600" : "bg-slate-400"
                      )}>
                        {emp.first_name?.charAt(0) || emp.email?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">
                          {emp.first_name} {emp.last_name}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                          <Mail className="w-3 h-3" /> {emp.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-lg font-bold border-primary/20 bg-primary/5 text-primary">
                      {emp.user_role?.name || "No Role"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {emp.mobile || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {emp.created_on ? new Date(emp.created_on).toLocaleDateString() : "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "rounded-full font-bold border-none",
                      emp.status ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    )}>
                      {emp.status ? "Active" : "Suspended"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(emp)} className="rounded-xl hover:bg-primary/10 hover:text-primary">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => toggleStatus(emp.id)} 
                        className={cn("rounded-xl", emp.status ? "hover:bg-red-500/10 hover:text-red-500" : "hover:bg-green-500/10 hover:text-green-500")}
                        title={emp.status ? "Suspend Account" : "Activate Account"}
                      >
                        {emp.status ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default EmployeeManagementPage;
