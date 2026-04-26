import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from 'lucide-react';
import { CategoryService } from '@/service/category.service';
import { SizeService } from '@/service/size.service';
import { useAuth } from '@/lib/auth';

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  barcode: z.string().min(1, "Barcode is required"),
  sku: z.string().min(1, "SKU is required"),
  purchase_price: z.number().min(0),
  selling_price: z.number().min(0),
  gst_percentage: z.number().min(0).max(100),
  category: z.string().min(1, "Category is required"),
  reorder_level: z.number().int().min(0).default(5),
  variants: z.array(z.object({
    size: z.string().min(1, "Size is required"),
    color: z.string().optional(),
    quantity: z.number().int().min(0)
  })).min(1, "At least one size is required"),
});

interface ProductFormProps {
  product?: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, isOpen, onClose, onSubmit }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      barcode: '',
      sku: '',
      purchase_price: 0,
      selling_price: 0,
      gst_percentage: 12,
      category: '',
      reorder_level: 5,
      variants: [{ size: '', color: '', quantity: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const storeId = (user as any)?.company?.id;
        if (!storeId) return;

        const [catData, sizeData] = await Promise.all([
          CategoryService.GetList(storeId),
          SizeService.GetList(storeId)
        ]);

        setCategories(Array.isArray(catData) ? catData : (catData?.data ?? []));
        setSizes(Array.isArray(sizeData) ? sizeData : (sizeData?.data ?? []));
      } catch (err) {
        console.error("Failed to fetch masters:", err);
      }
    };

    if (isOpen && user) {
      fetchMasters();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (product) {
      form.reset({
        ...product,
        variants: [{ 
          size: product.size || '', 
          color: product.color || '', 
          quantity: product.quantity_in_stock || 0 
        }]
      });
    } else {
      form.reset({
        name: '',
        barcode: '',
        sku: '',
        purchase_price: 0,
        selling_price: 0,
        gst_percentage: 12,
        category: '',
        reorder_level: 5,
        variants: [{ size: '', color: '', quantity: 0 }],
      });
    }
  }, [product, form, isOpen]);

  const handleFormSubmit = (data: any) => {
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh] rounded-[32px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-white">
            {product ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-[10px] uppercase tracking-widest font-black text-slate-400">Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Cotton Blue Shirt" className="h-12 rounded-2xl bg-slate-900 border-slate-800 focus:bg-slate-950 text-white" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black text-slate-400">
                      Barcode
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-[10px] font-black uppercase tracking-wider text-primary hover:text-primary/80"
                        onClick={() => {
                          const randomBarcode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
                          form.setValue('barcode', randomBarcode);
                        }}
                      >
                        Generate
                      </Button>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Scan or type barcode" className="h-12 rounded-2xl bg-slate-900 border-slate-800 text-white" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase tracking-widest font-black text-slate-400">SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="Unique ID" className="h-12 rounded-2xl bg-slate-900 border-slate-800 text-white" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purchase_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase tracking-widest font-black text-slate-400">Purchase Price (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" className="h-12 rounded-2xl bg-slate-900 border-slate-800 text-white" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="selling_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase tracking-widest font-black text-slate-400">Selling Price (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" className="h-12 rounded-2xl bg-slate-900 border-slate-800 text-white" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gst_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase tracking-widest font-black text-slate-400">GST %</FormLabel>
                    <FormControl>
                      <Input type="number" className="h-12 rounded-2xl bg-slate-900 border-slate-800 text-white" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase tracking-widest font-black text-slate-400">Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-2xl bg-slate-900 border-slate-800 text-white">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reorder_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase tracking-widest font-black text-slate-400">Low Stock Threshold</FormLabel>
                    <FormControl>
                      <Input type="number" className="h-12 rounded-2xl bg-slate-900 border-slate-800 text-white" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Stock by Size</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl h-8 text-[10px] font-black uppercase"
                    onClick={() => append({ size: '', color: '', quantity: 0 })}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Size
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-3 animate-in fade-in slide-in-from-top-2">
                      <FormField
                        control={form.control}
                        name={`variants.${index}.size`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-11 rounded-xl bg-slate-900 border-slate-800 text-white">
                                  <SelectValue placeholder="Select Size" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {sizes.map((s) => (
                                  <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`variants.${index}.color`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder="Color" className="h-11 rounded-xl bg-slate-900 border-slate-800 text-white" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`variants.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="w-32">
                            <FormControl>
                              <Input type="number" placeholder="Qty" className="h-11 rounded-xl bg-slate-900 border-slate-800 text-white" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {fields.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-11 w-11 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={onClose} className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-slate-400">Cancel</Button>
              <Button type="submit" className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest bg-primary shadow-lg shadow-primary/20">Save Product</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;

