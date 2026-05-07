import React, { useState, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { InvoiceService } from '@/service/invoice.service';
import { CustomerService } from '@/service/customer.service';
import { useAuth } from '@/lib/auth';
import TotalWeightDisplay from "./TotalWeightDisplay";
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ReceiptText,
  Banknote,
  Wallet,
  CreditCard
} from 'lucide-react';
import { ThermalPrintService } from '@/service/thermalPrint.service';

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
  const [errors, setErrors] = useState<{ phone?: boolean; name?: boolean }>({});
  const { user } = useAuth();
  const phoneRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);

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
    setErrors(prev => ({ ...prev, phone: false }));
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

  const percentDiscount = (Number(subtotal) || 0) * discount / 100;
  const flatDiscount = discountAmount;
  const totalDiscount = percentDiscount + flatDiscount;
  const finalTotal = Math.max(0, (Number(totalAmount) || 0) - totalDiscount);

  const generatePDF = (invoiceData: any) => {
    const doc = new jsPDF();
    const company = (user as any)?.company || {};

    // 1. Header (Centered Retail Style)
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text(company.name || "INVOICE", 105, 20, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text(company.website || "", 105, 26, { align: "center" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Store Contact Number : ${company.telephone_no || ""}`, 105, 32, { align: "center" });
    doc.text(`Place Of Supply : ${company.address || ""}`, 105, 37, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`GSTIN NO : ${company.uen_no || ""}`, 105, 43, { align: "center" });

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
    doc.text(`CUSTOMER ID : ${customer?.id ? customer.id.substring(0, 8).toUpperCase() : 'WALK-IN'}`, 20, currentY + 10);

    // Right side
    doc.text(`${new Date().toLocaleString()}`, 190, currentY, { align: "right" });
    doc.text(`CASHIER : ${user?.name || 'ADMIN'}`, 190, currentY + 5, { align: "right" });
    doc.text(`MOBILE NO : ${customer?.phone || invoiceData.customer_phone || 'NA'}`, 190, currentY + 10, { align: "right" });

    // 3. Items Table
    autoTable(doc, {
      startY: currentY + 18,
      head: [['Item Description', 'Unit Price', 'QTY', 'Total Amount']],
      body: items.map(item => {
        const mrpVal = Number(item.mrp || item.price || 0);
        const spVal = Number(item.price || 0);
        const discVal = Math.max(0, mrpVal - spVal);

        const description = discVal > 0
          ? `${item.name}\nMRP: Rs. ${mrpVal.toLocaleString()} | Selling Price: Rs. ${spVal.toLocaleString()} | Discount: Rs. ${discVal.toLocaleString()}`
          : item.name;

        return [
          {
            content: description,
            styles: { halign: 'left' }
          },
          `Rs. ${spVal.toLocaleString()}`,
          `${item.quantity} PC`,
          `Rs. ${(spVal * item.quantity).toLocaleString()}`
        ];
      }),
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
    const totalSavings = items.reduce((acc, item) => acc + (Math.max(0, (item.mrp || item.price) - item.price) * item.quantity), 0);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Gross Total:`, 140, finalY + 10);
    doc.text(`Rs. ${totalAmount.toLocaleString()}`, 190, finalY + 10, { align: "right" });

    if (totalSavings > 0) {
      doc.setFontSize(9);
      doc.setTextColor(16, 185, 129); // Emerald color
      doc.text(`You Saved:`, 140, finalY + 16);
      doc.text(`Rs. ${totalSavings.toLocaleString()}`, 190, finalY + 16, { align: "right" });
      doc.setTextColor(0, 0, 0);
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Invoice Amount:`, 140, finalY + 24);
    doc.text(`Rs. ${finalTotal.toLocaleString()}`, 190, finalY + 24, { align: "right" });

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

    const newErrors = {
      phone: !phone.trim(),
      name: !customerName.trim() && !customer?.name
    };

    setErrors(newErrors);

    if (newErrors.phone || newErrors.name) {
      if (newErrors.phone) {
        phoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (newErrors.name) {
        nameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      const msg = newErrors.phone ? "Phone number is required" : "Customer name is required";
      toast.error(msg);
      return;
    }

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
      const invoiceData = res.AddtionalData || res.result || res;
      // generatePDF(invoiceData); // Disabled PDF download as requested

      // Always print thermal receipt after successful transaction
      ThermalPrintService.printReceipt({
        ...invoiceData,
        company: (user as any)?.company,
        customer_name: customerName || customer?.name,
        items: items
      });

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
          <h3 className="text-xl font-black text-foreground">Checkout</h3>
        </div>

        {/* Customer Section */}
        <div className="space-y-3" ref={phoneRef}>
          <Label htmlFor="phone" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black">Customer Connection</Label>
          <div className="relative">
            <Input
              id="phone"
              placeholder="Enter mobile number..."
              value={phone}
              onChange={handlePhoneChange}
              className={`h-12 px-5 rounded-xl bg-card border-border focus:bg-background transition-all text-foreground ${errors.phone ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
            />
            {errors.phone && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 animate-in fade-in slide-in-from-top-1">Phone number is mandatory</p>}
          </div>
          <div className="space-y-1" ref={nameRef}>
            <Input
              placeholder="Customer Name"
              value={customerName || customer?.name || ''}
              onChange={(e) => {
                setCustomerName(e.target.value);
                setErrors(prev => ({ ...prev, name: false }));
              }}
              className={`h-10 px-5 rounded-xl bg-card border-border focus:bg-background transition-all text-sm text-foreground ${errors.name ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
            />
            {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1 animate-in fade-in slide-in-from-top-1">Customer name is mandatory</p>}
          </div>
          {customer && (
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-foreground font-bold">
                  {customer.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-black text-foreground">{customer.name}</div>
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
            <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black mb-3 block">Payment Method</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Cash', icon: Banknote, label: 'Cash' },
                { id: 'UPI', icon: Wallet, label: 'UPI' },
                { id: 'Card', icon: CreditCard, label: 'Card' }
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex flex-col items-center justify-center h-20 rounded-2xl border-2 transition-all gap-1 ${paymentMethod === method.id
                    ? 'border-primary bg-primary/10 text-primary shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                    : 'border-border bg-card text-slate-500 hover:border-slate-700'
                    }`}
                >
                  <method.icon className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment received input remains */}
          <div>
            <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black mb-3 block">Payment Received</Label>
            <div className="relative">
              <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <Input
                type="number"
                placeholder={`Full Amount (₹${finalTotal.toLocaleString()})`}
                value={paidAmount || ''}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                className="h-12 pl-12 rounded-xl bg-card border-border font-black text-lg focus:bg-background text-foreground"
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
            <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black mb-3 block">Special Discount</Label>
            <div className="flex gap-2 mb-3">
              {[5, 10, 20].map(pct => (
                <button
                  key={pct}
                  onClick={() => { setDiscount(pct); setDiscountAmount(0); }}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${discount === pct ? 'bg-primary text-foreground shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-card text-slate-500 hover:bg-muted border border-border'
                    }`}
                >
                  {pct}% OFF
                </button>
              ))}
              <button
                onClick={() => { setDiscount(0); setDiscountAmount(0); }}
                className="px-3 py-2 rounded-xl bg-muted text-muted-foreground text-[10px] font-black hover:bg-slate-700 border border-slate-700"
              >
                Reset
              </button>
            </div>
            <Input
              type="number"
              value={discount || ''}
              onChange={(e) => setDiscount(Number(e.target.value))}
              placeholder="Custom %"
              className="h-10 rounded-xl bg-card border-border text-foreground mb-3 focus:bg-background"
            />
            <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black mb-2 block">Flat Amount Discount (₹)</Label>
            <div className="flex gap-2 mb-3">
              {[50, 100, 200, 500].map(amt => (
                <button
                  key={amt}
                  onClick={() => { setDiscountAmount(amt); setDiscount(0); }}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${discountAmount === amt ? 'bg-emerald-500 text-foreground shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-card text-slate-500 hover:bg-muted border border-border'
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
              className="h-10 rounded-xl bg-card border-border text-foreground focus:bg-background"
            />
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="bg-card p-8 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <span>Subtotal</span>
            <span className="text-foreground">₹{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <span>GST / Taxes</span>
            <span className="text-foreground">₹{taxAmount.toLocaleString()}</span>
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

        <div className="pt-6 border-t border-border flex justify-between items-center bg-emerald-500/5 -mx-8 px-8 py-6 mb-2 border-y border-emerald-500/10">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] leading-none">Customer Saved</p>
            </div>
            <p className="text-3xl font-black text-emerald-600 leading-none drop-shadow-sm">₹{((items.reduce((acc, item) => acc + (Math.max(0, (Number(item.mrp) || Number(item.price) || 0) - (Number(item.price) || 0)) * (item.quantity || 1)), 0)) + totalDiscount).toLocaleString()}</p>
            <p className="text-[9px] font-bold text-emerald-600/60 uppercase tracking-widest">Today's Total Savings</p>
          </div>
          <div className="text-right space-y-2">
            <p className="text-muted-foreground font-black text-[11px] uppercase tracking-[0.25em] leading-none opacity-70">Total Payable</p>
            <p className="text-5xl font-black text-foreground leading-none tracking-tighter drop-shadow-md">₹{finalTotal.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex justify-end mb-4 pr-1">
          <TotalWeightDisplay items={items} />
        </div>

        <Button
          className="w-full h-20 rounded-[24px] text-2xl font-black shadow-2xl shadow-primary/40 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] flex flex-col gap-0.5"
          onClick={handleCheckout}
          disabled={items.length === 0 || isProcessing}
        >
          <span>{isProcessing ? "PROCESSING..." : "FINALIZE BILL"}</span>
          <span className="text-[10px] opacity-70 font-bold">GENERATE RECEIPT & PRINT</span>
        </Button>
      </div>
    </div>
  );
};

export default Checkout;
