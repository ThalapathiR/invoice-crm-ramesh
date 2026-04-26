import { useState, useEffect } from "react";
import { CommonService } from "@/service/commonservice.page";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { LogoLoader } from "@/components/ui/LogoLoader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    ClipboardList, Search, Filter, Eye, Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AdminAuditLog() {
    const { toast } = useToast();
    const [logs, setLogs] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [total, setTotal] = useState(0);

    // Filters
    const [filters, setFilters] = useState({
        take: 20,
        skip: 0,
        keyword: "",
        action: "",
        user_id: "0",
        module: "",
        start_date: "",
        end_date: "",
    });

    const [selectedLog, setSelectedLog] = useState<any>(null);
    const [details, setDetails] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchLogs(true);
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await CommonService.GetAll("/User/List");
            setUsers(Array.isArray(res) ? res : []);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        }
    };

    const fetchLogs = async (refresh = false) => {
        if (refresh) setLoading(true);
        else setLoadingMore(true);

        const currentSkip = refresh ? 0 : filters.skip;
        const payload = { ...filters, skip: currentSkip };

        try {
            const res = await CommonService.CommonPost(payload, "/AuditLog/LazyLoadList");
            if (res.Type === "Error") throw new Error(res.Message);

            const newLogs = Array.isArray(res.data) ? res.data : [];
            if (refresh) {
                setLogs(newLogs);
            } else {
                setLogs(prev => [...prev, ...newLogs]);
            }
            setTotal(res.total_record || 0);
        } catch (err: any) {
            console.error("Fetch logs failed:", err);
            toast({ title: "Failed to load audit logs", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value, skip: 0 }));
    };

    const applyFilters = () => {
        fetchLogs(true);
    };

    const loadMore = () => {
        const nextSkip = logs.length;
        setFilters(prev => ({ ...prev, skip: nextSkip }));
        // Using setFilters with callback is async, so we use the value directly for fetch
    };

    // Trigger fetch when skip changes (for load more)
    useEffect(() => {
        if (filters.skip > 0) {
            fetchLogs(false);
        }
    }, [filters.skip]);

    const viewDetails = async (log: any) => {
        setSelectedLog(log);
        setLoadingDetails(true);
        setDetails(null);
        try {
            const res = await CommonService.CommonPost(log, "/AuditLog/DetailList");
            setDetails(res);
        } catch (err) {
            console.error("Failed to fetch details:", err);
            toast({ title: "Failed to load details", variant: "destructive" });
        } finally {
            setLoadingDetails(false);
        }
    };

    const actionColors: Record<string, string> = {
        Insert: "bg-green-500/10 text-green-600 border-green-500/20",
        Update: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        Delete: "bg-red-500/10 text-red-600 border-red-500/20",
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 p-1">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1">
                <h1 className="text-3xl font-extrabold tracking-tight">
                    System Audit Trail
                </h1>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Monitor system orchestration, security events, and administrative actions across the platform.
                </p>
            </motion.div>

            {/* Advanced Filters */}
            <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border-[#f0e8e2] dark:border-[#f0e8e2] shadow-xl shadow-black/5 rounded-[32px] py-4">
                <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 items-end">
                        <div className="space-y-2.5">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Search Module</Label>
                            <div className="relative group mt-2">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-primary" />
                                <Input
                                    placeholder="e.g. user, tenant"
                                    className="h-12 pl-11 rounded-xl border-[#f0e8e2] dark:border-[#f0e8e2] bg-slate-50 dark:bg-slate-800/50 focus-visible:ring-primary/20 transition-all font-medium"
                                    value={filters.keyword}
                                    onChange={(e) => handleFilterChange("keyword", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Action Type</Label>
                            <Select value={filters.action} onValueChange={(v) => handleFilterChange("action", v)}>
                                <SelectTrigger className="mt-2 h-12 rounded-xl border-[#f0e8e2] dark:border-[#f0e8e2] bg-slate-50 dark:bg-slate-800/50 transition-all font-medium">
                                    <SelectValue placeholder="All Actions" />
                                </SelectTrigger>
                                <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-[#f0e8e2] dark:border-[#f0e8e2]">
                                    <SelectItem value="all">All Actions</SelectItem>
                                    <SelectItem value="Insert">Insert</SelectItem>
                                    <SelectItem value="Update">Update</SelectItem>
                                    <SelectItem value="Delete">Delete</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Principal User</Label>
                            <Select value={filters.user_id} onValueChange={(v) => handleFilterChange("user_id", v)}>
                                <SelectTrigger className="mt-2 h-12 rounded-xl border-[#f0e8e2] dark:border-[#f0e8e2] bg-slate-50 dark:bg-slate-800/50 transition-all font-medium">
                                    <SelectValue placeholder="All Users" />
                                </SelectTrigger>
                                <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-[#f0e8e2] dark:border-[#f0e8e2]">
                                    <SelectItem value="0">All Users</SelectItem>
                                    {users.map(u => (
                                        <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName || u.email}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Begin Date</Label>
                            <Input
                                type="date"
                                className="mt-2 h-12 rounded-xl border-[#f0e8e2] dark:border-[#f0e8e2] bg-slate-50 dark:bg-slate-800/50 transition-all font-medium px-4"
                                value={filters.start_date}
                                onChange={(e) => handleFilterChange("start_date", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Final Date</Label>
                            <Input
                                type="date"
                                className="mt-2 h-12 rounded-xl border-[#f0e8e2] dark:border-[#f0e8e2] bg-slate-50 dark:bg-slate-800/50 transition-all font-medium px-4"
                                value={filters.end_date}
                                onChange={(e) => handleFilterChange("end_date", e.target.value)}
                            />
                        </div>

                        <Button
                            className="h-12 w-full bg-primary border border-primary-border min-h-9 px-4 py-2 gap-2 bg-gradient-to-r from-primary to-accent rounded-full gap-2 px-6 shadow-xl shadow-red-500/20 hover:shadow-2xl hover:shadow-red-500/40 transition-all duration-300 font-bold uppercase tracking-widest text-xs"
                            onClick={applyFilters}
                        >
                            <Filter className="h-4 w-4" /> Apply Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border-[#f0e8e2] dark:border-[#f0e8e2] shadow-xl shadow-black/5 rounded-[32px]">
                    <CardContent className="p-0">
                        <div className="relative overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-[#f0e8e2]">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="w-[180px] text-black dark:text-white text-[10px] font-bold uppercase tracking-widest py-5 pl-8">Timestamp</TableHead>
                                        <TableHead className="text-black dark:text-white text-[10px] font-bold uppercase tracking-widest py-5">Principal User</TableHead>
                                        <TableHead className="text-black dark:text-white text-[10px] font-bold uppercase tracking-widest py-5">Global Action</TableHead>
                                        <TableHead className="text-black dark:text-white text-[10px] font-bold uppercase tracking-widest py-5">System Module</TableHead>
                                        <TableHead className="text-black dark:text-white text-[10px] font-bold uppercase tracking-widest py-5">Entity ID</TableHead>
                                        <TableHead className="text-black dark:text-white text-[10px] font-bold uppercase tracking-widest py-5">Network IP</TableHead>
                                        <TableHead className="text-right text-black dark:text-white text-[10px] font-bold uppercase tracking-widest py-5 pr-8">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.map((log, i) => (
                                        <TableRow key={i} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all duration-300 border-b border-slate-100 dark:border-[#f0e8e2] last:border-none">
                                            <TableCell className="text-[11px] font-black text-slate-400 dark:text-slate-500 pl-8">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3 w-3" />
                                                    {log.performed_on}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold border border-[#f0e8e2]/50 dark:border-[#f0e8e2] shadow-inner">
                                                        {log.performed_by?.charAt(0) || "U"}
                                                    </div>
                                                    <span className="font-bold text-xs text-slate-700 dark:text-slate-300">{log.performed_by}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-widest border-none h-6 px-3 rounded-full shadow-sm", actionColors[log.performed_action])}>
                                                    {log.performed_action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="capitalize text-xs font-bold text-slate-600 dark:text-slate-400">
                                                {log.performed_type?.replace(/_/g, " ")}
                                            </TableCell>
                                            <TableCell className="text-[10px] font-bold text-slate-400">
                                                {log.performed_module_id?.slice(0, 8)}...
                                            </TableCell>
                                            <TableCell className="text-[11px] font-bold text-slate-400">
                                                {log.performed_ipaddress || "0.0.0.0"}
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg hover:shadow-black/5 transition-all opacity-0 group-hover:opacity-100"
                                                    onClick={() => viewDetails(log)}
                                                >
                                                    <Eye className="h-4 w-4 text-slate-400" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {loading && (
                            <div className="p-20 text-center animate-pulse">
                                <LogoLoader />
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mt-8">Decrypting audit trail...</p>
                            </div>
                        )}

                        {!loading && logs.length === 0 && (
                            <div className="p-32 text-center">
                                <div className="h-20 w-20 rounded-[32px] bg-slate-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-8 shadow-inner">
                                    <ClipboardList className="h-10 w-10 text-slate-200 dark:text-white/10" />
                                </div>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No audit logs identified</p>
                                <p className="text-xs font-medium text-slate-500 mt-2">Adjust your filters to scan a different range.</p>
                            </div>
                        )}

                        {logs.length < total && !loading && (
                            <div className="p-10 border-t border-slate-100 dark:border-[#f0e8e2] text-center">
                                <Button
                                    variant="outline"
                                    className="h-12 rounded-full px-12 border-[#f0e8e2] dark:border-[#f0e8e2] hover:bg-slate-50 dark:hover:bg-white/5 font-bold uppercase tracking-widest text-[10px] transition-all shadow-inner"
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? "Synchronizing..." : `Scan More (${total - logs.length} remaining)`}
                                </Button>
                            </div>
                        )}

                        {!loading && logs.length > 0 && logs.length >= total && (
                            <div className="p-8 text-center border-t border-slate-100 dark:border-[#f0e8e2] bg-slate-50/50 dark:bg-white/[0.01]">
                                <p className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase">SYSTEM TRAIL COMPLETE • {total} RECORDS SECURED</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Detail Dialog */}
            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="flex flex-col p-0 bg-background/98 backdrop-blur-2xl border-[#f0e8e2] max-w-4xl max-h-[90vh] overflow-hidden rounded-[40px] shadow-2xl shadow-black/60 !fixed !top-1/2 !left-1/2 !-translate-x-1/2 !-translate-y-1/2">
                    <DialogHeader className="p-10 pb-6 bg-gradient-to-br from-red-500/5 to-transparent border-b border-slate-100 dark:border-[#f0e8e2]">
                        <div className="flex items-center gap-6">
                            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner group/icon transition-all", selectedLog && actionColors[selectedLog.performed_action])}>
                                <ClipboardList className="h-7 w-7 group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                    Activity Analytics
                                </DialogTitle>
                                <DialogDescription className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                                    Detailed property changes and system snapshot
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-premium">
                        {loadingDetails ? (
                            <div className="py-20 text-center animate-pulse">
                                <LogoLoader />
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mt-8">Assembling audit data...</p>
                            </div>
                        ) : (details && selectedLog) ? (
                            <div className="space-y-10">
                                {/* Info Strip */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mx-3">Action Type</Label>
                                        <Badge variant="outline" className={cn("text-[10px] font-black uppercase tracking-widest border-none h-7 px-4 rounded-full shadow-sm w-fit", selectedLog ? actionColors[selectedLog.performed_action] : "")}>
                                            {selectedLog?.performed_action}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Principal User</Label>
                                        <p className="font-extrabold text-sm text-slate-700 dark:text-slate-200 ml-1">{selectedLog?.performed_by}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">System Module</Label>
                                        <p className="font-extrabold text-sm text-slate-700 dark:text-slate-200 ml-1 capitalize">{selectedLog?.performed_type?.replace(/_/g, " ")}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Network Origin</Label>
                                        <p className="font-bold text-xs text-slate-500 ml-1">{selectedLog?.performed_ipaddress || "0.0.0.0"}</p>
                                    </div>
                                </div>

                                {/* Event Timeline Style */}
                                <div className="space-y-5">
                                    <div className="flex items-center justify-between px-1">
                                        <Label className="text-[11px] font-bold uppercase tracking-widest text-red-500 dark:text-red-400">Deep Change Log</Label>
                                        <Badge className="bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-none text-[9px] font-black uppercase tracking-widest">
                                            {details.audit_log_events?.length || 0} Events
                                        </Badge>
                                    </div>
                                    <div className="space-y-4">
                                        {details.audit_log_events?.map((ev: string, idx: number) => (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                key={idx}
                                                className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-[#f0e8e2] shadow-sm group hover:shadow-md transition-all"
                                            >
                                                <div className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: ev }} />
                                            </motion.div>
                                        ))}
                                        {(!details.audit_log_events || details.audit_log_events.length === 0) && (
                                            <div className="p-8 rounded-[32px] bg-slate-50 dark:bg-white/[0.01] border border-dashed border-[#f0e8e2] dark:border-[#f0e8e2] text-center">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">No detailed property transformations identified.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Raw Parameters */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Technical Context Snapshot</Label>
                                        <Badge className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-none px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl shadow-black/20">
                                            JSON Output
                                        </Badge>
                                    </div>
                                    <div className="rounded-[32px] bg-slate-950 dark:bg-black p-8 border border-[#f0e8e2] text-[10px] leading-relaxed overflow-x-auto shadow-2xl relative group/code">
                                        <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary/50 animate-pulse" />
                                        <pre className="text-slate-300 whitespace-pre-wrap font-bold">
                                            {JSON.stringify(selectedLog?.performed_parameter, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <DialogFooter className="p-8 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-[#f0e8e2]">
                        <Button
                            variant="ghost"
                            className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all shadow-inner"
                            onClick={() => setSelectedLog(null)}
                        >
                            Deactivate Viewer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
