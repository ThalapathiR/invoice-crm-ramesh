import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { AnalyticsService } from '@/service/analytics.service';
import { Button } from '@/components/ui/button';
import { RefreshCw, Box, Landmark, AlertTriangle, Search } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';

const StockSummaryPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const storeId = (user as any)?.company?.id;
      const res = await AnalyticsService.GetStockSummary(storeId);
      setData(res);
      setFilteredItems(res.items);
    } catch (err) {
      toast.error("Failed to fetch stock summary");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  useEffect(() => {
    if (data?.items) {
      const query = searchQuery.toLowerCase();
      setFilteredItems(
        data.items.filter((i: any) => 
          i.name.toLowerCase().includes(query) || 
          i.sku.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, data]);

  const lowStockCount = data?.items.filter((i: any) => i.quantity <= 5).length || 0;

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="page-header-brand flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Stock Valuation</h1>
          <p className="text-blue-100/80 font-medium">Real-time inventory levels and total capital valuation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl" onClick={fetchData}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-[32px] p-8 border border-border shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-500"><Box size={80} /></div>
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-2">Total Items in Stock</p>
          <h3 className="text-4xl font-black text-white">{data?.items.reduce((sum: number, i: any) => sum + i.quantity, 0).toLocaleString()}</h3>
        </div>
        
        <div className="bg-card rounded-[32px] p-8 border border-border shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-emerald-500"><Landmark size={80} /></div>
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-2">Inventory Valuation (CP)</p>
          <h3 className="text-4xl font-black text-emerald-400">₹{data?.total_stock_value.toLocaleString()}</h3>
        </div>

        <div className="bg-card rounded-[32px] p-8 border border-border shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-red-500"><AlertTriangle size={80} /></div>
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-2">Low Stock Alerts</p>
          <h3 className={`text-4xl font-black ${lowStockCount > 0 ? 'text-red-500' : 'text-white'}`}>{lowStockCount}</h3>
          <p className="text-[10px] font-bold text-slate-400 mt-1">Items with qty ≤ 5</p>
        </div>
      </div>

      <div className="bg-card rounded-[32px] border border-border shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input 
            placeholder="Search items or SKU..." 
            className="pl-10 border-none bg-slate-900 rounded-2xl h-12 font-bold text-white placeholder:text-slate-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-900/50">
            <TableRow className="hover:bg-transparent border-slate-800">
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 pl-6">Product</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4">Size/Cat</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 text-center">In Stock</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 text-right">Cost Price</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 text-right pr-6">Total Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground">Calculating inventory value...</TableCell></TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground">No stock data available</TableCell></TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-white/5 border-slate-800 transition-colors">
                  <TableCell className="py-4 pl-6">
                    <div className="font-black text-white">{item.name}</div>
                    <div className="text-[10px] text-slate-500 font-bold">SKU: {item.sku}</div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="text-xs font-bold text-slate-400">{item.category}</div>
                    <div className="text-[10px] text-slate-500 font-bold">Size: {item.size}</div>
                  </TableCell>
                  <TableCell className="text-center py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black ${item.quantity <= 5 ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-slate-800 text-slate-500'}`}>
                      {item.quantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium text-slate-500 py-4">₹{item.purchase_price.toLocaleString()}</TableCell>
                  <TableCell className="text-right pr-6 font-black text-white py-4">₹{item.stock_value.toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StockSummaryPage;
