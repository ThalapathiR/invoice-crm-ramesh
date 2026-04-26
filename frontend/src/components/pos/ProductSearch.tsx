import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProductService } from '@/service/product.service';
import { useAuth } from '@/lib/auth';
import { Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProductSearchProps {
  onProductFound: (product: any) => void;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ onProductFound }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { user } = useAuth();

  const handleSearch = async (searchVal: string) => {
    if (!searchVal || searchVal.length < 2) {
      setSuggestions([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const storeId = (user as any)?.company?.id || (user as any)?.user_id;
      if (!storeId || storeId === "undefined") return;
      
      const results = await ProductService.Search(searchVal, storeId);
      setSuggestions(results || []);
      setShowSuggestions(true);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Exact match search (for barcode scan)
  const handleExactSearch = async () => {
    if (!query) return;
    setIsSearching(true);
    try {
      const storeId = (user as any)?.company?.id || (user as any)?.user_id;
      const product = await ProductService.GetByBarcode(query, storeId);
      if (product) {
        onProductFound(product);
        setQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
        toast.success(`Added ${product.name}`);
      } else {
        toast.error("Product not found");
      }
    } catch (err: any) {
      toast.error(err.message || "Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input 
            placeholder="Search name, barcode or SKU..." 
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              handleSearch(val);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleExactSearch()}
            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
            className="h-12 px-5 rounded-xl bg-slate-900 border-slate-800 focus:bg-slate-950 focus:border-primary transition-all text-white placeholder:text-slate-600"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        <Button onClick={handleExactSearch} className="h-12 px-6 rounded-xl font-bold">
          <Search className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[300px] overflow-y-auto">
            {suggestions.map((p) => (
              <button
                key={p.id}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-800 transition-colors border-b border-slate-800 last:border-0"
                onClick={() => {
                  onProductFound(p);
                  setQuery('');
                  setSuggestions([]);
                  setShowSuggestions(false);
                  toast.success(`Added ${p.name}`);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {p.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white">{p.name}</div>
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider">SKU: {p.sku} | Barcode: {p.barcode}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-primary text-lg">₹{p.selling_price}</div>
                  <div className={`text-[10px] font-bold uppercase tracking-widest ${p.quantity_in_stock <= 5 ? 'text-red-500' : 'text-slate-400'}`}>
                    {p.quantity_in_stock} In Stock
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showSuggestions && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
};

export default ProductSearch;
