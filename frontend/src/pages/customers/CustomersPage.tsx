import React, { useState, useEffect } from 'react';
import { CustomerService } from '@/service/customer.service';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import CustomerList from '@/components/customers/CustomerList';
import CustomerForm from '@/components/customers/CustomerForm';
import CustomerPurchaseHistory from '@/components/customers/CustomerPurchaseHistory';
import { ReportService } from '@/service/report.service';
import { toast } from 'sonner';

const CustomersPage: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [historyCustomer, setHistoryCustomer] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const storeId = (user as any)?.company?.id;
      const data = await CustomerService.GetList(storeId);
      setCustomers(data || []);
    } catch (err) {
      toast.error("Failed to fetch customers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchCustomers();
  }, [user]);

  const query = searchQuery.toLowerCase();
  const filteredCustomers = customers.filter(c => {
    const matchesQuery = !query ||
      (c.name?.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query));

    let matchesDate = true;
    const customerDateStr = c.last_visit || c.created_on || c.created_at;

    if (startDate || endDate) {
      if (!customerDateStr) {
        matchesDate = false;
      } else {
        const d = new Date(customerDateStr);
        if (isNaN(d.getTime())) {
          matchesDate = false;
        } else {
          if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (d < start) matchesDate = false;
          }
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (d > end) matchesDate = false;
          }
        }
      }
    }

    return matchesQuery && matchesDate;
  });

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setIsFormOpen(true);
  };

  const handleEditCustomer = (customer: any) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleShowHistory = (customer: any) => {
    setHistoryCustomer(customer);
    setIsHistoryOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      const storeId = (user as any)?.company?.id;
      const payload = { ...data, store_id: storeId };

      if (editingCustomer) {
        await CustomerService.Update(editingCustomer.id, payload);
        toast.success("Customer updated");
      } else {
        await CustomerService.Insert(payload);
        toast.success("Customer added");
      }
      setIsFormOpen(false);
      fetchCustomers();
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    }
  };

  const handleSyncStats = async () => {
    try {
      const storeId = (user as any)?.company?.id;
      await ReportService.SyncCustomerStats(storeId);
      toast.success("Customer stats synced");
      fetchCustomers();
    } catch (err) {
      toast.error("Sync failed");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="page-header-brand flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Customer Relationship</h1>
          <p className="text-blue-100/80 font-medium">Manage your customer database and purchase history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="bg-white/10 border-white/20 text-foreground hover:bg-white/20 rounded-xl" onClick={handleSyncStats} disabled={isLoading} title="Sync Statistics">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button className="btn-brand bg-white text-slate-900 hover:bg-slate-100 border-none h-12 px-6 rounded-2xl font-black shadow-lg shadow-black/5" onClick={handleAddCustomer}>
            <Plus className="w-4 h-4 mr-2" />
            New Customer
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-[32px] border border-border shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search by name, phone or email..."
              className="pl-10 h-12 rounded-2xl bg-card border-none focus:bg-background text-foreground font-bold placeholder:text-slate-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-xl border border-border">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-card border border-border/50 text-[11px] font-bold h-9 w-40 px-2 rounded-lg focus:ring-1 focus:ring-primary/30"
              title="Filter by Last Visit (Start)"
            />
            <div className="text-[10px] font-black text-muted-foreground/50 px-1">TO</div>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-card border border-border/50 text-[11px] font-bold h-9 w-40 px-2 rounded-lg focus:ring-1 focus:ring-primary/30"
              title="Filter by Last Visit (End)"
            />
            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors font-bold text-lg"
              >
                ×
              </Button>
            )}
          </div>
        </div>
      </div>

      <CustomerList
        customers={filteredCustomers}
        onEdit={handleEditCustomer}
        onShowHistory={handleShowHistory}
      />

      <CustomerForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        customer={editingCustomer}
        onSubmit={handleFormSubmit}
      />

      <CustomerPurchaseHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        customer={historyCustomer}
      />
    </div>
  );
};

export default CustomersPage;
