import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronRight, 
  CheckCircle2, 
  Layout, 
  Users, 
  Settings as SettingsIcon,
  ShoppingBag,
  Database,
  BarChart3,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CommonService } from "@/service/commonservice.page";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PERMISSION_GROUPS = [
  {
    id: "platform",
    name: "Platform",
    icon: Layout,
    permissions: [
      { id: "view_dashboard", name: "Dashboard" }
    ]
  },
  {
    id: "pos_billing",
    name: "POS & Billing",
    icon: ShoppingBag,
    permissions: [
      { id: "access_pos", name: "POS Terminal" },
      { id: "manage_products", name: "Products" },
      { id: "manage_categories", name: "Categories" },
      { id: "manage_sizes", name: "Sizes" },
      { id: "view_customers", name: "Customers" },
      { id: "view_inventory", name: "Inventory" },
      { id: "access_invoices", name: "Invoice Center" },
      { id: "manage_roles", name: "User Roles" }
    ]
  },
  {
    id: "financial_management",
    name: "Financial Management",
    icon: Database,
    permissions: [
      { id: "manage_banks", name: "Bank Accounts" },
      { id: "manage_expense_categories", name: "Expense Master" },
      { id: "access_expenses", name: "Expenses" },
      { id: "view_ledger", name: "Customer Khata" }
    ]
  },
  {
    id: "analysis_reports",
    name: "Analysis & Reports",
    icon: BarChart3,
    permissions: [
      { id: "view_bill_profit", name: "Bill Profit" },
      { id: "view_pnl", name: "Business P&L" },
      { id: "view_item_profit", name: "Item Performance" },
      { id: "view_stock_summary", name: "Stock Valuation" },
      { id: "view_low_stock", name: "Low Stock" },
      { id: "view_category_report", name: "Category Report" },
      { id: "view_batch_report", name: "Batch Report" },
      { id: "view_serial_report", name: "Serial Report" }
    ]
  },
  {
    id: "settings",
    name: "System Settings",
    icon: SettingsIcon,
    permissions: [
      { id: "manage_employees", name: "Manage Employees" },
      { id: "system_config", name: "Store Settings" }
    ]
  }
];

const TenantRolesPage: React.FC = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [newRole, setNewRole] = useState({
    name: "",
    code: "",
    permissions: {} as Record<string, boolean>
  });

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await CommonService.GetAll("/tenant-role/List");
      setRoles(Array.isArray(res) ? res : (res.result || []));
    } catch (error) {
      toast.error("Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSaveRole = async () => {
    if (!newRole.name) {
      toast.error("Role name is required");
      return;
    }

    try {
      const data = {
        id: selectedRole?.id,
        name: newRole.name,
        code: newRole.code,
        permission: newRole.permissions
      };
      await CommonService.CommonPost(data, "/tenant-role/Save");
      toast.success(selectedRole ? "Role updated" : "Role created");
      setIsDialogOpen(false);
      resetForm();
      fetchRoles();
    } catch (error) {
      toast.error("Failed to save role");
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;
    try {
      await CommonService.CommonPost({ id }, "/tenant-role/Delete");
      toast.success("Role deleted");
      fetchRoles();
    } catch (error) {
      toast.error("Failed to delete role");
    }
  };

  const resetForm = () => {
    setSelectedRole(null);
    setNewRole({ name: "", code: "", permissions: {} });
  };

  const togglePermission = (permId: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permId]: !prev.permissions[permId]
      }
    }));
  };

  const openEditDialog = (role: any) => {
    setSelectedRole(role);
    setNewRole({
      name: role.name,
      code: role.code,
      permissions: role.permission || {}
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            Roles & Permissions
          </h1>
          <p className="text-muted-foreground mt-1">Define user roles and set granular access levels for your team.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl font-bold gap-2 shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" /> Create New Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-[32px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">
                {selectedRole ? "Edit Role" : "Create New Role"}
              </DialogTitle>
              <DialogDescription>
                Configure the name and access permissions for this role.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roleName" className="font-bold">Role Name</Label>
                  <Input 
                    id="roleName" 
                    placeholder="e.g. Senior Cashier" 
                    value={newRole.name}
                    onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                    className="rounded-xl h-12"
                    disabled={selectedRole?.store_id === null}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roleCode" className="font-bold">Role Code (Optional)</Label>
                  <Input 
                    id="roleCode" 
                    placeholder="e.g. SR_CASHIER" 
                    value={newRole.code || ""}
                    onChange={(e) => setNewRole({...newRole, code: e.target.value})}
                    className="rounded-xl h-12"
                    disabled={selectedRole?.store_id === null}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="font-bold text-lg">Permissions Matrix</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PERMISSION_GROUPS.map((group) => (
                    <Card key={group.id} className="rounded-2xl border-muted shadow-sm overflow-hidden group hover:border-primary/50 transition-colors">
                      <CardHeader className="bg-muted/30 py-3 px-4">
                        <div className="flex items-center gap-2">
                          <group.icon className="w-4 h-4 text-primary" />
                          <CardTitle className="text-sm font-black uppercase tracking-wider">{group.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3">
                        {group.permissions.map((perm) => (
                          <div key={perm.id} className="flex items-center space-x-3">
                            <Checkbox 
                              id={perm.id} 
                              checked={newRole.permissions[perm.id] || false}
                              onCheckedChange={() => togglePermission(perm.id)}
                            />
                            <label 
                              htmlFor={perm.id} 
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {perm.name}
                            </label>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl font-bold">Cancel</Button>
              <Button onClick={handleSaveRole} className="rounded-xl font-bold px-8">Save Role</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-64 rounded-[32px] bg-muted animate-pulse" />)
        ) : (
          roles
            .filter(role => role.code !== 'TENANT' && role.code !== 'USER')
            .map((role) => (
            <Card key={role.id} className="rounded-[32px] border-border shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden border-t-4 border-t-primary">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-black">{role.name}</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                      <Badge variant="outline" className="px-1 py-0 h-4 border-muted text-[8px]">{role.code}</Badge>
                      <span>•</span>
                      <span>{role.store_id ? "Custom Role" : "System Role"}</span>
                    </CardDescription>
                  </div>
                  {role.store_id ? (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(role)} className="rounded-full hover:bg-primary/10 hover:text-primary">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteRole(role.id)} className="rounded-full hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-500 font-bold border-none">ReadOnly</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Enabled Permissions</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(role.permission || {}).filter(([_, v]) => v).length > 0 ? (
                        Object.entries(role.permission || {})
                          .filter(([_, v]) => v)
                          .slice(0, 4)
                          .map(([k, _]) => (
                            <Badge key={k} variant="outline" className="rounded-lg text-[10px] font-medium border-muted capitalize">
                              {k.replace('_', ' ')}
                            </Badge>
                          ))
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No permissions set</p>
                      )}
                      {Object.entries(role.permission || {}).filter(([_, v]) => v).length > 4 && (
                        <Badge variant="outline" className="rounded-lg text-[10px] font-bold bg-muted border-none">
                          +{Object.entries(role.permission || {}).filter(([_, v]) => v).length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-muted flex items-center justify-end">
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TenantRolesPage;
