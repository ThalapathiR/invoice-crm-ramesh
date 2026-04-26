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
import { Edit, Trash2, Package, QrCode, ScanBarcode } from 'lucide-react';
import { StickerService } from '@/service/sticker.service';
import { toast } from 'sonner';

interface ProductListProps {
  products: any[];
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onEdit, onDelete }) => {
  if (products.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
        <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p className="text-lg font-medium">No products found</p>
        <p className="text-sm">Add your first product to get started</p>
      </div>
    );
  }

  return (
    <div className="crm-table-container">
      <Table className="crm-table table-teal">
        <TableHeader>
          <TableRow className="hover:bg-transparent border-none">
            <TableHead>Barcode</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Price (Sell)</TableHead>
            <TableHead className="text-center">Stock</TableHead>
            <TableHead className="w-[150px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-mono text-xs">{product.barcode}</TableCell>
              <TableCell className="font-bold text-slate-500 uppercase tracking-tighter">{product.sku}</TableCell>
              <TableCell>
                <div>
                  <div className="font-black text-slate-900">{product.name}</div>
                  <div className="text-xs text-muted-foreground font-medium">{product.size} / {product.color}</div>
                </div>
              </TableCell>
              <TableCell>
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                  {product.category}
                </span>
              </TableCell>
              <TableCell className="column-price text-right text-lg">₹{product.selling_price.toLocaleString()}</TableCell>
              <TableCell className="text-center">
                <span className={
                  product.quantity_in_stock <= 0 ? 'badge-neutral' :
                  product.quantity_in_stock <= 5 ? 'badge-teal-warning' : 
                  'badge-teal-success'
                }>
                  {product.quantity_in_stock <= 0 ? 'Out of Stock' : 
                   product.quantity_in_stock <= 5 ? 'Low Stock' : 'In Stock'}
                </span>
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-50 mt-1">{product.quantity_in_stock} Units</div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    title="Print Barcode Label"
                    onClick={() => {
                      toast.promise(StickerService.generateProductSticker(product), {
                        loading: 'Generating label...',
                        success: 'Label downloaded!',
                        error: 'Failed to generate label'
                      });
                    }}
                  >
                    <ScanBarcode className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(product)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(product.id)}>
                    <Trash2 className="h-4 w-4" />
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

export default ProductList;
