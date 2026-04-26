import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvoiceService } from '@/service/invoice.service';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Calendar, Receipt } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PurchaseHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  customer: any;
}

const CustomerPurchaseHistory: React.FC<PurchaseHistoryProps> = ({ isOpen, onClose, customer }) => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && customer) {
      fetchHistory();
    }
  }, [isOpen, customer]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await InvoiceService.GetByCustomer(customer.id);
      setInvoices(data);
    } catch (err) {
      console.error("Failed to fetch purchase history", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto rounded-[32px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-black">
            <ShoppingBag className="w-6 h-6 text-primary" />
            Purchase History: {customer?.name}
          </DialogTitle>
          <div className="flex gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
            <span>{customer?.phone}</span>
            <span>•</span>
            <span>{invoices.length} Total Invoices</span>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 mt-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground bg-slate-50 rounded-[32px] mt-6 border-2 border-dashed">
            <Receipt className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-bold">No purchase history found for this customer.</p>
          </div>
        ) : (
          <div className="space-y-6 mt-6">
            {invoices.map((inv) => (
              <div key={inv.id} className="bg-white border rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-slate-50 p-4 flex justify-between items-center border-b">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Invoice #</span>
                      <span className="text-sm font-black text-slate-900">{inv.invoice_number}</span>
                    </div>
                    <div className="w-px h-8 bg-slate-200" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Date</span>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-slate-600">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(inv.created_on).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-bold px-3 py-1 rounded-full text-[10px] uppercase">
                      {inv.payment_method}
                    </Badge>
                    <div className="text-right">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Total Amount</span>
                      <span className="text-lg font-black text-primary">₹{Number(inv.total_amount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="text-[10px] font-black uppercase py-2">Product Name</TableHead>
                        <TableHead className="text-[10px] font-black uppercase py-2 text-center">Qty</TableHead>
                        <TableHead className="text-[10px] font-black uppercase py-2 text-right">Price</TableHead>
                        <TableHead className="text-[10px] font-black uppercase py-2 text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inv.items?.map((item: any) => (
                        <TableRow key={item.id} className="hover:bg-slate-50/30">
                          <TableCell className="py-3">
                            <div className="font-bold text-slate-800">{item.product?.name}</div>
                            <div className="text-[10px] text-slate-400 font-medium">SKU: {item.product?.barcode}</div>
                          </TableCell>
                          <TableCell className="text-center font-bold text-slate-600">{item.quantity}</TableCell>
                          <TableCell className="text-right font-medium text-slate-600">₹{Number(item.unit_price).toLocaleString()}</TableCell>
                          <TableCell className="text-right font-black text-slate-900">₹{Number(item.total_price).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Invoice Summary */}
                <div className="bg-slate-50 border-t px-6 py-4 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Subtotal</span>
                    <span>₹{Number(inv.subtotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>GST / Taxes</span>
                    <span>₹{Number(inv.tax_amount || 0).toLocaleString()}</span>
                  </div>
                  {Number(inv.discount_percentage) > 0 && (
                    <div className="flex justify-between text-xs font-bold text-emerald-600">
                      <span>Discount ({inv.discount_percentage}%)</span>
                      <span>-₹{(Number(inv.subtotal || 0) * Number(inv.discount_percentage) / 100).toLocaleString()}</span>
                    </div>
                  )}
                  {Number(inv.discount_amount) > 0 && (
                    <div className="flex justify-between text-xs font-bold text-emerald-600">
                      <span>Flat Discount</span>
                      <span>-₹{Number(inv.discount_amount).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                    <span>Grand Total</span>
                    <span className="text-primary text-lg">₹{Number(inv.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CustomerPurchaseHistory;
