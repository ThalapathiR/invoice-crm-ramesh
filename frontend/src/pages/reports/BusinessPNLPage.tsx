import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { AnalyticsService } from '@/service/analytics.service';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wallet, ShoppingBag, Receipt, PieChart, Percent } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';

const BusinessPNLPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState(format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const storeId = (user as any)?.company?.id;
      const res = await AnalyticsService.GetBusinessPNL(storeId, startDate, endDate);
      setData(res);
    } catch (err) {
      toast.error("Failed to fetch P&L data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user, startDate, endDate]);

  if (!data && !isLoading) return <div>No data found</div>;

  const profitMargin = data?.total_sales > 0 ? (data.net_profit / data.total_sales) * 100 : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="page-header-brand flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Business P&L</h1>
          <p className="text-blue-100/80 font-medium">Aggregated business health and profitability report</p>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-[32px] p-8 border border-border shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-400"><ShoppingBag size={60} /></div>
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2">Total Sales</p>
          <h3 className="text-3xl font-black text-white">₹{data?.total_sales.toLocaleString()}</h3>
        </div>
        
        <div className="bg-card rounded-[32px] p-8 border border-border shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-orange-400"><Wallet size={60} /></div>
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2">Total Cost (CP)</p>
          <h3 className="text-3xl font-black text-white">₹{data?.total_cost.toLocaleString()}</h3>
        </div>

        <div className="bg-card rounded-[32px] p-8 border border-border shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-purple-400"><Receipt size={60} /></div>
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2">Taxes & Discounts</p>
          <h3 className="text-3xl font-black text-white">₹{(data?.total_tax + data?.total_discount).toLocaleString()}</h3>
        </div>

        <div className={`rounded-[32px] p-8 border shadow-lg relative overflow-hidden group ${data?.net_profit >= 0 ? 'bg-emerald-500 border-emerald-400' : 'bg-red-500 border-red-400'}`}>
          <div className="absolute top-0 right-0 p-4 opacity-20 text-white"><PieChart size={60} /></div>
          <p className="text-[10px] uppercase tracking-widest font-black text-white/70 mb-2">Net Profit</p>
          <h3 className="text-3xl font-black text-white">₹{data?.net_profit.toLocaleString()}</h3>
          <div className="mt-2 flex items-center gap-1 text-white/80 font-bold text-xs">
            <Percent size={12} /> {profitMargin.toFixed(1)}% Margin
          </div>
        </div>
      </div>

      <div className="bg-card rounded-[32px] border border-border shadow-sm p-10">
        <h2 className="text-2xl font-black text-white mb-8">Profitability Breakdown</h2>
        
        <div className="space-y-12">
          {/* Visual Bar */}
          <div className="space-y-4">
            <div className="flex justify-between text-[10px] uppercase tracking-widest font-black">
              <span className="text-slate-500">Revenue Flow</span>
              <span className="text-white">₹{data?.total_sales.toLocaleString()} Total</span>
            </div>
            <div className="h-12 w-full bg-slate-900 rounded-2xl flex overflow-hidden p-1 border border-slate-800">
              <div 
                className="h-full bg-orange-500 rounded-l-xl flex items-center justify-center text-[10px] font-black text-white px-2 transition-all duration-500"
                style={{ width: `${(data?.total_cost / data?.total_sales) * 100}%` }}
              >
                COST
              </div>
              <div 
                className="h-full bg-purple-500 flex items-center justify-center text-[10px] font-black text-white px-2 transition-all duration-500"
                style={{ width: `${((data?.total_tax + data?.total_discount) / data?.total_sales) * 100}%` }}
              >
                TAX/DISC
              </div>
              <div 
                className="h-full bg-red-500 flex items-center justify-center text-[10px] font-black text-white px-2 transition-all duration-500"
                style={{ width: `${(data?.total_expenses / data?.total_sales) * 100}%` }}
              >
                EXP
              </div>
              <div 
                className={`h-full flex items-center justify-center text-[10px] font-black text-white px-2 transition-all duration-500 ${data?.net_profit >= 0 ? 'bg-emerald-500 rounded-r-xl' : 'bg-red-500'}`}
                style={{ width: `${(Math.max(0, data?.net_profit) / data?.total_sales) * 100}%` }}
              >
                PROFIT
              </div>
            </div>
            <div className="flex flex-wrap gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full" />
                <span className="text-xs font-bold text-slate-400">Product Cost ({( (data?.total_cost / data?.total_sales) * 100).toFixed(1)}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                <span className="text-xs font-bold text-slate-400">Tax & Discounts ({( ((data?.total_tax + data?.total_discount) / data?.total_sales) * 100).toFixed(1)}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-xs font-bold text-slate-400">Expenses ({( (data?.total_expenses / data?.total_sales) * 100).toFixed(1)}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                <span className="text-xs font-bold text-slate-400">Net Margin ({profitMargin.toFixed(1)}%)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-slate-800 pt-10">
            <div className="space-y-6">
              <h4 className="text-[10px] uppercase tracking-widest font-black text-slate-500">Income Summary</h4>
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="font-bold text-slate-400">Gross Sales</span>
                <span className="font-black text-white">₹{data?.total_sales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="font-bold text-slate-400">Invoice Count</span>
                <span className="font-black text-white">{data?.invoice_count}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-bold text-slate-400">Avg. Basket Value</span>
                <span className="font-black text-white">₹{data?.invoice_count > 0 ? (data.total_sales / data.invoice_count).toFixed(0) : 0}</span>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] uppercase tracking-widest font-black text-slate-500">Expenses Snapshot</h4>
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="font-bold text-slate-400">Cost of Goods Sold (COGS)</span>
                <span className="font-black text-white">₹{data?.total_cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="font-bold text-slate-400">Tax Collected</span>
                <span className="font-black text-white">₹{data?.total_tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="font-bold text-slate-400">Discounts Given</span>
                <span className="font-black text-white">₹{data?.total_discount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-bold text-slate-400">Operational Expenses</span>
                <span className="font-black text-red-400">₹{data?.total_expenses?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessPNLPage;
