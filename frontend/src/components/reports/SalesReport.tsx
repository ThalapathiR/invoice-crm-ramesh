import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface SalesReportProps {
  data: any[];
}

const SalesReport: React.FC<SalesReportProps> = ({ data = [] }) => {
  const safeData = Array.isArray(data) ? data : [];
  const total = safeData.reduce((acc, item) => acc + (item.total_amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="bg-cyan-500/10 p-6 rounded-2xl border border-cyan-500/20 flex justify-between items-center">
        <div>
          <div className="text-sm text-cyan-500 font-bold uppercase tracking-widest">Total Sales Volume</div>
          <div className="text-4xl font-black text-white">₹{total.toLocaleString()}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400 font-medium">Transaction Count</div>
          <div className="text-2xl font-bold text-white">{safeData.length}</div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-900/50 border-slate-800">
              <TableHead className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Invoice #</TableHead>
              <TableHead className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Customer</TableHead>
              <TableHead className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Payment</TableHead>
              <TableHead className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Subtotal</TableHead>
              <TableHead className="text-slate-500 font-black text-[10px] uppercase tracking-widest">GST</TableHead>
              <TableHead className="text-right text-slate-500 font-black text-[10px] uppercase tracking-widest">Grand Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeData.map((invoice) => (
              <TableRow key={invoice.id} className="hover:bg-white/5 border-slate-800">
                <TableCell className="font-mono text-[10px] font-black text-slate-500">{invoice.invoice_number}</TableCell>
                <TableCell className="text-slate-300 font-bold">{invoice.customer?.name || 'Walk-in'}</TableCell>
                <TableCell>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-wider border border-slate-700">
                    {invoice.payment_method}
                  </span>
                </TableCell>
                <TableCell className="text-slate-400">₹{(invoice.subtotal || 0).toLocaleString()}</TableCell>
                <TableCell className="text-slate-400">₹{(invoice.tax_amount || 0).toLocaleString()}</TableCell>
                <TableCell className="text-right font-black text-cyan-400">₹{(invoice.total_amount || 0).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SalesReport;
