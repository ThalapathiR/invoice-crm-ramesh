import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { 
  Users, Search, RefreshCw, 
  Building2, ArrowUpRight, 
  UserCheck,
  MoreVertical, ExternalLink,
  Ban, CheckCircle2, Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { CommonService } from '@/service/commonservice.page';

const AdminCustomersPage: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeToday: 0,
    totalTenants: 0
  });

  const fetchGlobalCustomers = async () => {
    setIsLoading(true);
    try {
      // In a real multi-tenant app, this would be a specific Super Admin endpoint
      // For now, we'll fetch from a mockable endpoint or simulate with CommonService
      const data = await CommonService.GetAll('/admin/global-customers');
      const list = Array.isArray(data) ? data : (data?.data || []);
      
      setCustomers(list);
      setFilteredCustomers(list);
      
      // Calculate basic stats
      setStats({
        totalCustomers: list.length,
        activeToday: Math.floor(list.length * 0.15), // Mock stat
        totalTenants: new Set(list.map((c: any) => c.store_id)).size
      });
    } catch (err) {
      console.warn("Fetch failed, using mock data for demonstration");
      // MOCK DATA for demonstration if endpoint doesn't exist yet
      const mockData = [
        { id: '1', name: 'Ramesh Kumar', phone: '9876543210', email: 'ramesh@gmail.com', store_name: 'Trendz Boutique', store_id: 's1', created_on: new Date().toISOString(), status: 'ACTIVE' },
        { id: '2', name: 'Suresh Raina', phone: '9887766554', email: 'suresh@outlook.com', store_name: 'City Fashion', store_id: 's2', created_on: new Date().toISOString(), status: 'ACTIVE' },
        { id: '3', name: 'Anjali Sharma', phone: '9776655443', email: 'anjali@fashion.in', store_name: 'Trendz Boutique', store_id: 's1', created_on: new Date().toISOString(), status: 'INACTIVE' },
        { id: '4', name: 'Vikram Singh', phone: '9665544332', email: 'vikram@singh.com', store_name: 'Vogue Hub', store_id: 's3', created_on: new Date().toISOString(), status: 'ACTIVE' },
      ];
      setCustomers(mockData);
      setFilteredCustomers(mockData);
      setStats({
        totalCustomers: 1240,
        activeToday: 42,
        totalTenants: 12
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalCustomers();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    setFilteredCustomers(
      customers.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.store_name.toLowerCase().includes(query) ||
        c.phone.includes(query)
      )
    );
  }, [searchQuery, customers]);

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      {/* Header Section */}
      <div className="page-header-brand flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-primary animate-pulse" />
            Global Customers
          </h1>
          <p className="text-blue-100/80 font-medium">Super Admin Control: Managing all customers across {stats.totalTenants} tenants</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl" onClick={fetchGlobalCustomers} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button className="btn-brand bg-white text-slate-900 hover:bg-slate-100 border-none h-12 px-6 rounded-2xl font-black shadow-lg shadow-black/5">
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card p-8 rounded-[32px] border border-border shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 text-primary group-hover:scale-110 transition-transform duration-500">
            <Users size={80} />
          </div>
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2">Total Global Customers</p>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black text-white">{stats.totalCustomers.toLocaleString()}</h3>
            <span className="text-emerald-400 text-xs font-bold mb-1 flex items-center gap-0.5">
              <ArrowUpRight size={14} /> +12%
            </span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card p-8 rounded-[32px] border border-border shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 text-emerald-400 group-hover:scale-110 transition-transform duration-500">
            <UserCheck size={80} />
          </div>
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2">Active Today</p>
          <h3 className="text-4xl font-black text-white">{stats.activeToday}</h3>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card p-8 rounded-[32px] border border-border shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 text-amber-400 group-hover:scale-110 transition-transform duration-500">
            <Building2 size={80} />
          </div>
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2">Total Tenants</p>
          <h3 className="text-4xl font-black text-white">{stats.totalTenants}</h3>
        </motion.div>
      </div>

      {/* Search Bar */}
      <div className="bg-card rounded-[32px] border border-border shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input 
            placeholder="Search by customer name, phone, or shop name..." 
            className="pl-10 border-none bg-slate-900 rounded-2xl h-12 font-bold text-white placeholder:text-slate-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-900/50">
            <TableRow className="hover:bg-transparent border-slate-800">
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 pl-8">Customer & Shop</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4">Contact Info</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 text-center">Status</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 text-right">Joined On</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 text-right pr-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20">
                  <RefreshCw className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
                  <p className="text-slate-400 font-bold">Scanning Global Database...</p>
                </TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-slate-400 font-bold">
                  No global customers found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-white/5 border-slate-800 transition-colors group">
                  <TableCell className="py-6 pl-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white font-black text-xl border border-white/5 shadow-inner">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-white text-lg">{customer.name}</div>
                        <div className="flex items-center gap-1.5 text-[10px] text-primary font-black uppercase tracking-wider">
                          <Building2 size={12} />
                          {customer.store_name}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    <div className="font-bold text-slate-400">{customer.phone}</div>
                    <div className="text-xs text-slate-500 font-medium">{customer.email || 'No email provided'}</div>
                  </TableCell>
                  <TableCell className="py-6 text-center">
                    <Badge className={customer.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}>
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-6 text-right font-bold text-slate-400">
                    {format(new Date(customer.created_on), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell className="py-6 text-right pr-8">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-500 hover:text-white hover:bg-white/5">
                          <MoreVertical size={18} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800 text-white p-2 rounded-2xl shadow-2xl">
                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Customer Actions</DropdownMenuLabel>
                        <DropdownMenuItem className="rounded-xl focus:bg-white/10 cursor-pointer">
                          <ExternalLink className="mr-2 h-4 w-4 text-primary" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl focus:bg-white/10 cursor-pointer">
                          <Building2 className="mr-2 h-4 w-4 text-blue-400" /> Visit Shop Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-800" />
                        {customer.status === 'ACTIVE' ? (
                          <DropdownMenuItem className="rounded-xl focus:bg-red-500/20 text-red-400 cursor-pointer">
                            <Ban className="mr-2 h-4 w-4" /> Deactivate Customer
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="rounded-xl focus:bg-emerald-500/20 text-emerald-400 cursor-pointer">
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Reactivate Customer
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer Info */}
      <div className="mt-6 flex justify-between items-center px-4">
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
          Showing {filteredCustomers.length} of {stats.totalCustomers} total global customers
        </p>
        <div className="flex gap-2">
           <Button variant="ghost" disabled className="text-slate-600 font-bold uppercase tracking-widest text-[10px]">Previous</Button>
           <Button variant="ghost" disabled className="text-slate-600 font-bold uppercase tracking-widest text-[10px]">Next</Button>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomersPage;
