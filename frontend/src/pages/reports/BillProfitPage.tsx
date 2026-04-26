import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { AnalyticsService } from '@/service/analytics.service';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, FileText, TrendingUp, TrendingDown } from 'lucide-react';
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
import { Input } from '@/components/ui/input';

const BillProfitPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState(format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const storeId = (user as any)?.company?.id;
      const res = await AnalyticsService.GetBillWiseProfit(storeId, startDate, endDate);
      setData(res);
    } catch (err) {
      toast.error("Failed to fetch bill-wise profit");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user, startDate, endDate]);

  const totalProfit = data.reduce((sum, item) => sum + item.profit, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="page-header-brand flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Bill Profit Analysis</h1>
          <p className="text-blue-100/80 font-medium">Detailed profit calculation for every independent bill</p>
        </div>
        <div className="flex gap-2 bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/10">
          <Input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-transparent border-none text-white font-bold h-10 w-40 [color-scheme:dark]"
          />
          <div className="flex items-center text-white/40 font-black">TO</div>
          <Input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-transparent border-none text-white font-bold h-10 w-40 [color-scheme:dark]"
          />
          <Button variant="outline" size="icon" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl" onClick={fetchData}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-[32px] p-8 border border-border shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-slate-400">
            <FileText size={80} />
          </div>
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2">Total Bills</p>
          <h3 className="text-4xl font-black text-white">{data.length}</h3>
        </div>
        
        <div className="bg-card rounded-[32px] p-8 border border-border shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-slate-400">
            <TrendingUp size={80} />
          </div>
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2">Cumulative Profit</p>
          <h3 className={`text-4xl font-black ${totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ₹{totalProfit.toLocaleString()}
          </h3>
        </div>

        <div className="bg-card rounded-[32px] p-8 border border-border shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-slate-400">
            <TrendingUp size={80} />
          </div>
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2">Avg Profit per Bill</p>
          <h3 className="text-4xl font-black text-white">
            ₹{data.length > 0 ? (totalProfit / data.length).toFixed(0) : 0}
          </h3>
        </div>
      </div>

      <div className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-900/50">
            <TableRow className="hover:bg-transparent border-slate-800">
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 pl-6">Bill Details</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4">Customer</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 text-right">Total CP</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 text-right">Total SP</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 text-right pr-6">Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground">Loading bill data...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground">No bills found for the selected period</TableCell></TableRow>
            ) : (
              data.map((inv) => (
                <TableRow key={inv.id} className="hover:bg-white/5 border-slate-800 transition-colors">
                  <TableCell className="py-4 pl-6">
                    <div className="font-black text-white">{inv.invoice_number}</div>
                    <div className="text-[10px] text-slate-500 font-bold">{format(new Date(inv.created_on), 'dd MMM yyyy, hh:mm a')}</div>
                  </TableCell>
                  <TableCell className="font-bold text-slate-400">{inv.customer_name}</TableCell>
                  <TableCell className="text-right font-medium text-slate-500">₹{inv.total_cp.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-black text-white">₹{inv.total_sp.toLocaleString()}</TableCell>
                  <TableCell className={`text-right pr-6 font-black ${inv.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    <div className="flex justify-end items-center gap-1">
                      {inv.profit >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      ₹{inv.profit.toLocaleString()}
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

export default BillProfitPage;
