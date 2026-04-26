import React from 'react';
import { useCart } from '@/context/CartContext';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TotalWeightDisplay from './TotalWeightDisplay';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

const Cart: React.FC = () => {
  const { items, removeItem, updateQuantity, updateDiscount } = useCart();

  if (items.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-xl bg-muted/30">
        <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p className="text-lg font-medium">Cart is empty</p>
        <p className="text-sm">Scan a product or search to add items</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            let itemDiscount = 0;
            if (item.discount_value) {
              if (item.discount_type === 'PERCENTAGE') {
                itemDiscount = (item.price * item.quantity * item.discount_value) / 100;
              } else {
                itemDiscount = item.discount_value;
              }
            }
            const itemTotal = (item.price * item.quantity) - itemDiscount;

            return (
              <TableRow key={item.id} className="border-slate-800 hover:bg-white/5 transition-colors">
                <TableCell className="py-4">
                  <div>
                    <div className="font-semibold text-white">{item.name}</div>
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider">GST: {item.gst_percentage}%</div>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-slate-400">₹{item.price.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 rounded-xl border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-4 text-center font-black text-sm text-white">{item.quantity}</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 rounded-xl border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number"
                      value={item.discount_value || ''}
                      onChange={(e) => updateDiscount(item.id, item.discount_type || 'PERCENTAGE', parseFloat(e.target.value) || 0)}
                      className="w-16 h-8 px-2 text-xs font-bold bg-slate-900 border border-slate-800 rounded-lg focus:border-primary outline-none text-white"
                      placeholder="0"
                    />
                    <select 
                      value={item.discount_type}
                      onChange={(e) => updateDiscount(item.id, e.target.value as any, item.discount_value || 0)}
                      className="h-8 text-[10px] font-black border border-slate-800 rounded-lg bg-slate-900 text-slate-400 px-1 outline-none"
                    >
                      <option value="PERCENTAGE">%</option>
                      <option value="FIXED">₹</option>
                    </select>
                  </div>
                </TableCell>
                <TableCell className="font-black text-primary">
                  ₹{itemTotal.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex justify-between items-center">
        <div className="flex gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Items</p>
            <p className="text-xl font-black text-white">{items.reduce((acc, item) => acc + item.quantity, 0)}</p>
          </div>
          <TotalWeightDisplay items={items} />
        </div>
      </div>
    </div>
  );
};

export default Cart;
