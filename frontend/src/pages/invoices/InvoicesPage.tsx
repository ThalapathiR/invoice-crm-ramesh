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
  const { user } = useAuth();
  const [companySettings, setCompanySettings] = useState<any>({
    name: '',
    address: '',
    uen_no: '',
    invoice_footer: '',
    telephone_no: '',
    custom_fields: []
  });

  useEffect(() => {
    if (user) {
      setCompanySettings((user as any).company || {});
    }
  }, [user]);

  const handleUpdateSettings = async () => {
    try {
      await CommonService.CommonPatch(companySettings, `Company/Update`);
      toast.success("Invoice settings updated successfully!");
    } catch (err) {
      toast.error("Failed to update settings");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 min-h-screen">
      {/* Header */}
      <div className="page-header-brand">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Invoice Template</h1>
            <p className="text-blue-100/80 font-medium">Customize your billing layout and store details</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 outline-none">
        {/* Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card p-8 rounded-[32px] border border-border shadow-sm space-y-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Layout className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Template Details</h3>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Store Branch Name (e.g. Zudio - Fun Republic)</Label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  value={companySettings.name}
                  onChange={(e) => setCompanySettings({...companySettings, name: e.target.value})}
                  className="pl-10 h-12 bg-slate-900 border-none rounded-2xl focus:bg-slate-950 transition-all font-bold text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Parent Company (e.g. Trent Limited)</Label>
              <Input 
                value={companySettings.website || ''} 
                placeholder="Legal Entity Name"
                onChange={(e) => setCompanySettings({...companySettings, website: e.target.value})}
                className="h-12 bg-slate-900 border-none rounded-2xl focus:bg-slate-950 transition-all font-bold text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">GSTIN NO</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  value={companySettings.uen_no}
                  onChange={(e) => setCompanySettings({...companySettings, uen_no: e.target.value})}
                  className="pl-10 h-12 bg-slate-900 border-none rounded-2xl focus:bg-slate-950 transition-all font-bold text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Place Of Supply / Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  value={companySettings.address}
                  onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})}
                  className="pl-10 h-12 bg-slate-900 border-none rounded-2xl focus:bg-slate-950 transition-all font-bold text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Store Contact Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  value={companySettings.telephone_no}
                  onChange={(e) => setCompanySettings({...companySettings, telephone_no: e.target.value})}
                  className="pl-10 h-12 bg-slate-900 border-none rounded-2xl focus:bg-slate-950 transition-all font-bold text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Terms & Conditions (Invoice Footer)</Label>
              <textarea 
                value={companySettings.invoice_footer}
                onChange={(e) => setCompanySettings({...companySettings, invoice_footer: e.target.value})}
                className="w-full min-h-[100px] p-4 bg-slate-900 border-none rounded-2xl focus:bg-slate-950 transition-all font-bold text-xs text-white"
                placeholder="*All Offers are subject to applicable T&C..."
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Additional Fields</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-[10px] font-black uppercase tracking-widest text-primary"
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
                      className="flex-1 h-10 bg-slate-900 border-none rounded-xl text-xs font-bold text-white"
                    />
                    <Input 
                      placeholder="Value" 
                      value={field.value}
                      onChange={(e) => {
                        const newCf = [...companySettings.custom_fields];
                        newCf[idx].value = e.target.value;
                        setCompanySettings({...companySettings, custom_fields: newCf});
                      }}
                      className="flex-[2] h-10 bg-slate-900 border-none rounded-xl text-xs font-bold text-white"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 text-slate-300 hover:text-red-500"
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

          <Button className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-lg shadow-primary/20" onClick={handleUpdateSettings}>
            Save Template Settings
          </Button>
        </motion.div>

        {/* Preview */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 mb-2 px-4">
            <Eye className="w-5 h-5 text-emerald-500" />
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Live Preview</h3>
          </div>
          
          <div className="bg-white border-8 border-slate-900 rounded-[32px] p-8 aspect-[1/1.4] shadow-2xl overflow-y-auto pointer-events-none select-none custom-scrollbar">
            <div className="text-center space-y-1.5 mb-6">
              <div className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-1">{companySettings.name || 'ZUDIO'}</div>
              <div className="text-[9px] font-bold text-slate-500 uppercase">{companySettings.website || 'Legal Entity Name'}</div>
              
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                Store Contact Number : {companySettings.telephone_no || 'NA'}
              </div>
              
              <div className="text-[9px] font-bold text-slate-400 uppercase leading-tight px-4">
                Place Of Supply : {companySettings.address || 'Store Address...'}
              </div>
              
              <div className="text-[9px] font-bold text-slate-900 uppercase tracking-widest mt-1">
                GSTIN NO : {companySettings.uen_no || '33AAACL1838J1ZN'}
              </div>

              {companySettings.custom_fields?.map((cf: any, idx: number) => (
                <div key={idx} className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">
                  {cf.key} : {cf.value}
                </div>
              ))}

              <div className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] pt-4">TAX INVOICE</div>
              <div className="w-full h-px bg-slate-100 mx-auto mt-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-[9px] font-bold text-slate-600">
              <div className="space-y-1">
                <div className="flex gap-1">
                  <span className="text-slate-400 uppercase">Invoice No:</span>
                  <span>Z332 100352573</span>
                </div>
                <div className="flex gap-1">
                  <span className="text-slate-400 uppercase">Counter:</span>
                  <span>1</span>
                </div>
                <div className="flex gap-1">
                  <span className="text-slate-400 uppercase">Customer ID:</span>
                  <span>WALK-IN</span>
                </div>
              </div>
              <div className="space-y-1 text-right">
                <div>{new Date().toLocaleString()}</div>
                <div className="flex gap-1 justify-end">
                  <span className="text-slate-400 uppercase">Cashier:</span>
                  <span>99037</span>
                </div>
                <div className="flex gap-1 justify-end">
                  <span className="text-slate-400 uppercase">Mobile No:</span>
                  <span>8428153549</span>
                </div>
              </div>
            </div>

            {/* Dummy Table */}
            <div className="space-y-2 mb-6 border-t border-b border-slate-50 py-3">
              <div className="flex justify-between text-[8px] font-black text-slate-900 uppercase tracking-widest mb-1">
                <span className="w-1/2">Item Description</span>
                <span>Price</span>
                <span>Qty</span>
                <span>Total</span>
              </div>
              <div className="flex justify-between text-[9px] font-bold text-slate-600">
                <div className="w-1/2">
                  <div className="uppercase">Mens Tshirts Table Polo</div>
                  <div className="text-[7px] text-slate-400">HSN: 61099090</div>
                </div>
                <span>₹399.00</span>
                <span>1 PC</span>
                <span>₹399.00</span>
              </div>
            </div>

            <div className="space-y-1.5 ml-auto w-1/2">
              <div className="flex justify-between text-[10px] font-bold text-slate-500">
                <span className="uppercase">Gross Total:</span>
                <span>₹399.00</span>
              </div>
              <div className="flex justify-between text-xs font-black text-slate-900 pt-2 border-t border-slate-900">
                <span className="uppercase">Total Amount:</span>
                <span className="text-lg">₹399.00</span>
              </div>
            </div>

            <div className="mt-12 text-[7px] text-slate-400 font-bold whitespace-pre-wrap text-center border-t border-slate-50 pt-4">
              {companySettings.invoice_footer || "*All Offers are subject to applicable T&C..."}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InvoicesPage;
