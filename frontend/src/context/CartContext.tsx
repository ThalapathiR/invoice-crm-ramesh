import React, { createContext, useContext, useState, useMemo } from 'react';

export interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
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

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

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
        price: product.selling_price, 
        gst_percentage: product.gst_percentage,
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
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal, taxAmount, totalAmount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
