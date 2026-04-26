import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface GSTReportProps {
  data: any[];
}

const GSTReport: React.FC<GSTReportProps> = ({ data = [] }) => {
  const safeData = Array.isArray(data) ? data : [];
  const totalGST = safeData.reduce((acc, item) => acc + (item.gst_amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="bg-amber-500/10 p-6 rounded-2xl border border-amber-500/20 flex justify-between items-center">
        <div>
          <div className="text-sm text-amber-500 font-bold uppercase tracking-widest">Total Tax Collected</div>
          <div className="text-4xl font-black text-amber-400">₹{totalGST.toLocaleString()}</div>
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>GST Category</TableHead>
              <TableHead>Taxable Value</TableHead>
              <TableHead>GST Amount</TableHead>
              <TableHead className="text-right">Gross Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeData.map((item, idx) => (
              <TableRow key={idx} className="hover:bg-white/5 border-slate-800">
                <TableCell className="font-bold text-white">{item.gst_percentage}% GST</TableCell>
                <TableCell className="text-slate-400">₹{(item.taxable_value || 0).toLocaleString()}</TableCell>
                <TableCell className="text-amber-500 font-medium">₹{(item.gst_amount || 0).toLocaleString()}</TableCell>
                <TableCell className="text-right font-bold text-white">₹{(item.total || 0).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {safeData.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No tax data available for the selected period
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default GSTReport;
