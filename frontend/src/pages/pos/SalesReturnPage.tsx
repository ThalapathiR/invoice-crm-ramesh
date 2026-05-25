import React, { useState } from 'react';
import { CommonService } from '@/service/commonservice.page';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, RotateCcw, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';

const SalesReturnPage = () => {
  const { user } = useAuth();
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Track quantities to return: { [productId]: quantity }
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [reason, setReason] = useState('');
  const [recentReturns, setRecentReturns] = useState<any[]>([]);

  const fetchRecentReturns = async () => {
    try {
      const res = await CommonService.GetAll('Invoice/RecentReturns', false);
      if (res && Array.isArray(res)) {
        setRecentReturns(res);
      }
    } catch (e) {
      console.error('Failed to fetch recent returns', e);
    }
  };

  React.useEffect(() => {
    fetchRecentReturns();
  }, []);

  const searchInvoice = async () => {
    if (!invoiceNumber) {
      toast.error('Please enter an Invoice Number');
      return;
    }
    
    setLoading(true);
    try {
      const res = await CommonService.GetAll(`Invoice/ByInvoiceNumber/${invoiceNumber}`);
      if (res && res.id) {
        setInvoice(res);
        setReturnQuantities({});
      } else {
        toast.error('Invoice not found');
        setInvoice(null);
      }
    } catch (e) {
      toast.error('Failed to fetch invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId: string, qty: number, maxQty: number) => {
    if (qty < 0) return;
    if (qty > maxQty) {
      toast.error(`Cannot return more than purchased (${maxQty})`);
      return;
    }
    setReturnQuantities(prev => ({
      ...prev,
      [productId]: qty
    }));
  };

  const processReturn = async () => {
    const itemsToReturn = Object.keys(returnQuantities)
      .filter(productId => returnQuantities[productId] > 0)
      .map(productId => ({
        product_id: productId,
        quantity: returnQuantities[productId]
      }));

    if (itemsToReturn.length === 0) {
      toast.error('Please select at least one item to return');
      return;
    }

    setProcessing(true);
    try {
      const payload = {
        invoice_id: invoice.id,
        reason,
        items: itemsToReturn
      };

      const res = await CommonService.CommonPost(payload, 'Invoice/Return');
      if (res && (res as any).Type === 'S') {
        toast.success(`Return processed successfully! Refund Amount: ₹${(res as any).AddtionalData?.refundAmount || 0}`);
        setInvoice(null);
        setInvoiceNumber('');
        setReturnQuantities({});
        setReason('');
        fetchRecentReturns();
      } else {
        toast.error('Failed to process return');
      }
    } catch (e) {
      toast.error('An error occurred during return processing');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-red-100 text-red-600 rounded-xl">
          <RotateCcw className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Sales Returns & Exchanges</h1>
          <p className="text-muted-foreground text-sm">Lookup invoice and process returned items</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label>Invoice Number</Label>
              <Input 
                placeholder="e.g. INV-1701234567890" 
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchInvoice()}
              />
            </div>
            <Button onClick={searchInvoice} disabled={loading} className="w-32">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {invoice && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex justify-between items-center">
              <span>Invoice Details: {invoice.invoice_number}</span>
              <span className="text-sm font-normal text-muted-foreground">
                Date: {new Date(invoice.created_on).toLocaleString()}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Customer</p>
                <p className="font-bold">{invoice.customer?.name || 'Walk-in'}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Total Amount</p>
                <p className="font-bold">₹{invoice.total_amount}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Payment Method</p>
                <p className="font-bold">{invoice.payment_method}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Status</p>
                <p className="font-bold text-green-600">PAID</p>
              </div>
            </div>

            <div className="border rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center">Purchased Qty</TableHead>
                    <TableHead className="text-center bg-red-50">Return Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items?.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.product?.name || 'Unknown Item'}
                      </TableCell>
                      <TableCell className="text-right">₹{item.unit_price}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="bg-red-50/50 p-2 text-center">
                        <Input 
                          type="number" 
                          min="0" 
                          max={item.quantity}
                          className="w-20 text-center mx-auto"
                          value={returnQuantities[item.product_id] || ''}
                          onChange={(e) => handleQuantityChange(item.product_id, parseInt(e.target.value) || 0, item.quantity)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Reason for Return (Optional)</Label>
                <Input 
                  placeholder="e.g. Size didn't fit, Defective, etc."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setInvoice(null)}>Cancel</Button>
                <Button 
                  onClick={processReturn} 
                  disabled={processing || !Object.values(returnQuantities).some(q => q > 0)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {processing ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                  Confirm Return
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!invoice && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg flex justify-between items-center">
              Recent Returns History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentReturns.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                No recent returns found.
              </div>
            ) : (
              <div className="border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">Returned Qty</TableHead>
                      <TableHead>Ref Invoice ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentReturns.map((movement: any) => (
                      <TableRow key={movement.id}>
                        <TableCell>
                          {new Date(movement.created_on).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          {movement.product?.name || 'Unknown Product'}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
                            + {movement.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {movement.reference_id}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SalesReturnPage;
