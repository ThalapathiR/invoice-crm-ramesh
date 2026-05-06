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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BillProfitPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState(format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [paymentMethod, setPaymentMethod] = useState('ALL');

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

  const filteredData = data.filter(item => 
    paymentMethod === 'ALL' || item.payment_method === paymentMethod
  );

  const totalProfit = filteredData.reduce((sum, item) => sum + item.profit, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="page-header-brand flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Bill Profit Analysis</h1>
          <p className="text-blue-100/80 font-medium">Detailed profit calculation for every independent bill</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/10">
          <div className="flex gap-2">
            <Input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none text-foreground font-bold h-10 w-40 [color-scheme:dark]"
            />
            <div className="flex items-center text-foreground/40 font-black">TO</div>
            <Input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none text-foreground font-bold h-10 w-40 [color-scheme:dark]"
            />
          </div>
          <div className="h-10 w-px bg-white/20 hidden md:block mx-2" />
          <div className="flex gap-2">
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="bg-transparent border-none text-foreground font-bold h-10 w-32 focus:ring-0">
                <SelectValue placeholder="Mode" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-border text-foreground">
                <SelectItem value="ALL">All Modes</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="bg-white/10 border-white/20 text-foreground hover:bg-white/20 rounded-xl" onClick={fetchData}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-[32px] p-8 border border-border shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-muted-foreground">
            <FileText size={80} />
          </div>
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2">Total Bills</p>
          <h3 className="text-4xl font-black text-foreground">{filteredData.length}</h3>
        </div>
        
        <div className="bg-card rounded-[32px] p-8 border border-border shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-muted-foreground">
            <TrendingUp size={80} />
          </div>
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2">Cumulative Profit</p>
          <h3 className={`text-4xl font-black ${totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ₹{totalProfit.toLocaleString()}
          </h3>
        </div>

        <div className="bg-card rounded-[32px] p-8 border border-border shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-muted-foreground">
            <TrendingUp size={80} />
          </div>
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2">Avg Profit per Bill</p>
          <h3 className="text-4xl font-black text-foreground">
            ₹{filteredData.length > 0 ? (totalProfit / filteredData.length).toFixed(0) : 0}
          </h3>
        </div>
      </div>

      <div className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-card/50">
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 pl-6">Bill Details</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4">Customer</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4">Mode</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 text-right">Total CP</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 text-right">Total SP</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 text-right pr-6">Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-20 text-muted-foreground">Loading bill data...</TableCell></TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-20 text-muted-foreground">No bills found for the selected criteria</TableCell></TableRow>
            ) : (
              filteredData.map((inv) => (
                <TableRow key={inv.id} className="hover:bg-white/5 border-border transition-colors">
                  <TableCell className="py-4 pl-6">
                    <div className="font-black text-foreground">{inv.invoice_number}</div>
                    <div className="text-[10px] text-slate-500 font-bold">{format(new Date(inv.created_on), 'dd MMM yyyy, hh:mm a')}</div>
                  </TableCell>
                  <TableCell className="font-bold text-muted-foreground">{inv.customer_name}</TableCell>
                  <TableCell>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                      inv.payment_method === 'Cash' ? 'bg-amber-500/10 text-amber-500' :
                      inv.payment_method === 'UPI' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-purple-500/10 text-purple-500'
                    }`}>
                      {inv.payment_method || 'Cash'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium text-slate-500">₹{inv.total_cp.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-black text-foreground">₹{inv.total_sp.toLocaleString()}</TableCell>
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
