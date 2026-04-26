import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Plus, Search, RefreshCw, Pencil, Trash2, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BankService } from '@/service/bank.service';

const BankAccountsPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    upi_id: '',
    current_balance: 0
  });

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const storeId = (user as any)?.company?.id;
      const res = await BankService.GetAll(storeId);
      const list = res.result || [];
      setItems(list);
      setFilteredItems(list);
    } catch (err) {
      toast.error("Failed to fetch bank accounts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchItems();
  }, [user]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    setFilteredItems(
      items.filter(i => 
        i.bank_name.toLowerCase().includes(query) || 
        i.account_number.toLowerCase().includes(query)
      )
    );
  }, [searchQuery, items]);

  const handleAddItem = () => {
    setEditingItem(null);
    setFormData({
      bank_name: '',
      account_number: '',
      ifsc_code: '',
      upi_id: '',
      current_balance: 0
    });
    setIsFormOpen(true);
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setFormData({
      bank_name: item.bank_name,
      account_number: item.account_number,
      ifsc_code: item.ifsc_code || '',
      upi_id: item.upi_id || '',
      current_balance: item.current_balance
    });
    setIsFormOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("Are you sure?")) {
      try {
        await BankService.Delete(id);
        toast.success("Bank account deleted");
        fetchItems();
      } catch (err) {
        toast.error("Delete failed");
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const storeId = (user as any)?.company?.id;
      const payload = { ...formData, store_id: storeId };
      
      if (editingItem) {
        await BankService.Update(editingItem.id, payload);
        toast.success("Bank account updated");
      } else {
        await BankService.Insert(payload);
        toast.success("Bank account added");
      }
      setIsFormOpen(false);
      fetchItems();
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen bg-brand-bg">
      <div className="page-header-brand flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            Bank Accounts
          </h1>
          <p className="text-blue-100/80 font-medium ml-1">Manage your business bank accounts and UPI IDs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl" onClick={fetchItems} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button className="btn-brand bg-white text-slate-900 hover:bg-slate-100 border-none h-12 px-6 rounded-2xl font-black shadow-lg shadow-black/5" onClick={handleAddItem}>
            <Plus className="w-4 h-4 mr-2" />
            Add Bank Account
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-[32px] border border-border shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input 
            placeholder="Search by bank name or account number..." 
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
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 pl-8">Bank Details</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4">Account Info</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 text-right">Balance</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 text-right pr-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground font-bold">Loading accounts...</TableCell></TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground font-bold">No bank accounts found</TableCell></TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-white/5 border-slate-800 transition-colors group">
                  <TableCell className="py-6 pl-8">
                    <div className="font-black text-white text-lg">{item.bank_name}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">UPI ID: {item.upi_id || 'Not set'}</div>
                  </TableCell>
                  <TableCell className="py-6">
                    <div className="font-bold text-slate-400">{item.account_number}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">IFSC: {item.ifsc_code || 'NA'}</div>
                  </TableCell>
                  <TableCell className="py-6 text-right">
                    <div className={`text-xl font-black ${item.current_balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      ₹{item.current_balance.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-6 pr-8">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl text-slate-500 hover:text-primary hover:bg-primary/5" onClick={() => handleEditItem(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl text-slate-500 hover:text-red-400 hover:bg-red-500/10" onClick={() => handleDeleteItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-xl rounded-[40px] p-10 border-slate-800 bg-slate-900 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Plus className="w-6 h-6" />
              </div>
              {editingItem ? 'Edit Bank Account' : 'Add Bank Account'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-6 pt-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 ml-1">Bank Name</label>
                <Input 
                  required
                  value={formData.bank_name}
                  onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                  placeholder="e.g. State Bank of India"
                  className="h-12 rounded-2xl bg-slate-950 border-slate-800 focus:border-primary text-base font-bold text-white placeholder:text-slate-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 ml-1">Account Number</label>
                <Input 
                  required
                  value={formData.account_number}
                  onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                  placeholder="Enter account number"
                  className="h-12 rounded-2xl bg-slate-950 border-slate-800 focus:border-primary text-base font-bold text-white placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 ml-1">IFSC Code</label>
                <Input 
                  value={formData.ifsc_code}
                  onChange={(e) => setFormData({...formData, ifsc_code: e.target.value})}
                  placeholder="SBIN0001234"
                  className="h-12 rounded-2xl bg-slate-950 border-slate-800 focus:border-primary text-base font-bold text-white placeholder:text-slate-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 ml-1">UPI ID</label>
                <Input 
                  value={formData.upi_id}
                  onChange={(e) => setFormData({...formData, upi_id: e.target.value})}
                  placeholder="name@okaxis"
                  className="h-12 rounded-2xl bg-slate-950 border-slate-800 focus:border-primary text-base font-bold text-white placeholder:text-slate-600"
                />
              </div>
            </div>

            {!editingItem && (
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 ml-1">Initial Opening Balance (₹)</label>
                <Input 
                  type="number"
                  value={formData.current_balance}
                  onChange={(e) => setFormData({...formData, current_balance: parseFloat(e.target.value) || 0})}
                  className="h-12 rounded-2xl bg-slate-950 border-slate-800 focus:border-emerald-500 text-xl font-black text-emerald-400"
                />
              </div>
            )}

            <DialogFooter className="pt-6">
              <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)} className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-slate-500 hover:bg-white/5 transition-colors">Cancel</Button>
              <Button type="submit" className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest bg-white text-slate-900 shadow-xl shadow-black/20 hover:bg-slate-100 transition-colors">
                {editingItem ? 'Update Account' : 'Initialize Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BankAccountsPage;
