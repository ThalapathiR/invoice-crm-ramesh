import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Printer, Loader2 } from "lucide-react";
import { ThermalPrintService } from "@/service/thermalPrint.service";
import { InvoiceService } from "@/service/invoice.service";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { toast } from "sonner";

interface SalesReportProps {
  data: any[];
}

const SalesReport: React.FC<SalesReportProps> = ({ data = [] }) => {
  const { user } = useAuth();
  const [printingId, setPrintingId] = useState<string | null>(null);
  const safeData = Array.isArray(data) ? data : [];
  const total = safeData.reduce((acc, item) => acc + (item.total_amount || 0), 0);

  const handlePrint = async (invoiceId: string) => {
    setPrintingId(invoiceId);
    try {
      const res: any = await InvoiceService.GetById(invoiceId);
      const invoiceData = res.result || res;
      await ThermalPrintService.printReceipt({
        ...invoiceData,
        company: (user as any)?.company
      });
    } catch (err) {
      toast.error("Failed to fetch invoice details");
    } finally {
      setPrintingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-cyan-500/10 p-6 rounded-2xl border border-cyan-500/20 flex justify-between items-center">
        <div>
          <div className="text-sm text-cyan-500 font-bold uppercase tracking-widest">Total Sales Volume</div>
          <div className="text-4xl font-black text-foreground">₹{total.toLocaleString()}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground font-medium">Transaction Count</div>
          <div className="text-2xl font-bold text-foreground">{safeData.length}</div>
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-card/50 border-border">
              <TableHead className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Invoice #</TableHead>
              <TableHead className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Customer</TableHead>
              <TableHead className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Payment</TableHead>
              <TableHead className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Subtotal</TableHead>
              <TableHead className="text-slate-500 font-black text-[10px] uppercase tracking-widest">GST</TableHead>
              <TableHead className="text-right text-slate-500 font-black text-[10px] uppercase tracking-widest">Grand Total</TableHead>
              <TableHead className="text-right text-slate-500 font-black text-[10px] uppercase tracking-widest">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeData.map((invoice) => (
              <TableRow key={invoice.id} className="hover:bg-white/5 border-border">
                <TableCell className="font-mono text-[10px] font-black text-slate-500">{invoice.invoice_number}</TableCell>
                <TableCell className="text-slate-300 font-bold">{invoice.customer?.name || 'Walk-in'}</TableCell>
                <TableCell>
                  <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-black uppercase tracking-wider border border-slate-700">
                    {invoice.payment_method}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">₹{(invoice.subtotal || 0).toLocaleString()}</TableCell>
                <TableCell className="text-muted-foreground">₹{(invoice.tax_amount || 0).toLocaleString()}</TableCell>
                <TableCell className="text-right font-black text-cyan-400">₹{(invoice.total_amount || 0).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-primary hover:bg-primary/10"
                    onClick={() => handlePrint(invoice.id)}
                    disabled={printingId === invoice.id}
                  >
                    {printingId === invoice.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SalesReport;
