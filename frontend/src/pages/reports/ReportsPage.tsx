import React, { useState, useEffect } from 'react';
import { ReportService } from '@/service/report.service';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, PieChart, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SalesReport from '@/components/reports/SalesReport';
import GSTReport from '@/components/reports/GSTReport';
import { toast } from 'sonner';

const ReportsPage: React.FC = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [paymentMode, setPaymentMode] = useState('All');
  const [salesData, setSalesData] = useState<any[]>([]);
  const [gstData, setGstData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchReports = async () => {
    const storeId = (user as any)?.company?.id;
    if (!storeId) return;

    setIsLoading(true);
    try {
      // Fetch sales for selected range and payment mode
      const sales = await ReportService.GetDailySales(storeId, startDate, endDate, paymentMode);
      setSalesData(Array.isArray(sales) ? sales : []);

      // Fetch GST report for selected range
      const gst = await ReportService.GetGSTReport(storeId, startDate, endDate);
      setGstData(Array.isArray(gst) ? gst : []);
    } catch (err) {
      toast.error("Failed to fetch reports");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user, startDate, endDate, paymentMode]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap justify-between items-end gap-6 mb-8 bg-card p-8 rounded-[32px] border border-border shadow-sm">
        <div className="flex-1 min-w-[300px]">
          <h1 className="text-3xl font-black text-white tracking-tight">Business Analytics</h1>
          <p className="text-slate-400 text-sm font-medium">Detailed sales performance and tax compliance reports</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Payment Mode</label>
            <select 
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="block w-full h-11 px-4 rounded-xl border border-slate-800 bg-slate-900 text-xs font-bold text-white focus:bg-slate-950 transition-all appearance-none cursor-pointer hover:border-primary/30 min-w-[120px]"
            >
              <option value="All">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">From Date</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full h-11 px-4 rounded-xl border border-slate-800 bg-slate-900 text-xs font-bold text-white focus:bg-slate-950 transition-all hover:border-primary/30"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">To Date</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full h-11 px-4 rounded-xl border border-slate-800 bg-slate-900 text-xs font-bold text-white focus:bg-slate-950 transition-all hover:border-primary/30"
            />
          </div>
          <Button variant="default" onClick={fetchReports} disabled={isLoading} className="rounded-xl h-11 px-8 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">
            <Calendar className="w-4 h-4 mr-2" />
            Apply Filter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="bg-muted p-1 rounded-xl">
          <TabsTrigger value="sales" className="rounded-lg px-6">
            <FileText className="w-4 h-4 mr-2" />
            Sales Analytics
          </TabsTrigger>
          <TabsTrigger value="gst" className="rounded-lg px-6">
            <PieChart className="w-4 h-4 mr-2" />
            GST Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="animate-in fade-in duration-300">
          <SalesReport data={salesData} />
        </TabsContent>

        <TabsContent value="gst" className="animate-in fade-in duration-300">
          <GSTReport data={gstData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
