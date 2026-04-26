import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Search,
    RefreshCw,
    Calendar,
    User,
    Key,
    Activity,
    ChevronLeft,
    ChevronRight,
    Eye,
    AlertCircle,
    Globe,
    Terminal,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CommonService } from "@/service/commonservice.page";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth";

export default function AdminErrorLog() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [pageIndex, setPageIndex] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [committedSearch, setCommittedSearch] = useState("");
    const [dateRange, setDateRange] = useState({
        start: format(new Date(new Date().setDate(new Date().getDate() - 7)), "yyyy-MM-dd"),
        end: format(new Date(), "yyyy-MM-dd"),
    });
    const [committedDateRange, setCommittedDateRange] = useState(dateRange);

    const [selectedLog, setSelectedLog] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await CommonService.CommonPost(
                {
                    take: pageSize,
                    skip: pageIndex * pageSize,
                    keyword: committedSearch,
                    user_id: "0", // Default to all users
                    start_date: committedDateRange.start,
                    end_date: committedDateRange.end,
                },
                "/ErrorLog/LazyLoadList"
            );
            if (res && res.data) {
                setLogs(res.data);
                setTotal(res.total || 0);
            }
        } catch (error) {
            console.error("Failed to fetch error logs:", error);
        } finally {
            setLoading(false);
        }
    }, [pageSize, pageIndex, committedSearch, committedDateRange]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPageIndex(0);
        setCommittedSearch(searchTerm);
        setCommittedDateRange(dateRange);
    };

    const handleViewDetails = (log: any) => {
        setSelectedLog(log);
        setIsDialogOpen(true);
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="space-y-8 animate-in fade-in duration-700 p-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1">
                    <h1 className="text-3xl font-extrabold tracking-tight">
                        System Error Logs
                    </h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Monitor and debug platform-level exceptions and errors across the infrastructure.
                    </p>
                </motion.div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchLogs()}
                        disabled={loading}
                        className="rounded-xl border-[#f0e8e2] hover:bg-white/10"
                    >
                        <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                        Refresh
                    </Button>
                </div>
            </div>

            <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border-[#f0e8e2] dark:border-[#f0e8e2] shadow-xl shadow-black/5 rounded-[32px]">
                <CardContent className="p-8">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-4">
                        <div className="space-y-2.5">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Search Errors</Label>
                            <div className="relative group mt-2">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-primary" />
                                <Input
                                    placeholder="Message, URL, ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-12 pl-11 rounded-xl border-[#f0e8e2] dark:border-[#f0e8e2] bg-slate-50 dark:bg-slate-800/50 focus-visible:ring-primary/20 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Begin Date</Label>
                            <div className="relative group mt-2">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-primary" />
                                <Input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                    className="h-12 pl-11 rounded-xl border-[#f0e8e2] dark:border-[#f0e8e2] bg-slate-50 dark:bg-slate-800/50 focus-visible:ring-primary/20 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Final Date</Label>
                            <div className="relative group mt-2">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-primary" />
                                <Input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                    className="h-12 pl-11 rounded-xl border-[#f0e8e2] dark:border-[#f0e8e2] bg-slate-50 dark:bg-slate-800/50 focus-visible:ring-primary/20 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="flex items-end">
                            <Button type="submit" className="h-12 w-full bg-primary border border-primary-border min-h-9 px-4 py-2 gap-2 bg-gradient-to-r from-primary to-accent rounded-full gap-2 px-6">
                                Apply Filters
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border-[#f0e8e2] dark:border-[#f0e8e2] shadow-xl shadow-black/5 rounded-[32px]">
                <CardContent className="p-0">
                    <div className="relative overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-[#f0e8e2]">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="w-[180px] text-[10px] font-bold uppercase tracking-widest text-black dark:text-white py-5 pl-8">Timestamp</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white py-5">Origin User</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white py-5">Endpoint URL</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white py-5">Network IP</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white py-5">Exception Detail</TableHead>
                                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-black dark:text-white py-5 pr-8">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i} className="animate-pulse">
                                            <TableCell><div className="h-4 w-32 bg-muted rounded-lg" /></TableCell>
                                            <TableCell><div className="h-4 w-24 bg-muted rounded-lg" /></TableCell>
                                            <TableCell><div className="h-4 w-40 bg-muted rounded-lg" /></TableCell>
                                            <TableCell><div className="h-4 w-28 bg-muted rounded-lg" /></TableCell>
                                            <TableCell><div className="h-4 w-48 bg-muted rounded-lg" /></TableCell>
                                            <TableCell className="text-right"><div className="h-8 w-8 ml-auto bg-muted rounded-lg" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <div className="p-4 rounded-full bg-primary/5 text-primary/40">
                                                    <Activity className="h-10 w-10" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-semibold text-foreground">No error logs found</p>
                                                    <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                                                        No exceptions have been logged within the selected criteria.
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all duration-300 border-b border-slate-100 dark:border-[#f0e8e2] last:border-none">
                                            <TableCell className="text-[11px] font-black text-slate-400 dark:text-slate-500 pl-8">
                                                {format(new Date(log.created_on), "MMM d, HH:mm:ss")}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-[#f0e8e2]/50 dark:border-[#f0e8e2]">
                                                        <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                                    </div>
                                                    <span className="font-bold text-xs text-slate-700 dark:text-slate-300">{log.created_by_name || "System Orchestrator"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate">
                                                <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 py-0.5 px-2 rounded-lg border-none">
                                                    {log.url || "N/A"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-[11px] font-bold text-slate-400">
                                                {log.ipaddress || "0.0.0.0"}
                                            </TableCell>
                                            <TableCell className="max-w-[300px] truncate text-xs font-bold text-red-500/80 group-hover:text-red-500 transition-colors">
                                                {log.message}
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleViewDetails(log)}
                                                    className="h-9 w-9 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg hover:shadow-black/5 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Eye className="h-4 w-4 text-slate-400" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>

                {/* Pagination Section */}
                {total > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-[#f0e8e2] gap-4">
                        <div className="text-xs text-muted-foreground font-medium">
                            Showing <span className="text-foreground">{Math.min(total, pageIndex * pageSize + 1)}</span> to{" "}
                            <span className="text-foreground">{Math.min(total, (pageIndex + 1) * pageSize)}</span> of{" "}
                            <span className="text-foreground font-bold">{total}</span> entries
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground whitespace-nowrap">Rows</Label>
                                <Select
                                    value={pageSize.toString()}
                                    onValueChange={(v) => {
                                        setPageSize(parseInt(v));
                                        setPageIndex(0);
                                    }}
                                >
                                    <SelectTrigger className="h-8 w-16 rounded-lg border-[#f0e8e2] bg-transparent text-xs font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-[#f0e8e2]">
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg border-[#f0e8e2] hover:bg-white/10"
                                    onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
                                    disabled={pageIndex === 0}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                    let pageNum = pageIndex;
                                    if (totalPages > 5) {
                                        if (pageIndex < 2) pageNum = i;
                                        else if (pageIndex > totalPages - 3) pageNum = totalPages - 5 + i;
                                        else pageNum = pageIndex - 2 + i;
                                    } else {
                                        pageNum = i;
                                    }

                                    return (
                                        <Button
                                            key={i}
                                            variant={pageIndex === pageNum ? "default" : "outline"}
                                            className={cn(
                                                "h-8 w-8 rounded-lg text-xs font-bold transition-all",
                                                pageIndex === pageNum
                                                    ? "bg-primary shadow-lg shadow-primary/30 border-none px-0"
                                                    : "border-[#f0e8e2] hover:bg-white/10 px-0"
                                            )}
                                            onClick={() => setPageIndex(pageNum)}
                                        >
                                            {pageNum + 1}
                                        </Button>
                                    );
                                })}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg border-[#f0e8e2] hover:bg-white/10"
                                    onClick={() => setPageIndex(Math.min(totalPages - 1, pageIndex + 1))}
                                    disabled={pageIndex >= totalPages - 1}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="p-0 bg-background/98 backdrop-blur-2xl border-[#f0e8e2] max-w-4xl max-h-[90vh] overflow-hidden rounded-[40px] shadow-2xl shadow-black/60">
                    <DialogHeader className="p-10 pb-6 bg-gradient-to-br from-red-500/5 to-transparent border-b border-slate-100 dark:border-[#f0e8e2]">
                        <div className="flex items-center gap-6">
                            <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-600 shadow-inner group/icon transition-all">
                                <AlertCircle className="h-7 w-7 group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                    Error Log Detail
                                </DialogTitle>
                                {/* <DialogDescription className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                                    Detailed stack trace and environment metadata
                                </DialogDescription> */}
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-premium">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2.5">
                                        <Terminal className="h-4 w-4 text-slate-300" /> Primary Message
                                    </Label>
                                    <p className="font-bold text-xl leading-snug text-slate-900 dark:text-white">{selectedLog?.message}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2.5">
                                        <Globe className="h-4 w-4 text-slate-300" /> System Routing
                                    </Label>
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-[#f0e8e2]">
                                        <p className="text-xs font-bold text-slate-500 break-all leading-relaxed uppercase">{selectedLog?.url || "CORE ENGINE"}</p>
                                    </div>
                                </div>
                            </div>

                            <Card className="bg-slate-50 dark:bg-black/20 border-[#f0e8e2] dark:border-[#f0e8e2] rounded-3xl shadow-inner">
                                <CardContent className="p-8 grid grid-cols-2 gap-8">
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pt-4">Timestamp</p>
                                        <p className="font-black text-xs text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                                            {selectedLog?.created_on && format(new Date(selectedLog.created_on), "PPP p")}
                                        </p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pt-4">Auth Profile</p>
                                        <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-widest h-5 px-2">
                                            {selectedLog?.created_by_name || "System"}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Public IP</p>
                                        <p className="font-bold text-[11px] text-slate-700 dark:text-slate-300">{selectedLog?.ipaddress || "0.0.0.0"}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">System Trace ID</p>
                                        <p className="font-bold text-[10px] text-slate-400 dark:text-slate-500 uppercase">{selectedLog?.id}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Full Error Description</Label>
                                <Badge className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-none px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl shadow-black/20">
                                    Structured Output
                                </Badge>
                            </div>
                            <div className="rounded-[32px] bg-slate-950 dark:bg-black p-8 border border-[#f0e8e2] text-xs leading-relaxed overflow-x-auto shadow-2xl relative group/code">
                                <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-red-500/50 animate-pulse" />
                                <pre className="text-slate-300 whitespace-pre-wrap font-bold">{selectedLog?.message}</pre>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-8 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-[#f0e8e2]">
                        <Button
                            variant="ghost"
                            onClick={() => setIsDialogOpen(false)}
                            className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all shadow-inner"
                        >
                            Close Viewer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

