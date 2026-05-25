import React, { createContext, useContext, useState, useMemo } from 'react';

export interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  mrp: number;
  purchase_price: number;
  gst_percentage: number;
  discount_type?: 'PERCENTAGE' | 'FIXED';
  discount_value?: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: any, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateDiscount: (productId: string, type: 'PERCENTAGE' | 'FIXED', value: number) => void;
  clearCart: () => void;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode, storageKey?: string }> = ({ children, storageKey = 'pos_cart' }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const addItem = (product: any, quantity: number) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { 
        id: product.id, 
        name: product.name, 
        quantity, 
        price: Number(product.selling_price || product.price || 0), 
        mrp: Number(product.mrp || product.selling_price || product.price || 0),
        purchase_price: Number(product.purchase_price || 0),
        gst_percentage: Number(product.gst_percentage || 0),
        discount_type: 'PERCENTAGE',
        discount_value: 0
      }];
    });
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  };

  const updateDiscount = (productId: string, type: 'PERCENTAGE' | 'FIXED', value: number) => {
    setItems(prev => prev.map(item => 
      item.id === productId ? { ...item, discount_type: type, discount_value: value } : item
    ));
  };

  const clearCart = () => setItems([]);

  const { subtotal, taxAmount, totalAmount } = useMemo(() => {
    const sub = items.reduce((acc, item) => {
      let itemDiscount = 0;
      if (item.discount_value) {
        if (item.discount_type === 'PERCENTAGE') {
          itemDiscount = (item.price * item.quantity * item.discount_value) / 100;
        } else {
          itemDiscount = item.discount_value;
        }
      }
      return acc + (item.price * item.quantity) - itemDiscount;
    }, 0);

    const tax = items.reduce((acc, item) => {
      let itemDiscount = 0;
      if (item.discount_value) {
        if (item.discount_type === 'PERCENTAGE') {
          itemDiscount = (item.price * item.quantity * item.discount_value) / 100;
        } else {
          itemDiscount = item.discount_value;
        }
      }
      const discountedSubtotal = (item.price * item.quantity) - itemDiscount;
      return acc + (discountedSubtotal * item.gst_percentage / 100);
    }, 0);

    return {
      subtotal: sub,
      taxAmount: tax,
      totalAmount: sub + tax
    };
  }, [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, updateDiscount, clearCart, subtotal, taxAmount, totalAmount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
