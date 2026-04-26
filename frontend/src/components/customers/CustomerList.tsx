import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Edit, Users, ShoppingBag } from 'lucide-react';

interface CustomerListProps {
  customers: any[];
  onEdit: (customer: any) => void;
  onShowHistory: (customer: any) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ customers, onEdit, onShowHistory }) => {
  if (customers.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
        <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p className="text-lg font-medium">No customers found</p>
      </div>
    );
  }

  return (
    <div className="rounded-[32px] border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-900/50 hover:bg-slate-900/50 border-slate-800">
            <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-5">Name</TableHead>
            <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-5">Phone</TableHead>
            <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-5">Email</TableHead>
            <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-5">Total Invoices</TableHead>
            <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-5">Last Visit</TableHead>
            <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-5 text-right px-8">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow 
              key={customer.id} 
              className="group cursor-pointer hover:bg-white/5 border-slate-800 transition-colors"
              onClick={() => onShowHistory(customer)}
            >
              <TableCell className="py-4 font-black text-white">{customer.name}</TableCell>
              <TableCell className="py-4 font-bold text-slate-400">{customer.phone}</TableCell>
              <TableCell className="py-4 text-slate-500">{customer.email || '-'}</TableCell>
              <TableCell className="py-4">
                <span className="bg-slate-800 text-cyan-400 px-3 py-1 rounded-full text-xs font-black border border-cyan-500/20">
                  {customer.total_invoices || 0}
                </span>
              </TableCell>
              <TableCell className="py-4 font-bold text-slate-500">
                {customer.last_visit ? new Date(customer.last_visit).toLocaleDateString() : 'N/A'}
              </TableCell>
              <TableCell className="py-4 text-right px-8 space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-9 h-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShowHistory(customer);
                  }}
                  title="Purchase History"
                >
                  <ShoppingBag className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-9 h-9 rounded-xl hover:bg-white/10 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(customer);
                  }}
                  title="Edit Customer"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomerList;
