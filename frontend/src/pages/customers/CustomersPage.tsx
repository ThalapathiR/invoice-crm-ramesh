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
  const [customers, setCustomers] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [historyCustomer, setHistoryCustomer] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const storeId = (user as any)?.company?.id;
      const data = await CustomerService.GetList(storeId);
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (err) {
      toast.error("Failed to fetch customers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    setFilteredCustomers(
      customers.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.phone.toLowerCase().includes(query) || 
        c.email?.toLowerCase().includes(query)
      )
    );
  }, [searchQuery, customers]);

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
          <h1 className="text-3xl font-black text-white tracking-tight">Customer Relationship</h1>
          <p className="text-blue-100/80 font-medium">Manage your customer database and purchase history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl" onClick={handleSyncStats} disabled={isLoading} title="Sync Statistics">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button className="btn-brand bg-white text-slate-900 hover:bg-slate-100 border-none h-12 px-6 rounded-2xl font-black shadow-lg shadow-black/5" onClick={handleAddCustomer}>
            <Plus className="w-4 h-4 mr-2" />
            New Customer
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-[32px] border border-border shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input 
            placeholder="Search by name, phone or email..." 
            className="pl-10 h-12 rounded-2xl bg-slate-900 border-none focus:bg-slate-950 text-white font-bold placeholder:text-slate-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
