import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { CommonService } from '@/service/commonservice.page';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar
} from 'recharts';
import { 
  TrendingUp, Users, ShoppingBag, Banknote, Calendar, 
  ArrowUpRight, ArrowDownRight, Package, CreditCard, Wallet, Box,
  ChevronRight, ArrowRight, DollarSign, Receipt, Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';


const BusinessDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 29), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));


  const { user } = useAuth();

  useEffect(() => {
    if (user && startDate && endDate) {
      fetchDashboardData();
    }
  }, [user, startDate, endDate]);


  const fetchDashboardData = async () => {
    setIsLoading(true);
    const storeId = (user as any)?.company?.id;
    if (!storeId) return;

    const query = `storeId=${storeId}&startDate=${startDate}&endDate=${endDate}`;


    try {
      const [statsRes, trendRes, breakdownRes, productsRes, customersRes, expensesRes] = await Promise.all([
        CommonService.GetAll(`Dashboard/Stats?${query}`),
        CommonService.GetAll(`Dashboard/SalesTrend?${query}`),
        CommonService.GetAll(`Dashboard/PaymentBreakdown?${query}`),
        CommonService.GetAll(`Dashboard/TopProducts?${query}`),
        CommonService.GetAll(`Dashboard/TopCustomers?${query}`),
        CommonService.GetAll(`Dashboard/ExpenseBreakdown?${query}`)
      ]);

      setStats(statsRes);
      setTrend(trendRes);
      setBreakdown(breakdownRes);
      setTopProducts(productsRes);
      setTopCustomers(customersRes);
      setExpenses(expensesRes);
    } catch (err) {
      console.error("Dashboard fetch failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#22D3EE', '#22C55E', '#FACC15', '#EF4444', '#8B5CF6', '#F97316'];

  const kpis = [
    { 
      title: "Revenue", 
      value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`, 
      icon: Banknote, 
      color: "bg-cyan-500/20 text-cyan-500", 
      trend: "Total in range", 
      isUp: true 
    },
    { 
      title: "Net Profit", 
      value: `₹${stats?.totalProfit?.toLocaleString() || 0}`, 
      icon: TrendingUp, 
      color: "bg-emerald-500/20 text-emerald-500", 
      trend: `${((stats?.totalProfit / (stats?.totalRevenue || 1)) * 100).toFixed(1)}% Margin`, 
      isUp: (stats?.totalProfit || 0) >= 0 
    },
    { 
      title: "Expenses", 
      value: `₹${stats?.totalExpenses?.toLocaleString() || 0}`, 
      icon: Receipt, 
      color: "bg-rose-500/20 text-rose-500", 
      trend: "Total spent", 
      isUp: false 
    },
    { 
      title: "Customers", 
      value: stats?.totalCustomers || 0, 
      icon: Users, 
      color: "bg-amber-500/20 text-amber-500", 
      trend: "Active base", 
      isUp: true 
    },
    { 
      title: "Invoices", 
      value: stats?.totalInvoices || 0, 
      icon: ShoppingBag, 
      color: "bg-blue-500/20 text-blue-500", 
      trend: "In range", 
      isUp: true 
    },
    { 
      title: "Inventory Value", 
      value: `₹${stats?.totalInvestment?.toLocaleString() || 0}`, 
      icon: Box, 
      color: "bg-slate-500/20 text-slate-400", 
      trend: "Current asset", 
      isUp: true 
    },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8 pb-20 bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-card/40 backdrop-blur-md p-8 rounded-[40px] border border-border/50 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="bg-primary/20 p-4 rounded-3xl">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Business Intelligence</h1>
            <p className="text-slate-400 text-sm font-medium mt-1">Deep dive into your store's performance metrics</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-2xl border border-white/5 backdrop-blur-md">
            <Input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none text-white font-black h-10 w-36 [color-scheme:dark] text-xs"
            />
            <div className="flex items-center text-slate-600 font-black text-[10px] uppercase tracking-widest">TO</div>
            <Input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none text-white font-black h-10 w-36 [color-scheme:dark] text-xs"
            />
            <Button 
              variant="outline" 
              size="icon" 
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl w-10 h-10" 
              onClick={fetchDashboardData}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {kpis.map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card/40 backdrop-blur-sm p-6 rounded-[32px] border border-border/50 shadow-lg hover:border-primary/30 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`${kpi.color} p-3 rounded-2xl shadow-lg shadow-current/5 group-hover:scale-110 transition-transform`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full ${kpi.isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                {kpi.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.trend}
              </div>
            </div>
            <div className="space-y-1 relative z-10">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{kpi.title}</div>
              <div className="text-2xl font-black text-white">{kpi.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-card/40 backdrop-blur-sm p-8 rounded-[32px] border border-border/50 shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-white">Revenue Analytics</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Growth trajectory across selected period</p>
            </div>
            <div className="bg-primary/10 p-2 rounded-xl">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" strokeOpacity={0.5} />
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
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '24px', border: '1px solid #1e293b', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)', fontWeight: 'bold' }}
                  itemStyle={{ color: '#22D3EE' }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#22D3EE" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown Pie Chart */}
        <div className="bg-card/40 backdrop-blur-sm p-8 rounded-[32px] border border-border/50 shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-white">Expense Profile</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Resource allocation by category</p>
            </div>
            <div className="bg-rose-500/10 p-2 rounded-xl">
              <Receipt className="w-5 h-5 text-rose-500" />
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenses.length > 0 ? expenses : [{ name: 'No Data', value: 1 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {expenses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                  {expenses.length === 0 && <Cell fill="#1e293b" stroke="none" />}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-6">
            {expenses.slice(0, 4).map((item, i) => (
              <div key={i} className="p-3 rounded-2xl bg-slate-900/50 border border-white/5 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{item.name}</span>
                </div>
                <span className="text-sm font-black text-white">₹{item.value?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Selling Products */}
        <div className="bg-card/40 backdrop-blur-sm p-8 rounded-[40px] border border-border/50 shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-white">Market Dominance</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Top performing products by revenue</p>
            </div>
            <div className="bg-blue-500/10 p-2 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          
          <div className="space-y-4">
            {topProducts.length > 0 ? topProducts.map((product, idx) => (
              <div key={idx} className="group flex items-center justify-between p-4 rounded-3xl bg-slate-900/40 border border-white/5 hover:border-primary/20 hover:bg-slate-900/60 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center font-black text-slate-500 group-hover:text-primary transition-colors">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-sm font-black text-white group-hover:text-primary transition-colors">{product.name}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{product.sold} Units Sold</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-emerald-400">₹{product.revenue?.toLocaleString()}</div>
                  <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Revenue</div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-slate-600 font-black uppercase tracking-widest">No product data available</div>
            )}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-card/40 backdrop-blur-sm p-8 rounded-[40px] border border-border/50 shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-white">Client Value</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Top contributing customers</p>
            </div>
            <div className="bg-amber-500/10 p-2 rounded-xl">
              <Users className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          
          <div className="space-y-4">
            {topCustomers.length > 0 ? topCustomers.map((customer, idx) => (
              <div key={idx} className="group flex items-center justify-between p-4 rounded-3xl bg-slate-900/40 border border-white/5 hover:border-amber-500/20 hover:bg-slate-900/60 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                    <Users className="w-5 h-5 text-slate-500 group-hover:text-amber-500" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white group-hover:text-amber-500 transition-colors">{customer.name}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{customer.orders} Invoices</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-emerald-400">₹{customer.spent?.toLocaleString()}</div>
                  <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Spent</div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-slate-600 font-black uppercase tracking-widest">No customer data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modes Analysis */}
      <div className="bg-card/40 backdrop-blur-sm p-8 rounded-[40px] border border-border/50 shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full -mr-48 -mt-48 blur-[100px]" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
          <div>
            <h3 className="text-2xl font-black text-white">Payment Distribution</h3>
            <p className="text-xs text-slate-400 font-medium mt-1">Transaction volume across payment methods</p>
          </div>
          <div className="flex gap-4">
            {breakdown.map((item, i) => (
              <div key={i} className="flex flex-col items-end">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{item.name}</div>
                <div className="text-xl font-black text-white">{item.value} <span className="text-[10px] text-slate-500">Tx</span></div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-[200px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={breakdown}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" strokeOpacity={0.2} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontBlack: 900, fill: '#94a3b8' }} 
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: '#1e293b', opacity: 0.4 }}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b' }}
              />
              <Bar 
                dataKey="value" 
                radius={[12, 12, 12, 12]} 
                barSize={60}
              >
                {breakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;

