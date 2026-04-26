import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search, ArrowUpCircle, ArrowDownCircle, History, Receipt, Wallet } from 'lucide-react';
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
import { CustomerLedgerService } from '@/service/ledger.service';
import { CustomerService } from '@/service/customer.service';
import { BankService } from '@/service/bank.service';
import { format } from 'date-fns';
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

const CustomerLedgerPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [ledger, setLedger] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { user } = useAuth();

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    payment_method: 'Cash',
    bank_account_id: '',
    notes: ''
  });

  const fetchCustomers = async () => {
    try {
      const storeId = (user as any)?.company?.id;
      const res = await CustomerService.GetList(storeId);
      setCustomers(res.result || []);
    } catch (err) {
      toast.error("Failed to fetch customers");
    }
  };

  const fetchBanks = async () => {
    try {
      const storeId = (user as any)?.company?.id;
      const res = await BankService.GetAll(storeId);
      setBanks(res.result || []);
    } catch (err) {}
  };

  const fetchLedger = async (cid: string) => {
    if (!cid) return;
    setIsLoading(true);
    try {
      const res = await CustomerLedgerService.GetHistory(cid);
      setLedger(res.result || []);
    } catch (err) {
      toast.error("Failed to fetch ledger");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCustomers();
      fetchBanks();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCustomerId) {
      fetchLedger(selectedCustomerId);
    } else {
      setLedger([]);
    }
  }, [selectedCustomerId]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !paymentForm.amount) return;

    try {
      await CustomerLedgerService.RecordPayment({
        customer_id: selectedCustomerId,
        ...paymentForm
      });
      toast.success("Payment recorded successfully");
      setIsPaymentModalOpen(false);
      fetchLedger(selectedCustomerId);
      fetchCustomers(); // Refresh balances
    } catch (err: any) {
      toast.error(err.message || "Failed to record payment");
    }
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen">
      <div className="page-header-brand flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <History className="w-6 h-6 text-white" />
            </div>
            Customer Khata Ledger
          </h1>
          <p className="text-blue-100/80 font-medium ml-1">Track outstanding dues and payment history</p>
        </div>
        <div className="flex gap-2">
          {selectedCustomerId && (
            <Button className="btn-brand bg-white text-emerald-600 hover:bg-slate-100 border-none h-12 px-6 rounded-2xl font-black shadow-lg" onClick={() => setIsPaymentModalOpen(true)}>
              <Wallet className="w-4 h-4 mr-2" />
              Receive Payment
            </Button>
          )}
          <Button variant="outline" size="icon" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl" onClick={() => fetchLedger(selectedCustomerId)} disabled={isLoading || !selectedCustomerId}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Customer Selector */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card rounded-[32px] border border-border shadow-sm p-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Select Customer</h3>
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
              <SelectTrigger className="h-14 rounded-2xl bg-slate-900 border-slate-800 font-bold text-lg text-white">
                <SelectValue placeholder="Choose a customer..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                {customers.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedCustomer && (
              <div className="mt-8 p-6 bg-slate-900 rounded-[28px] text-white">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Current Balance</div>
                <div className={`text-4xl font-black ${selectedCustomer.current_balance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  ₹{selectedCustomer.current_balance.toLocaleString()}
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between">
                  <div className="text-center">
                    <div className="text-[8px] font-bold text-slate-500 uppercase">Purchases</div>
                    <div className="font-bold">₹{selectedCustomer.total_purchases?.toLocaleString() || 0}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[8px] font-bold text-slate-500 uppercase">Invoices</div>
                    <div className="font-bold">{selectedCustomer.total_invoices || 0}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ledger Table */}
        <div className="lg:col-span-8">
          <div className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden min-h-[500px]">
            {!selectedCustomerId ? (
              <div className="flex flex-col items-center justify-center h-[500px] text-slate-500">
                <Receipt className="w-16 h-16 opacity-20 mb-4" />
                <p className="font-black uppercase tracking-widest text-[10px]">Select a customer to view ledger</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-900/50">
                  <TableRow className="hover:bg-transparent border-slate-800">
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 pl-8">Date</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4">Transaction</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 text-right">Debit</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 text-right">Credit</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 text-right pr-8">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground font-bold">Fetching history...</TableCell></TableRow>
                  ) : ledger.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground font-bold">No transactions found</TableCell></TableRow>
                  ) : (
                    ledger.map((entry) => (
                      <TableRow key={entry.id} className="hover:bg-white/5 border-slate-800 transition-colors">
                        <TableCell className="py-5 pl-8">
                          <div className="font-bold text-white text-xs">{format(new Date(entry.created_on), 'dd MMM yyyy')}</div>
                          <div className="text-[8px] text-slate-500 font-bold uppercase">{format(new Date(entry.created_on), 'hh:mm a')}</div>
                        </TableCell>
                        <TableCell className="py-5">
                          <div className="flex items-center gap-2">
                            {entry.type === 'SALE' ? <ArrowUpCircle className="w-4 h-4 text-amber-400" /> : <ArrowDownCircle className="w-4 h-4 text-emerald-400" />}
                            <div className="text-xs font-black text-slate-300">{entry.type}</div>
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">{entry.notes}</div>
                        </TableCell>
                        <TableCell className="py-5 text-right font-bold text-amber-500">
                          {entry.debit > 0 ? `+ ₹${entry.debit.toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell className="py-5 text-right font-bold text-emerald-500">
                          {entry.credit > 0 ? `- ₹${entry.credit.toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell className="py-5 text-right font-black text-white pr-8">
                          ₹{entry.balance.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-md rounded-[40px] p-10 border-slate-800 bg-slate-900 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white">Receive Payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRecordPayment} className="space-y-6 pt-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 ml-1">Payment Amount (₹)</label>
              <Input 
                type="number"
                required
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({...paymentForm, amount: parseFloat(e.target.value) || 0})}
                className="h-14 rounded-2xl bg-slate-950 border-slate-800 focus:border-emerald-500 text-3xl font-black text-emerald-400"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 ml-1">Method</label>
                <Select value={paymentForm.payment_method} onValueChange={(val) => setPaymentForm({...paymentForm, payment_method: val})}>
                  <SelectTrigger className="h-12 rounded-xl bg-slate-950 border-slate-800 font-bold text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 ml-1">Bank (Optional)</label>
                <Select value={paymentForm.bank_account_id} onValueChange={(val) => setPaymentForm({...paymentForm, bank_account_id: val})}>
                  <SelectTrigger className="h-12 rounded-xl bg-slate-950 border-slate-800 font-bold text-white">
                    <SelectValue placeholder="No Bank" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    {banks.map(bank => (
                      <SelectItem key={bank.id} value={bank.id}>{bank.bank_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 ml-1">Payment Notes</label>
              <Input 
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                placeholder="e.g. Partial payment for due bills"
                className="h-12 rounded-2xl bg-slate-950 border-slate-800 focus:bg-slate-950 text-sm font-medium text-white placeholder:text-slate-600"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsPaymentModalOpen(false)} className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-slate-500 hover:bg-white/5 transition-colors">Cancel</Button>
              <Button type="submit" className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 transition-colors">Confirm Payment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerLedgerPage;
