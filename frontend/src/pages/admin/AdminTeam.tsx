import { useState, useEffect } from "react";
import { CommonService } from "@/service/commonservice.page";
import { Settings, UserPlus, Search, ShieldAlert, Mail, MoreHorizontal, UserX, Trash2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export default function AdminTeam() {
    const { user } = useAuth();
    const [members, setMembers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [workspaces, setWorkspaces] = useState<any[]>([]);
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedTenant, setSelectedTenant] = useState("");
    const [selectedWorkspaces, setSelectedWorkspaces] = useState<string[]>([]);
    const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>([]);
    const [confirmAction, setConfirmAction] = useState<{ type: 'remove' | 'delete_invite', id: string } | null>(null);

    const isSuperAdmin = user?.role === "super_admin";
    const isWhitelabelAdmin = user?.role === "whitelabel_admin";
    const canSelectTenant = isSuperAdmin || isWhitelabelAdmin;

    useEffect(() => {
        fetchMembers();
        fetchRoles();
        fetchWorkspaces();
        fetchOrganizations();
        if (canSelectTenant) fetchTenants();
    }, [user, selectedTenant]);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const res = await CommonService.GetAll("/Team/Members");
            setMembers(res || []);
        } catch (error) {
            toast.error("Failed to fetch team members");
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await CommonService.GetAll("/UserRole/TeamRoles");
            setRoles(res?.data || res || []);
        } catch (error) {
            toast.error("Failed to load roles");
        }
    };

    const fetchWorkspaces = async () => {
        try {
            if (user?.activeOrganizationId) {
                const res = await CommonService.GetAll("/Workspace/organization/" + user.activeOrganizationId);
                setWorkspaces(res?.data || res || []);
            } else {
                // Fetch all workspaces for the tenant if no active org
                const res = await CommonService.GetAll("/Workspace");
                setWorkspaces(res?.data || res || []);
            }
        } catch (error) {
            console.error("Failed to load workspaces", error);
        }
    };

    const fetchOrganizations = async () => {
        try {
            const res = await CommonService.GetAll("/Organization" + (selectedTenant ? "?tenant_id=" + selectedTenant : ""));
            setOrganizations(res?.data || res || []);
        } catch (error) {
            console.error("Failed to load organizations", error);
        }
    };

    const fetchTenants = async () => {
        try {
            const res = await CommonService.GetAll("/admin/tenants");
            setTenants(res?.AddtionalData || res?.data || res || []);
        } catch (error) {
            console.error("Failed to load tenants", error);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const roleName = roles.find(r => r.id === selectedRole)?.name;
            const payload: any = {
                email: email,
                role_id: selectedRole,
                tenant_id: selectedTenant || user?.tenantId
            };

            if (roleName === "Workspace Admin") {
                payload.organization_ids = selectedOrganizations;
            } else {
                payload.workspace_ids = selectedWorkspaces;
            }

            await CommonService.CommonPost(payload, "/Team/Invite");
            toast.success("Invite sent successfully!");
            setIsInviteOpen(false);
            setEmail("");
            setSelectedRole("");
            setSelectedWorkspaces([]);
            setSelectedOrganizations([]);
            fetchMembers();
        } catch (error) {
            toast.error("Failed to send invite");
        }
    };

    const handleRemoveMember = async (id: string) => {
        setConfirmAction({ type: 'remove', id });
    };

    const performRemoveMember = async (id: string) => {
        try {
            await CommonService.CommonDelete(`/Team/Member/${id}`);
            toast.success("Member removed successfully");
            fetchMembers();
        } catch (error) {
            toast.error("Failed to remove member");
        }
    };

    const handleDeleteInvite = async (id: string) => {
        setConfirmAction({ type: 'delete_invite', id });
    };

    const performDeleteInvite = async (id: string) => {
        try {
            await CommonService.CommonDelete(`/Team/Invite/${id}`);
            toast.success("Invite deleted successfully");
            fetchMembers();
        } catch (error) {
            toast.error("Failed to delete invite");
        }
    };

    const handleResendInvite = async (id: string) => {
        try {
            await CommonService.CommonPost({}, `/Team/InviteResend/${id}`);
            toast.success("Invite resent successfully");
        } catch (error) {
            toast.error("Failed to resend invite");
        }
    };

    const filteredMembers = members.filter((m) => {
        const emailSearch = m.email?.toLowerCase().includes(search.toLowerCase());
        const nameSearch = m.first_name?.toLowerCase().includes(search.toLowerCase());
        return emailSearch || nameSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your team, invite members and configure roles across your active context.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setIsInviteOpen(true)} className="gap-2 glossy-button-primary rounded-full border-none whitespace-nowrap">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite Member
                    </Button>
                </div>
            </div>

            <Card className="glass-card">
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search team members..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 bg-white/40 dark:bg-white/5 border-[#f0e8e2]"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select>
                                <SelectTrigger className="w-[180px] bg-white/20 dark:bg-white/5 border-[#f0e8e2]">
                                    <SelectValue placeholder="All Roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    {roles.map(r => (
                                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-xl border border-[#f0e8e2] overflow-hidden bg-white/20 dark:bg-black/20">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-white/40 dark:bg-white/10 border-b border-[#f0e8e2]">
                                    <tr>
                                        <th className="px-6 py-4 font-bold text-black dark:text-white">Member</th>
                                        <th className="px-6 py-4 font-bold text-black dark:text-white">Role</th>
                                        <th className="px-6 py-4 font-bold text-black dark:text-white">Status</th>
                                        <th className="px-6 py-4 font-bold text-black dark:text-white">Joined On</th>
                                        <th className="px-6 py-4 font-bold text-right text-black dark:text-white">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center justify-center space-y-3">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                                    <p>Loading team members...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredMembers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center justify-center space-y-3">
                                                    <ShieldAlert className="h-10 w-10 text-muted-foreground/50" />
                                                    <p>No members found in this context.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredMembers.map((member) => (
                                            <tr key={member.id} className="border-b border-[#f0e8e2] hover:bg-white/30 dark:hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-9 w-9 rounded-full ${member.status === 'pending' ? 'bg-orange-500/20 text-orange-600 border-orange-500/30' : 'bg-primary/20 text-primary border-primary/30'} flex items-center justify-center font-medium border`}>
                                                            {member.first_name?.charAt(0) || "U"}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-foreground">
                                                                {member.first_name} {member.last_name}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">{member.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className="font-normal bg-white/50 dark:bg-black/50 border-white/30 truncate max-w-[150px]">
                                                        {member.role || "Member"}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {member.status === 'active' ? (
                                                        <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-400"></span>
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 text-xs font-medium text-orange-600 dark:text-orange-400">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-orange-600 dark:bg-orange-400 animate-pulse"></span>
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {member.joined_on ? new Date(member.joined_on).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                                <span className="sr-only">Open menu</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-[160px] glass-card border-[#f0e8e2]0">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator className="bg-white/20" />
                                                            {member.status === 'active' ? (
                                                                <>
                                                                    <DropdownMenuItem className="cursor-pointer">
                                                                        <Settings className="mr-2 h-4 w-4" />
                                                                        <span>Edit Role</span>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        className="text-destructive focus:text-destructive cursor-pointer"
                                                                        onClick={() => handleRemoveMember(member.user_id)}
                                                                    >
                                                                        <UserX className="mr-2 h-4 w-4" />
                                                                        <span>Remove</span>
                                                                    </DropdownMenuItem>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <DropdownMenuItem
                                                                        className="cursor-pointer"
                                                                        onClick={() => handleResendInvite(member.id)}
                                                                    >
                                                                        <RotateCw className="mr-2 h-4 w-4" />
                                                                        <span>Resend Invite</span>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        className="text-destructive focus:text-destructive cursor-pointer"
                                                                        onClick={() => handleDeleteInvite(member.id)}
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        <span>Cancel Invite</span>
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogContent className="sm:max-w-[480px] bg-background/98 backdrop-blur-2xl border-[#f0e8e2] shadow-2xl rounded-3xl overflow-hidden !fixed !top-1/2 !left-1/2 !-translate-x-1/2 !-translate-y-1/2 p-0">
                    <form onSubmit={handleInvite}>
                        <div className="px-8 pt-8 pb-4">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
                                    <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                        <Mail className="h-6 w-6 text-primary" />
                                    </div>
                                    Invite Team Member
                                </DialogTitle>
                                <DialogDescription className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
                                    Send an invitation email to add a new member to your current context.
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                        <div className="px-8 space-y-5 py-4">
                            {canSelectTenant && (
                                <div className="space-y-2">
                                    <Label htmlFor="tenant" className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 pl-1">Target Tenant</Label>
                                    <Select value={selectedTenant} onValueChange={setSelectedTenant} required>
                                        <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-[#f0e8e2] dark:border-slate-700 text-slate-900 dark:text-white">
                                            <SelectValue placeholder="Select a tenant" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-[#f0e8e2] dark:border-slate-800 bg-white dark:bg-slate-900">
                                            {tenants.map((t) => (
                                                <SelectItem key={t.id} value={t.id} className="rounded-xl mx-1">{t.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 pl-1">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="colleague@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-[#f0e8e2] dark:border-slate-700 focus:ring-2 focus:ring-violet-500/20 transition-all font-medium text-slate-900 dark:text-white"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 pl-1">Role</Label>
                                <Select value={selectedRole} onValueChange={setSelectedRole} required>
                                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-[#f0e8e2] dark:border-slate-700 text-slate-900 dark:text-white">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-[#f0e8e2] dark:border-slate-800 bg-white dark:bg-slate-900">
                                        {roles.map((r) => (
                                            <SelectItem key={r.id} value={r.id} className="rounded-xl mx-1">{r.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-4">
                                {selectedRole && (
                                    roles.find(r => r.id === selectedRole)?.name === "Workspace Admin" ? (
                                        <>
                                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 pl-1">Assign to Organizations</Label>
                                            <div className="grid gap-2 mt-1 max-h-[160px] overflow-y-auto p-3 border border-[#f0e8e2] dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 scrollbar-premium">
                                                {organizations.map((org) => (
                                                    <div key={org.id} className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white dark:hover:bg-white/5 transition-all">
                                                        <input
                                                            type="checkbox"
                                                            id={`org-${org.id}`}
                                                            checked={selectedOrganizations.includes(org.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedOrganizations([...selectedOrganizations, org.id]);
                                                                } else {
                                                                    setSelectedOrganizations(selectedOrganizations.filter(id => id !== org.id));
                                                                }
                                                            }}
                                                            className="h-5 w-5 rounded-md border-slate-300 text-violet-600 focus:ring-violet-500 transition-colors cursor-pointer"
                                                        />
                                                        <Label htmlFor={`org-${org.id}`} className="text-sm font-semibold cursor-pointer truncate flex-1 text-slate-700 dark:text-slate-200">
                                                            {org.name}
                                                        </Label>
                                                    </div>
                                                ))}
                                                {organizations.length === 0 && (
                                                    <p className="text-xs text-muted-foreground italic p-2 text-center">No organizations available.</p>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 pl-1">Assign to Workspaces</Label>
                                            <div className="grid gap-2 mt-1 max-h-[160px] overflow-y-auto p-3 border border-[#f0e8e2] dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 scrollbar-premium">
                                                {workspaces.map((ws) => (
                                                    <div key={ws.id} className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white dark:hover:bg-white/5 transition-all">
                                                        <input
                                                            type="checkbox"
                                                            id={`ws-${ws.id}`}
                                                            checked={selectedWorkspaces.includes(ws.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedWorkspaces([...selectedWorkspaces, ws.id]);
                                                                } else {
                                                                    setSelectedWorkspaces(selectedWorkspaces.filter(id => id !== ws.id));
                                                                }
                                                            }}
                                                            className="h-5 w-5 rounded-md border-slate-300 text-violet-600 focus:ring-violet-500 transition-colors cursor-pointer"
                                                        />
                                                        <Label htmlFor={`ws-${ws.id}`} className="text-sm font-semibold cursor-pointer truncate flex-1 text-slate-700 dark:text-slate-200">
                                                            {ws.name}
                                                        </Label>
                                                    </div>
                                                ))}
                                                {workspaces.length === 0 && (
                                                    <p className="text-xs text-muted-foreground italic p-2 text-center">No workspaces available.</p>
                                                )}
                                            </div>
                                        </>
                                    )
                                )}
                            </div>
                        </div>
                        <div className="px-8 pb-8 pt-4">
                            <DialogFooter className="flex-row gap-3">
                                <Button type="button" variant="cancel" className="flex-1 h-12 rounded-xl font-bold" onClick={() => setIsInviteOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-[1.5] h-12 rounded-xl gap-2 glossy-button-primary rounded-full border-none whitespace-nowrap shadow-xl">
                                    <Mail className="h-4 w-4" />
                                    Send Invite
                                </Button>
                            </DialogFooter>
                        </div>

                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirmAction?.type === 'remove' ? "Remove Team Member?" : "Cancel Invitation?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmAction?.type === 'remove'
                                ? "Are you sure you want to remove this member from your team? This will revoke their access to all associated workspaces."
                                : "Are you sure you want to cancel this invitation? The invite link will become invalid."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (confirmAction) {
                                    if (confirmAction.type === 'remove') performRemoveMember(confirmAction.id);
                                    else performDeleteInvite(confirmAction.id);
                                    setConfirmAction(null);
                                }
                            }}
                        >
                            {confirmAction?.type === 'remove' ? "Remove Member" : "Cancel Invite"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

