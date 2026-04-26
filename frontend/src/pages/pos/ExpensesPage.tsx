import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Plus, Search, RefreshCw, Trash2, Receipt, Calendar, Wallet } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExpenseService } from '@/service/expense.service';
import { ExpenseCategoryService } from '@/service/expense-category.service';
import { BankService } from '@/service/bank.service';
import { format } from 'date-fns';

const ExpensesPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    amount: 0,
    category_id: '',
    bank_account_id: '',
    expense_date: format(new Date(), 'yyyy-MM-dd'),
    notes: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const storeId = (user as any)?.company?.id;
      const [expRes, catRes, bankRes] = await Promise.all([
        ExpenseService.GetAll(storeId),
        ExpenseCategoryService.GetAll(),
        BankService.GetAll(storeId)
      ]);
      
      setItems(expRes.result || []);
      setFilteredItems(expRes.result || []);
      setCategories(catRes.result || []);
      setBanks(bankRes.result || []);
    } catch (err) {
      toast.error("Failed to fetch expenses");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    setFilteredItems(
      items.filter(i => 
        i.category?.name.toLowerCase().includes(query) || 
        i.notes?.toLowerCase().includes(query)
      )
    );
  }, [searchQuery, items]);

  const handleAddItem = () => {
    setFormData({
      amount: 0,
      category_id: '',
      bank_account_id: '',
      expense_date: format(new Date(), 'yyyy-MM-dd'),
      notes: ''
    });
    setIsFormOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("Delete this expense record? (Note: Bank balance will not be auto-restored)")) {
      try {
        await ExpenseService.Delete(id);
        toast.success("Expense record deleted");
        fetchData();
      } catch (err) {
        toast.error("Delete failed");
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category_id || !formData.amount) {
      toast.error("Category and Amount are required");
      return;
    }
    try {
      const storeId = (user as any)?.company?.id;
      const payload = { ...formData, store_id: storeId };
      await ExpenseService.Insert(payload);
      toast.success("Expense recorded and bank balance updated");
      setIsFormOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen">
      <div className="page-header-brand flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            Business Expenses
          </h1>
          <p className="text-blue-100/80 font-medium ml-1">Track all business outflows for accurate net profit</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button className="btn-brand bg-white text-slate-900 hover:bg-slate-100 border-none h-12 px-6 rounded-2xl font-black shadow-lg shadow-black/5" onClick={handleAddItem}>
            <Plus className="w-4 h-4 mr-2" />
            Record Expense
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-[32px] border border-border shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input 
            placeholder="Search expenses by category or notes..." 
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
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 pl-8">Date</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4">Category</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4">Source Account</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 text-right">Amount</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 text-right pr-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground font-bold">Loading expenses...</TableCell></TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground font-bold">No expenses recorded yet</TableCell></TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-white/5 border-slate-800 transition-colors group">
                  <TableCell className="py-5 pl-8">
                    <div className="font-black text-white">{format(new Date(item.expense_date), 'dd MMM yyyy')}</div>
                  </TableCell>
                  <TableCell className="py-5">
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-500/20">
                      {item.category?.name}
                    </span>
                    <div className="text-[10px] text-slate-500 font-bold mt-1">{item.notes || 'No notes'}</div>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-3 h-3 text-slate-500" />
                      <div className="text-xs font-bold text-slate-400">
                        {item.bank_account ? `${item.bank_account.bank_name} (...${item.bank_account.account_number.slice(-4)})` : 'Cash / Hand'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 text-right">
                    <div className="text-lg font-black text-red-400">- ₹{item.amount.toLocaleString()}</div>
                  </TableCell>
                  <TableCell className="text-right py-5 pr-8">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                <Receipt className="w-6 h-6" />
              </div>
              Record Expense
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-6 pt-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 ml-1">Expense Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input 
                    type="date"
                    required
                    value={formData.expense_date}
                    onChange={(e) => setFormData({...formData, expense_date: e.target.value})}
                    className="h-12 pl-10 rounded-2xl bg-slate-950 border-slate-800 text-base font-bold text-white focus:border-primary"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 ml-1">Amount (₹)</label>
                <Input 
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                  className="h-12 rounded-2xl bg-slate-950 border-slate-800 text-xl font-black text-red-400 focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 ml-1">Category</label>
                <Select value={formData.category_id} onValueChange={(val) => setFormData({...formData, category_id: val})}>
                  <SelectTrigger className="h-12 rounded-2xl bg-slate-950 border-slate-800 font-bold text-white">
                    <SelectValue placeholder="Choose Category..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 ml-1">Source Account</label>
                <Select value={formData.bank_account_id} onValueChange={(val) => setFormData({...formData, bank_account_id: val})}>
                  <SelectTrigger className="h-12 rounded-2xl bg-slate-950 border-slate-800 font-bold text-white">
                    <SelectValue placeholder="Select Source..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    <SelectItem value="CASH">Cash / Hand</SelectItem>
                    {banks.map(bank => (
                      <SelectItem key={bank.id} value={bank.id}>{bank.bank_name} (...{bank.account_number.slice(-4)})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 ml-1">Expense Notes</label>
              <Input 
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="e.g. Monthly rent for shop"
                className="h-12 rounded-2xl bg-slate-950 border-slate-800 focus:bg-slate-950 text-sm font-medium text-white placeholder:text-slate-600"
              />
            </div>

            <DialogFooter className="pt-6">
              <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)} className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-slate-500 hover:bg-white/5 transition-colors">Cancel</Button>
              <Button type="submit" className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest bg-white text-slate-900 shadow-xl shadow-black/20 hover:bg-slate-100 transition-colors">Record Expense</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpensesPage;
