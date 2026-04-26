import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Plus, Search, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MasterPageTemplateProps {
  title: string;
  description: string;
  itemName: string;
  service: any;
  deleteMethodName: string;
}

const MasterPageTemplate: React.FC<MasterPageTemplateProps> = ({ 
  title, 
  description, 
  itemName, 
  service,
  deleteMethodName
}) => {
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [nameInput, setNameInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const storeId = (user as any)?.company?.id;
      const fetchMethod = service.GetList || service.GetAll;
      const data = await fetchMethod.call(service, storeId);
      const list = Array.isArray(data) ? data : (data?.data || data?.result || []);
      setItems(list);
      setFilteredItems(list);
    } catch (err) {
      toast.error(`Failed to fetch ${itemName}s`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchItems();
  }, [user]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    setFilteredItems(
      items.filter(i => i.name.toLowerCase().includes(query))
    );
  }, [searchQuery, items]);

  const handleAddItem = () => {
    setEditingItem(null);
    setNameInput('');
    setIsFormOpen(true);
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setNameInput(item.name);
    setIsFormOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm(`Are you sure you want to delete this ${itemName}?`)) {
      try {
        await service[deleteMethodName](id);
        toast.success(`${itemName} deleted`);
        fetchItems();
      } catch (err) {
        toast.error("Delete failed");
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    try {
      const storeId = (user as any)?.company?.id;
      const payload = { name: nameInput, store_id: storeId };
      
      if (editingItem) {
        await service.Update(editingItem.id, payload);
        toast.success(`${itemName} updated`);
      } else {
        await service.Insert(payload);
        toast.success(`${itemName} added`);
      }
      setIsFormOpen(false);
      fetchItems();
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen">
      <div className="page-header-brand flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">{title}</h1>
          <p className="text-blue-100/80 font-medium">{description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl" onClick={fetchItems} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button className="btn-brand bg-white text-slate-900 hover:bg-slate-100 border-none h-12 px-6 rounded-2xl font-black shadow-lg shadow-black/5" onClick={handleAddItem}>
            <Plus className="w-4 h-4 mr-2" />
            Add {itemName}
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-[32px] border border-border shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input 
            placeholder={`Search ${itemName}s...`} 
            className="pl-10 border-none bg-slate-900 rounded-2xl h-12 font-bold text-white placeholder:text-slate-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-900/50">
            <TableRow className="hover:bg-transparent border-slate-800">
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 pl-6">Name</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={2} className="text-center py-10 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow><TableCell colSpan={2} className="text-center py-10 text-muted-foreground">No {itemName}s found</TableCell></TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-white/5 border-slate-800 transition-colors">
                  <TableCell className="font-bold text-white py-4 pl-6">{item.name}</TableCell>
                  <TableCell className="text-right py-4 pr-6">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-500 hover:text-primary hover:bg-primary/10" onClick={() => handleEditItem(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-500/10" onClick={() => handleDeleteItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md rounded-[32px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white">
              {editingItem ? `Edit ${itemName}` : `Add New ${itemName}`}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-6 pt-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">{itemName} Name</label>
                <Input 
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder={`e.g. ${itemName === 'Category' ? "Men's Wear" : 'XL'}`}
                className="h-12 rounded-2xl bg-slate-900 border-slate-800 focus:bg-slate-950 text-white text-lg font-bold"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)} className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-slate-500 hover:bg-white/5 transition-colors">Cancel</Button>
              <Button type="submit" className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest bg-white text-slate-900 shadow-xl shadow-black/20 hover:bg-slate-100 transition-colors">Save {itemName}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MasterPageTemplate;
