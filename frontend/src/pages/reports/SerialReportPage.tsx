import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { AnalyticsService } from '@/service/analytics.service';
import { Button } from '@/components/ui/button';
import { RefreshCw, Hash, ShieldCheck, Tag, FileText } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SerialReportPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const storeId = (user as any)?.company?.id;
      const res = await AnalyticsService.GetSerialReport(storeId);
      setData(res);
    } catch (err) {
      toast.error("Failed to fetch serial report");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_STOCK': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'SOLD': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'RETURNED': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default: return 'bg-slate-800 text-slate-400 border border-slate-700';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="page-header-brand flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Unique Serial Tracker</h1>
          <p className="text-blue-100/80 font-medium">Individual item tracking for premium inventory and warranty management</p>
        </div>
        <Button variant="outline" size="icon" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl" onClick={fetchData}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-[32px] p-8 border border-border shadow-sm flex items-center gap-6">
          <div className="h-16 w-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 shrink-0">
            <Hash size={32} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-500">Total Tracked Serials</p>
            <h3 className="text-4xl font-black text-white">{data.length}</h3>
          </div>
        </div>

        <div className="bg-card rounded-[32px] p-8 border border-border shadow-sm flex items-center gap-6">
          <div className="h-16 w-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 shrink-0">
            <Tag size={32} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-500">Available in Stock</p>
            <h3 className="text-4xl font-black text-emerald-400">{data.filter(s => s.status === 'IN_STOCK').length}</h3>
          </div>
        </div>

        <div className="bg-card rounded-[32px] p-8 border border-border shadow-sm flex items-center gap-6">
          <div className="h-16 w-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 shrink-0">
            <ShieldCheck size={32} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-500">Total Sold</p>
            <h3 className="text-4xl font-black text-blue-400">{data.filter(s => s.status === 'SOLD').length}</h3>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-900/50">
            <TableRow className="hover:bg-transparent border-slate-800">
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 pl-6">Serial Number</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4">Product</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 text-center">Status</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 pr-6">Linked Document</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground">Scanning serial registry...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground">No serialized items found</TableCell></TableRow>
            ) : (
              data.map((s) => (
                <TableRow key={s.id} className="hover:bg-white/5 border-slate-800 transition-colors">
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-2 font-black text-white">
                      <Hash size={14} className="text-slate-500" />
                      {s.serial_number}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 font-bold text-slate-400">{s.product?.name}</TableCell>
                  <TableCell className="text-center py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(s.status)}`}>
                      {s.status}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 pr-6">
                    {s.invoice ? (
                      <div className="flex items-center gap-2 text-xs font-black text-blue-400">
                        <FileText size={14} />
                        {s.invoice.invoice_number}
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-500">—</span>
                    )}
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

export default SerialReportPage;
