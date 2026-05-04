import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { InvoiceService } from '@/service/invoice.service';
import { CommonService } from '@/service/commonservice.page';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Settings2, 
  History, 
  Download, 
  Eye, 
  FileText, 
  Store, 
  Phone, 
  MapPin, 
  Hash,
  Palette,
  Layout
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const InvoicesPage: React.FC = () => {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [companySettings, setCompanySettings] = useState<any>({
    name: '',
    address: '',
    uen_no: '',
    invoice_footer: '',
    telephone_no: '',
    website: '',
    custom_fields: []
  });

  useEffect(() => {
    if (user && (user as any).company) {
      // Merge with defaults to ensure all fields exist in state
      setCompanySettings((prev: any) => ({
        ...prev,
        ...(user as any).company
      }));
    }
  }, [user]);

  const handleUpdateSettings = async () => {
    setLoading(true);
    try {
      // Ensure we include the ID from the current settings
      const payload = { ...companySettings };
      if (!payload.id && (user as any)?.company?.id) {
        payload.id = (user as any).company.id;
      }

      const response: any = await CommonService.CommonPatch(payload, `Company/Update`);
      if (response && (response.Type === "S" || response.status === true)) {
        // Update local user state with new company info
        if (user) {
          await login({
            ...user,
            company: payload
          });
        }
        toast.success("Invoice settings updated successfully!");
      }
    } catch (err) {
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 min-h-screen">
      {/* Header */}
      <div className="page-header-brand">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-foreground">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Invoice Template</h1>
            <p className="text-blue-100/80 font-medium">Customize your billing layout and store details</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 outline-none">
        {/* Form Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card p-8 rounded-[32px] border border-border shadow-sm space-y-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Layout className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Template Details</h3>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Store Branch Name</Label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="e.g. Ramesh Collection"
                  value={companySettings.name || ''}
                  onChange={(e) => setCompanySettings({...companySettings, name: e.target.value})}
                  className="pl-10 h-12 glass-input rounded-2xl font-bold text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Parent Company / Legal Name</Label>
              <Input 
                value={companySettings.website || ''} 
                placeholder="e.g. Ramesh Groups Pvt Ltd"
                onChange={(e) => setCompanySettings({...companySettings, website: e.target.value})}
                className="h-12 glass-input rounded-2xl font-bold text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">GSTIN NO</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="33XXXXXXXXXXXXX"
                  value={companySettings.uen_no || ''}
                  onChange={(e) => setCompanySettings({...companySettings, uen_no: e.target.value})}
                  className="pl-10 h-12 glass-input rounded-2xl font-bold text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Full Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Street, City, State, Pin"
                  value={companySettings.address || ''}
                  onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})}
                  className="pl-10 h-12 glass-input rounded-2xl font-bold text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Contact Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="+91 XXXXX XXXXX"
                  value={companySettings.telephone_no || ''}
                  onChange={(e) => setCompanySettings({...companySettings, telephone_no: e.target.value})}
                  className="pl-10 h-12 glass-input rounded-2xl font-bold text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Terms & Conditions (Invoice Footer)</Label>
              <textarea 
                value={companySettings.invoice_footer || ''}
                onChange={(e) => setCompanySettings({...companySettings, invoice_footer: e.target.value})}
                className="w-full min-h-[100px] p-4 glass-input rounded-2xl font-bold text-xs text-foreground resize-none"
                placeholder="Thank you for your business!"
              />
            </div>

            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Additional Fields</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10"
                  onClick={() => {
                    const cf = companySettings.custom_fields || [];
                    setCompanySettings({...companySettings, custom_fields: [...cf, { key: '', value: '' }]});
                  }}
                >
                  + Add Field
                </Button>
              </div>
              
              <div className="space-y-3">
                {(companySettings.custom_fields || []).map((field: any, idx: number) => (
                  <div key={idx} className="flex gap-2 items-center animate-in fade-in slide-in-from-top-1">
                    <Input 
                      placeholder="Label (e.g. Bank)" 
                      value={field.key}
                      onChange={(e) => {
                        const newCf = [...companySettings.custom_fields];
                        newCf[idx].key = e.target.value;
                        setCompanySettings({...companySettings, custom_fields: newCf});
                      }}
                      className="flex-1 h-10 glass-input rounded-xl text-xs font-bold text-foreground"
                    />
                    <Input 
                      placeholder="Value" 
                      value={field.value}
                      onChange={(e) => {
                        const newCf = [...companySettings.custom_fields];
                        newCf[idx].value = e.target.value;
                        setCompanySettings({...companySettings, custom_fields: newCf});
                      }}
                      className="flex-[2] h-10 glass-input rounded-xl text-xs font-bold text-foreground"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                      onClick={() => {
                        const newCf = companySettings.custom_fields.filter((_: any, i: number) => i !== idx);
                        setCompanySettings({...companySettings, custom_fields: newCf});
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button 
            className="w-full h-14 rounded-2xl bg-primary text-foreground font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" 
            onClick={handleUpdateSettings}
            disabled={loading}
          >
            {loading ? "Saving Changes..." : "Save Template Settings"}
          </Button>
        </motion.div>

        {/* Live Preview Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 mb-2 px-4">
            <Eye className="w-5 h-5 text-emerald-500" />
            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Live Preview</h3>
          </div>
          
          <div className="bg-white border-8 border-slate-900 rounded-[32px] p-8 aspect-[1/1.4] shadow-2xl overflow-y-auto pointer-events-none select-none custom-scrollbar relative">
            <div className="text-center space-y-1.5 mb-6">
              {companySettings.name && (
                <div className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-1">
                  {companySettings.name}
                </div>
              )}
              
              {companySettings.website && (
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  {companySettings.website}
                </div>
              )}
              
              {companySettings.telephone_no && (
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                  Store Contact : {companySettings.telephone_no}
                </div>
              )}
              
              {companySettings.address && (
                <div className="text-[9px] font-bold text-slate-400 uppercase leading-tight px-6">
                  Address : {companySettings.address}
                </div>
              )}
              
              {companySettings.uen_no && (
                <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest mt-2 bg-slate-50 py-1 inline-block px-4 rounded-full">
                  GSTIN: {companySettings.uen_no}
                </div>
              )}

              {companySettings.custom_fields?.map((cf: any, idx: number) => cf.key && (
                <div key={idx} className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">
                  {cf.key} : {cf.value}
                </div>
              ))}

              <div className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] pt-6 flex items-center justify-center gap-4">
                <div className="h-px bg-slate-200 flex-1" />
                TAX INVOICE
                <div className="h-px bg-slate-200 flex-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8 text-[9px] font-bold text-slate-600 px-2">
              <div className="space-y-1.5">
                <div className="flex justify-between border-b border-slate-50 pb-0.5">
                  <span className="text-slate-400 uppercase">Invoice No:</span>
                  <span className="text-slate-900">Z332100352573</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-0.5">
                  <span className="text-slate-400 uppercase">Counter:</span>
                  <span className="text-slate-900">01</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-0.5">
                  <span className="text-slate-400 uppercase">Customer ID:</span>
                  <span className="text-slate-900">WALK-IN</span>
                </div>
              </div>
              <div className="space-y-1.5 text-right">
                <div className="text-slate-900 border-b border-slate-50 pb-0.5">{new Date().toLocaleString()}</div>
                <div className="flex justify-between border-b border-slate-50 pb-0.5">
                  <span className="text-slate-400 uppercase">Cashier:</span>
                  <span className="text-slate-900">ADMIN</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-0.5">
                  <span className="text-slate-400 uppercase">Mobile:</span>
                  <span className="text-slate-900">XXXXXXXXXX</span>
                </div>
              </div>
            </div>

            {/* Dummy Table */}
            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-[8px] font-black text-slate-900 uppercase tracking-widest border-b-2 border-slate-900 pb-1">
                <span className="w-1/2">Item Description</span>
                <span className="w-1/6 text-right">Price</span>
                <span className="w-1/6 text-right">Qty</span>
                <span className="w-1/6 text-right">Total</span>
              </div>
              <div className="flex justify-between text-[9px] font-bold text-slate-600 items-start">
                <div className="w-1/2">
                  <div className="uppercase text-slate-900">Mens Tshirts Table Polo</div>
                  <div className="text-[7px] text-slate-400">HSN: 61099090 | SIZE: L</div>
                </div>
                <span className="w-1/6 text-right">₹399.00</span>
                <span className="w-1/6 text-right">1 PC</span>
                <span className="w-1/6 text-right font-black text-slate-900">₹399.00</span>
              </div>
            </div>

            <div className="space-y-2 ml-auto w-1/2 pt-4">
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span className="uppercase">Gross Total:</span>
                <span className="text-slate-600">₹399.00</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-emerald-600">
                <span className="uppercase">Discount:</span>
                <span>-₹0.00</span>
              </div>
              <div className="flex justify-between text-xs font-black text-slate-900 pt-3 border-t-2 border-slate-900 mt-2">
                <span className="uppercase tracking-wider text-sm">Amount:</span>
                <span className="text-xl">₹399.00</span>
              </div>
            </div>

            {companySettings.invoice_footer && (
              <div className="mt-16 text-[8px] text-slate-400 font-bold whitespace-pre-wrap text-center border-t border-slate-100 pt-6 italic">
                {companySettings.invoice_footer}
              </div>
            )}
            
            <div className="mt-4 text-center">
              <div className="text-[7px] font-black text-slate-300 uppercase tracking-widest">
                Generated via {import.meta.env.VITE_APP_NAME || "Billing POS"}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InvoicesPage;
