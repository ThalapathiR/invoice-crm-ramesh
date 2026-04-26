import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { AnalyticsService } from '@/service/analytics.service';
import { Button } from '@/components/ui/button';
import { RefreshCw, Box, Calendar, DollarSign, Package } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const BatchReportPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const storeId = (user as any)?.company?.id;
      const res = await AnalyticsService.GetBatchReport(storeId);
      setData(res);
    } catch (err) {
      toast.error("Failed to fetch batch report");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="page-header-brand flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Batch Tracking (FIFO)</h1>
          <p className="text-blue-100/80 font-medium">Inventory segmented by purchase lots and individual cost prices</p>
        </div>
        <Button variant="outline" size="icon" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl" onClick={fetchData}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-[32px] p-8 border border-border shadow-sm flex items-center gap-6">
          <div className="h-16 w-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 shrink-0">
            <Box size={32} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-500">Active Batches</p>
            <h3 className="text-4xl font-black text-white">{data.filter(b => b.current_quantity > 0).length}</h3>
          </div>
        </div>

        <div className="bg-card rounded-[32px] p-8 border border-border shadow-sm flex items-center gap-6">
          <div className="h-16 w-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400 shrink-0">
            <Package size={32} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-500">Total Stock in Batches</p>
            <h3 className="text-4xl font-black text-white">{data.reduce((sum, b) => sum + b.current_quantity, 0).toLocaleString()}</h3>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-900/50">
            <TableRow className="hover:bg-transparent border-slate-800">
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 pl-6">Product / Batch #</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4">Purchase Date</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 text-right">Cost Price</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 text-center">Qty (Initial / Rem)</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 text-right pr-6">Value (Rem)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground">Retrieving batch data...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground">No batches found</TableCell></TableRow>
            ) : (
              data.map((batch) => (
                <TableRow key={batch.id} className={`hover:bg-white/5 border-slate-800 transition-colors ${batch.current_quantity === 0 ? 'opacity-40 grayscale' : ''}`}>
                  <TableCell className="py-4 pl-6">
                    <div className="font-black text-white">{batch.product?.name}</div>
                    <div className="inline-flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-black text-slate-400 mt-1">
                      BATCH: {batch.batch_number}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Calendar size={14} className="text-slate-500" />
                      {format(new Date(batch.purchase_date), 'dd MMM yyyy')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-4 font-bold text-white">₹{batch.cost_price.toLocaleString()}</TableCell>
                  <TableCell className="text-center py-4">
                    <div className="text-[10px] font-black text-slate-500">{batch.initial_quantity} TOTAL</div>
                    <div className={`text-sm font-black ${batch.current_quantity > 0 ? 'text-blue-400' : 'text-slate-500'}`}>
                      {batch.current_quantity} LEFT
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6 py-4 font-black text-white">
                    ₹{(batch.current_quantity * batch.cost_price).toLocaleString()}
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

export default BatchReportPage;
