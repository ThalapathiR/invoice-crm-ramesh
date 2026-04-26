import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { AnalyticsService } from '@/service/analytics.service';
import { Button } from '@/components/ui/button';
import { RefreshCw, Layers, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
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

const CategoryReportPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState(format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const storeId = (user as any)?.company?.id;
      const res = await AnalyticsService.GetCategoryReport(storeId, startDate, endDate);
      setData(res);
    } catch (err) {
      toast.error("Failed to fetch category report");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user, startDate, endDate]);

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="page-header-brand flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Category Performance</h1>
          <p className="text-blue-100/80 font-medium">Sales and profit analysis grouped by item category</p>
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
        <div className="bg-card rounded-[32px] p-8 border border-border shadow-sm flex items-center gap-6">
          <div className="h-16 w-16 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 shrink-0">
            <Layers size={32} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-500">Best Category</p>
            <h3 className="text-2xl font-black text-white">{data[0]?.name || 'N/A'}</h3>
          </div>
        </div>

        <div className="bg-card rounded-[32px] p-8 border border-border shadow-sm flex items-center gap-6">
          <div className="h-16 w-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 shrink-0">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-500">Total Profit</p>
            <h3 className="text-2xl font-black text-white">₹{data.reduce((sum, c) => sum + c.profit, 0).toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-card rounded-[32px] p-8 border border-border shadow-sm flex items-center gap-6">
          <div className="h-16 w-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 shrink-0">
            <DollarSign size={32} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-500">Total Units Sold</p>
            <h3 className="text-2xl font-black text-white">{data.reduce((sum, c) => sum + c.total_quantity, 0).toLocaleString()}</h3>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-900/50">
            <TableRow className="hover:bg-transparent border-slate-800">
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 pl-6">Category Name</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 text-center">Units Sold</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 text-right">Revenue</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 text-right">Cost (COGS)</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 text-right pr-6">Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground">Summarizing categories...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground">No data for selected period</TableCell></TableRow>
            ) : (
              data.map((cat) => (
                <TableRow key={cat.name} className="hover:bg-white/5 border-slate-800 transition-colors">
                  <TableCell className="py-4 pl-6">
                    <div className="font-black text-white">{cat.name}</div>
                  </TableCell>
                  <TableCell className="text-center font-bold text-slate-400 py-4">{cat.total_quantity}</TableCell>
                  <TableCell className="text-right font-black text-white py-4">₹{cat.total_sales.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium text-slate-500 py-4">₹{cat.total_cost.toLocaleString()}</TableCell>
                  <TableCell className={`text-right pr-6 py-4 font-black ${cat.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    <div className="flex justify-end items-center gap-1">
                      {cat.profit >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      ₹{cat.profit.toLocaleString()}
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

export default CategoryReportPage;
