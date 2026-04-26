import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { InvoiceService } from '@/service/invoice.service';
import { CustomerService } from '@/service/customer.service';
import { BankService } from '@/service/bank.service';
import { useAuth } from '@/lib/auth';
import { format } from "date-fns";
import TotalWeightDisplay from "./TotalWeightDisplay";
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CreditCard, Wallet, Banknote, ReceiptText, Building2, Smartphone } from 'lucide-react';

const Checkout: React.FC = () => {
  const { items, subtotal, taxAmount, totalAmount, clearCart } = useCart();
  const [discount, setDiscount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [bankAccountId, setBankAccountId] = useState('');
  const [upiReference, setUpiReference] = useState('');
  const [paidAmount, setPaidAmount] = useState<number | null>(null);
  const [banks, setBanks] = useState<any[]>([]);
  const [phone, setPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customer, setCustomer] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  React.useEffect(() => {
    const fetchBanks = async () => {
      const storeId = (user as any)?.company?.id;
      if (storeId) {
        const res = await BankService.GetAll(storeId);
        setBanks(res.result || []);
      }
    };
    fetchBanks();
  }, [user]);

  const handlePhoneChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPhone(val);
    if (val.length === 10) {
      try {
        const storeId = (user as any)?.company?.id;
        const cust = await CustomerService.GetByPhone(val, storeId);
        if (cust) {
          setCustomer(cust);
          toast.success(`Welcome back, ${cust.name}!`);
        }
      } catch (err) {
        // Customer not found
      }
    } else {
      setCustomer(null);
    }
  };

  const percentDiscount = subtotal * discount / 100;
  const flatDiscount = discountAmount;
  const totalDiscount = percentDiscount + flatDiscount;
  const finalTotal = Math.max(0, totalAmount - totalDiscount);

  const generatePDF = (invoiceData: any) => {
    const doc = new jsPDF();
    const company = (user as any)?.company || {};
    
    // 1. Header (Centered Retail Style)
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text(company.name || "ZUDIO", 105, 20, { align: "center" });
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text(company.website || "Legal Entity Name", 105, 26, { align: "center" });
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Store Contact Number : ${company.telephone_no || "NA"}`, 105, 32, { align: "center" });
    doc.text(`Place Of Supply : ${company.address || "Store Address"}`, 105, 37, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`GSTIN NO : ${company.uen_no || "33AAACL1838J1ZN"}`, 105, 43, { align: "center" });

    let currentY = 48;
    if (company.custom_fields && Array.isArray(company.custom_fields)) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      company.custom_fields.forEach((cf: any) => {
        if (cf.key && cf.value) {
          doc.text(`${cf.key} : ${cf.value}`, 105, currentY, { align: "center" });
          currentY += 4;
        }
      });
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("TAX INVOICE", 105, currentY + 10, { align: "center" });
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, currentY + 14, 190, currentY + 14);

    // 2. Invoice Meta Details
    currentY += 22;
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    
    // Left side
    doc.text(`INVOICE NO. : ${invoiceData.invoice_number}`, 20, currentY);
    doc.text(`COUNTER : 1`, 20, currentY + 5);
    doc.text(`CUSTOMER ID : ${customer?.id ? customer.id.substring(0,8).toUpperCase() : 'WALK-IN'}`, 20, currentY + 10);
    
    // Right side
    doc.text(`${new Date().toLocaleString()}`, 190, currentY, { align: "right" });
    doc.text(`CASHIER : ${user?.name || 'ADMIN'}`, 190, currentY + 5, { align: "right" });
    doc.text(`MOBILE NO : ${customer?.phone || invoiceData.customer_phone || 'NA'}`, 190, currentY + 10, { align: "right" });

    // 3. Items Table
    autoTable(doc, {
      startY: currentY + 18,
      head: [['Item Description', 'Price', 'QTY/Unit', 'Net.Amt']],
      body: items.map(item => [
        { content: `${item.name}\nHSN: ${item.barcode || '62034990'}`, styles: { halign: 'left' } },
        `₹${item.price.toLocaleString()}`,
        `${item.quantity} PC`,
        `₹${(item.price * item.quantity).toLocaleString()}`
      ]),
      theme: 'plain',
      headStyles: { 
        fillColor: [245, 245, 245], 
        textColor: [0, 0, 0], 
        fontStyle: 'bold',
        fontSize: 8,
        lineWidth: 0.1,
        lineColor: [200, 200, 200]
      },
      styles: { fontSize: 8, cellPadding: 3 },
      margin: { left: 20, right: 20 },
    });

    const finalY = (doc as any).lastAutoTable.finalY || currentY + 50;

    // 4. Totals
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Gross Total:`, 140, finalY + 10);
    doc.text(`₹${totalAmount.toLocaleString()}`, 190, finalY + 10, { align: "right" });
    
    doc.setFontSize(12);
    doc.text(`Total Invoice Amount:`, 140, finalY + 18);
    doc.text(`₹${finalTotal.toLocaleString()}`, 190, finalY + 18, { align: "right" });

    // 5. Footer (Terms & Conditions)
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    const footerLines = doc.splitTextToSize(company.invoice_footer || "*All Offers are subject to applicable T&C...", 170);
    doc.text(footerLines, 105, finalY + 35, { align: "center" });

    // 6. Save PDF
    doc.save(`Invoice_${invoiceData.invoice_number}.pdf`);
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);

    try {
      const storeId = (user as any)?.company?.id;
      const payload = {
        customer_id: customer?.id,
        customer_phone: phone,
        customer_name: customerName || undefined,
        store_id: storeId,
        payment_method: paymentMethod,
        bank_account_id: bankAccountId || undefined,
        upi_reference: upiReference || undefined,
        paid_amount: paidAmount !== null ? paidAmount : finalTotal,
        discount_percentage: discount,
        discount_amount: discountAmount,
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          gst_percentage: item.gst_percentage,
          discount_type: item.discount_type,
          discount_value: item.discount_value
        }))
      };

      const res = await InvoiceService.Checkout(payload);
      toast.success("Transaction completed successfully!");
      generatePDF(res.AddtionalData || res.result || res);
      clearCart();
      setPhone('');
      setCustomerName('');
      setCustomer(null);
      setDiscount(0);
      setDiscountAmount(0);
      setBankAccountId('');
      setUpiReference('');
      setPaidAmount(null);
    } catch (err: any) {
      toast.error(err.message || "Checkout failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-[32px] border border-border shadow-sm overflow-hidden">
      <div className="p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <ReceiptText className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-black text-white">Checkout</h3>
        </div>

        {/* Customer Section */}
        <div className="space-y-3">
          <Label htmlFor="phone" className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">Customer Connection</Label>
          <div className="relative">
            <Input 
              id="phone" 
              placeholder="Enter mobile number..." 
              value={phone}
              onChange={handlePhoneChange}
              className="h-12 px-5 rounded-xl bg-slate-900 border-slate-800 focus:bg-slate-950 transition-all text-white"
            />
          </div>
          <Input 
            placeholder="Customer name (optional)" 
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="h-10 px-5 rounded-xl bg-slate-900 border-slate-800 focus:bg-slate-950 transition-all text-sm text-white"
          />
          {customer && (
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                  {customer.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-black text-white">{customer.name}</div>
                  <div className="text-[10px] font-bold text-primary uppercase tracking-wider">Loyalty: ₹{customer.total_purchases?.toLocaleString() || 0}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator className="opacity-50" />

        {/* Payment & Discount */}
        <div className="space-y-4">
          <div>
            <Label className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black mb-3 block">Payment Method</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Cash', icon: Banknote, label: 'Cash' },
                { id: 'UPI', icon: Wallet, label: 'UPI' },
                { id: 'Card', icon: CreditCard, label: 'Card' }
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex flex-col items-center justify-center h-20 rounded-2xl border-2 transition-all gap-1 ${
                    paymentMethod === method.id 
                    ? 'border-primary bg-primary/10 text-primary shadow-[0_0_20px_rgba(34,211,238,0.2)]' 
                    : 'border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  <method.icon className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {(paymentMethod === 'UPI' || paymentMethod === 'Card') && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
              <div>
                <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2 block">Settlement Bank</Label>
                <Select value={bankAccountId} onValueChange={setBankAccountId}>
                  <SelectTrigger className="rounded-xl bg-slate-900 border-slate-800 text-white">
                    <SelectValue placeholder="Select Bank..." />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map(bank => (
                      <SelectItem key={bank.id} value={bank.id}>{bank.bank_name} ({bank.account_number.slice(-4)})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2 block">Transaction / UPI Ref</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input 
                    placeholder="Enter Ref Number..." 
                    value={upiReference}
                    onChange={(e) => setUpiReference(e.target.value)}
                    className="h-10 pl-10 rounded-xl bg-slate-900 border-slate-800 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <Label className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black mb-3 block">Payment Received</Label>
            <div className="relative">
              <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <Input 
                type="number"
                placeholder={`Full Amount (₹${finalTotal.toLocaleString()})`}
                value={paidAmount || ''}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                className="h-12 pl-12 rounded-xl bg-slate-900 border-slate-800 font-black text-lg focus:bg-slate-950 text-white"
              />
            </div>
            {paidAmount !== null && paidAmount < finalTotal && (
              <p className="text-[10px] text-amber-500 font-bold mt-2 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Remaining ₹{(finalTotal - paidAmount).toLocaleString()} will be added to Customer Credit
              </p>
            )}
          </div>



          <div>
            <Label className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black mb-3 block">Special Discount</Label>
            <div className="flex gap-2 mb-3">
              {[5, 10, 20].map(pct => (
                <button 
                  key={pct}
                  onClick={() => { setDiscount(pct); setDiscountAmount(0); }}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${
                    discount === pct ? 'bg-primary text-white shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-slate-900 text-slate-500 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {pct}% OFF
                </button>
              ))}
              <button 
                onClick={() => { setDiscount(0); setDiscountAmount(0); }}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-400 text-[10px] font-black hover:bg-slate-700 border border-slate-700"
              >
                Reset
              </button>
            </div>
            <Input 
              type="number" 
              value={discount || ''}
              onChange={(e) => setDiscount(Number(e.target.value))}
              placeholder="Custom %"
              className="h-10 rounded-xl bg-slate-900 border-slate-800 text-white mb-3 focus:bg-slate-950"
            />
            <Label className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black mb-2 block">Flat Amount Discount (₹)</Label>
            <div className="flex gap-2 mb-3">
              {[50, 100, 200, 500].map(amt => (
                <button 
                  key={amt}
                  onClick={() => { setDiscountAmount(amt); setDiscount(0); }}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${
                    discountAmount === amt ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-900 text-slate-500 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
            <Input 
              type="number" 
              value={discountAmount || ''}
              onChange={(e) => setDiscountAmount(Number(e.target.value))}
              placeholder="Enter custom amount..."
              className="h-10 rounded-xl bg-slate-900 border-slate-800 text-white focus:bg-slate-950"
            />
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="bg-slate-900 p-8 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>Subtotal</span>
            <span className="text-white">₹{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>GST / Taxes</span>
            <span className="text-white">₹{taxAmount.toLocaleString()}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-xs font-bold text-green-400 uppercase tracking-widest">
              <span>Discount ({discount}%)</span>
              <span>-₹{percentDiscount.toLocaleString()}</span>
            </div>
          )}
          {discountAmount > 0 && (
            <div className="flex justify-between text-xs font-bold text-green-400 uppercase tracking-widest">
              <span>Flat Discount</span>
              <span>-₹{discountAmount.toLocaleString()}</span>
            </div>
          )}
        </div>
        
        <div className="pt-4 border-t border-slate-800 flex justify-between items-end">
          <TotalWeightDisplay items={items} />
          <div className="text-right space-y-1">
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Grand Total</p>
            <p className="text-5xl font-black text-white leading-none">₹{finalTotal.toLocaleString()}</p>
          </div>
        </div>

        <Button 
          className="w-full h-16 rounded-2xl text-xl font-black shadow-2xl shadow-primary/40 bg-primary hover:bg-primary/90 mt-4" 
          onClick={handleCheckout} 
          disabled={items.length === 0 || isProcessing}
        >
          {isProcessing ? "PROCESSING..." : "FINALIZE BILL"}
        </Button>
      </div>
    </div>
  );
};

export default Checkout;
