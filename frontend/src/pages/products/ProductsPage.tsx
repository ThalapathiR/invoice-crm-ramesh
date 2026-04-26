import React, { useState, useEffect } from 'react';
import { ProductService } from '@/service/product.service';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ProductList from '@/components/products/ProductList';
import ProductForm from '@/components/products/ProductForm';
import { toast } from 'sonner';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const storeId = (user as any)?.company?.id || (user as any)?.user_id; // fallback to user_id if company not loaded
      if (!storeId || storeId === "undefined") {
        console.warn("ProductsPage: storeId is missing, skipping fetch");
        setIsLoading(false);
        return;
      }
      const data = await ProductService.GetList(storeId);
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      setProducts(list);
      setFilteredProducts(list);
    } catch (err) {
      toast.error("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    setFilteredProducts(
      products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.barcode.toLowerCase().includes(query) || 
        p.sku.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      )
    );
  }, [searchQuery, products]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await ProductService.DeleteProduct(id);
        toast.success("Product deleted");
        fetchProducts();
      } catch (err) {
        toast.error("Delete failed");
      }
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      const storeId = (user as any)?.company?.id;
      if (!storeId) {
        toast.error("Store ID missing. Please refresh the page.");
        return;
      }

      const { variants, ...productBase } = data;
      
      if (editingProduct) {
        // When editing, we just update the specific record
        // Note: In this simple version, we assume variants[0] is the current product's size/qty
        const payload = { 
          ...productBase, 
          size: variants[0].size,
          color: variants[0].color,
          quantity_in_stock: variants[0].quantity,
          store_id: storeId 
        };
        await ProductService.Update(editingProduct.id, payload);
        toast.success("Product updated");
      } else {
        // When adding new, we create a separate entry for each size
        const createPromises = variants.map((v: any) => {
          const payload = {
            ...productBase,
            size: v.size,
            color: v.color,
            quantity_in_stock: v.quantity,
            barcode: variants.length > 1 ? `${productBase.barcode}-${v.size}${v.color ? '-' + v.color : ''}` : productBase.barcode,
            sku: variants.length > 1 ? `${productBase.sku}-${v.size}${v.color ? '-' + v.color : ''}` : productBase.sku,
            store_id: storeId
          };
          return ProductService.Insert(payload);
        });

        await Promise.all(createPromises);
        toast.success(`${variants.length} products added successfully`);
      }

      setIsFormOpen(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="page-header-brand flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Product Inventory</h1>
          <p className="text-blue-100/80 font-medium">Manage your clothing items, stock levels, and barcodes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl" onClick={fetchProducts} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button className="btn-brand bg-white text-slate-900 hover:bg-slate-100 border-none h-12 px-6 rounded-2xl font-black shadow-lg shadow-black/5" onClick={handleAddProduct}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-[32px] border border-border shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, SKU or barcode..." 
            className="pl-10 border-none bg-slate-900 rounded-2xl h-12 font-bold text-white placeholder:text-slate-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ProductList 
        products={filteredProducts} 
        onEdit={handleEditProduct} 
        onDelete={handleDeleteProduct} 
      />

      <ProductForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        product={editingProduct}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default ProductsPage;
