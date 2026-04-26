import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { CommonService } from '@/service/commonservice.page';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, Users, ShoppingBag, Banknote, Calendar, 
  ArrowUpRight, ArrowDownRight, Package, CreditCard, Wallet, Box
} from 'lucide-react';
import { motion } from 'framer-motion';

const BusinessDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    const storeId = (user as any)?.company?.id;
    if (!storeId) return;

    try {
      const [statsRes, trendRes, breakdownRes] = await Promise.all([
        CommonService.GetAll(`Dashboard/Stats?storeId=${storeId}`),
        CommonService.GetAll(`Dashboard/SalesTrend?storeId=${storeId}`),
        CommonService.GetAll(`Dashboard/PaymentBreakdown?storeId=${storeId}`)
      ]);

      setStats(statsRes);
      setTrend(trendRes);
      setBreakdown(breakdownRes);
    } catch (err) {
      console.error("Dashboard fetch failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#22D3EE', '#22C55E', '#FACC15', '#EF4444'];

  const kpis = [
    { 
      title: "Today's Revenue", 
      value: `₹${stats?.todayRevenue?.toLocaleString() || 0}`, 
      icon: Banknote, 
      color: "bg-cyan-500/20 text-cyan-500", 
      trend: "+12.5%", 
      isUp: true 
    },
    { 
      title: "Net Profit", 
      value: `₹${stats?.totalProfit?.toLocaleString() || 0}`, 
      icon: TrendingUp, 
      color: "bg-emerald-500/20 text-emerald-500", 
      trend: `${((stats?.totalProfit / (stats?.totalRevenue || 1)) * 100).toFixed(1)}% Margin`, 
      isUp: true 
    },
    { 
      title: "Total Investment", 
      value: `₹${stats?.totalInvestment?.toLocaleString() || 0}`, 
      icon: Package, 
      color: "bg-rose-500/20 text-rose-500", 
      trend: "Cost of Goods", 
      isUp: false 
    },
    { 
      title: "Total Customers", 
      value: stats?.totalCustomers || 0, 
      icon: Users, 
      color: "bg-amber-500/20 text-amber-500", 
      trend: "+3.2%", 
      isUp: true 
    },
    { 
      title: "Total Invoices", 
      value: stats?.totalInvoices || 0, 
      icon: ShoppingBag, 
      color: "bg-blue-500/20 text-blue-500", 
      trend: "+8.4%", 
      isUp: true 
    },
    { 
      title: "Active Products", 
      value: stats?.totalProducts || 0, 
      icon: Box, 
      color: "bg-slate-500/20 text-slate-400", 
      trend: "Inventory", 
      isUp: true 
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-8 rounded-[32px] border border-border shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Business Intelligence</h1>
          <p className="text-slate-400 text-sm font-medium">Real-time overview of your store's performance</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-2xl border border-border">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {kpis.map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card p-6 rounded-[32px] border border-border shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`${kpi.color} p-3 rounded-2xl shadow-lg shadow-current/5 group-hover:scale-110 transition-transform`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${kpi.isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                {kpi.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.trend}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{kpi.title}</div>
              <div className="text-2xl font-black text-white">{kpi.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-card p-8 rounded-[32px] border border-border shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-white">Weekly Revenue Trend</h3>
              <p className="text-xs text-slate-400 font-medium">Sales performance over the last 7 days</p>
            </div>
            <TrendingUp className="w-5 h-5 text-cyan-500" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#22D3EE" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Method Pie Chart */}
        <div className="bg-card p-8 rounded-[32px] border border-border shadow-sm">
          <h3 className="text-xl font-black text-white mb-1">Payment Modes</h3>
          <p className="text-xs text-slate-400 font-medium mb-8">Transaction volume by method</p>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {breakdown.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="text-xs font-black text-white">{item.value} Trans.</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Profitability Analysis Section */}
      <div className="bg-card p-8 rounded-[32px] border border-border shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-white">Profitability Analysis</h3>
            <p className="text-xs text-slate-400 font-medium">Comparison of Revenue, Investment, and Net Profit</p>
          </div>
          <TrendingUp className="w-5 h-5 text-emerald-500" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
          <div className="md:col-span-3 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: 'Revenue', amount: stats?.totalRevenue || 0, color: '#22D3EE' },
                { name: 'Investment', amount: stats?.totalInvestment || 0, color: '#EF4444' },
                { name: 'Profit', amount: stats?.totalProfit || 0, color: '#22C55E' }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                <Tooltip />
                <Area type="monotone" dataKey="amount" stroke="#22D3EE" fill="#22D3EE" fillOpacity={0.1} strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
              <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">Revenue</div>
              <div className="text-xl font-black text-cyan-500">₹{stats?.totalRevenue?.toLocaleString()}</div>
            </div>
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Investment</div>
              <div className="text-xl font-black text-rose-500">₹{stats?.totalInvestment?.toLocaleString()}</div>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Net Profit</div>
              <div className="text-xl font-black text-emerald-500">₹{stats?.totalProfit?.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table could go here */}
    </div>
  );
};

export default BusinessDashboard;
