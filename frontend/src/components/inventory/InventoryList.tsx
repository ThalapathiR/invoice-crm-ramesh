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
import { History } from 'lucide-react';

interface InventoryListProps {
  products: any[];
  onAdjust: (product: any) => void;
  onViewHistory: (product: any) => void;
}

const InventoryList: React.FC<InventoryListProps> = ({ products, onAdjust, onViewHistory }) => {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-card/50 border-border">
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Current Stock</TableHead>
            <TableHead>Threshold</TableHead>
            <TableHead className="w-[150px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="font-semibold text-foreground">{product.name}</div>
                <div className="text-xs text-muted-foreground">{product.category}</div>
              </TableCell>
              <TableCell className="font-mono text-xs">{product.sku}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${
                    product.quantity_in_stock <= 5 ? 'text-red-500' : 'text-foreground'
                  }`}>
                    {product.quantity_in_stock}
                  </span>
                  {product.quantity_in_stock <= 5 && (
                    <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-bold uppercase border border-red-500/20">Low</span>
                  )}
                </div>
              </TableCell>
              <TableCell>5 units</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="outline" size="sm" onClick={() => onAdjust(product)}>
                    Adjust
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onViewHistory(product)}>
                    <History className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InventoryList;
