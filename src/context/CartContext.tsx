import React, { createContext, useContext, useEffect, useState } from 'react';
import { Cart, CartItem } from '../types.ts';
import { apiRequest } from '../services/api.ts';
import { useToast } from './ToastContext.tsx';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  isDrawerOpen: boolean;
  itemCount: number;
  openDrawer: () => void;
  closeDrawer: () => void;
  addToCart: (productId: number, variantId?: number | null, quantity?: number) => Promise<boolean>;
  updateQuantity: (itemId: number, quantity: number) => Promise<boolean>;
  removeItem: (itemId: number) => Promise<boolean>;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => Promise<boolean>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { showToast } = useToast();

  const refreshCart = async () => {
    try {
      const res = await apiRequest<Cart>('/cart');
      if (res.success && res.data) {
        setCart(res.data);
      }
    } catch (e) {
      console.error('Failed to load cart', e);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const addToCart = async (productId: number, variantId?: number | null, quantity: number = 1): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await apiRequest<Cart>('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId, variantId, quantity }),
      });

      if (res.success && res.data) {
        setCart(res.data);
        showToast('Item added to your shopping bag', 'success');
        openDrawer();
        return true;
      } else {
        showToast(res.message || 'Could not add to cart', 'error');
        return false;
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number): Promise<boolean> => {
    try {
      const res = await apiRequest<Cart>(`/cart/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });

      if (res.success && res.data) {
        setCart(res.data);
        return true;
      } else {
        showToast(res.message || 'Could not update quantity', 'error');
        return false;
      }
    } catch {
      return false;
    }
  };

  const removeItem = async (itemId: number): Promise<boolean> => {
    try {
      const res = await apiRequest<Cart>(`/cart/items/${itemId}`, {
        method: 'DELETE',
      });

      if (res.success && res.data) {
        setCart(res.data);
        showToast('Item removed from shopping bag', 'info');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    try {
      const res = await apiRequest<Cart>('/cart/coupon', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });

      if (res.success && res.data) {
        setCart(res.data);
        showToast(res.message || 'Coupon applied!', 'success');
        return true;
      } else {
        showToast(res.message || 'Invalid coupon code', 'error');
        return false;
      }
    } catch {
      return false;
    }
  };

  const removeCoupon = async (): Promise<boolean> => {
    try {
      const res = await apiRequest<Cart>('/cart/coupon', {
        method: 'DELETE',
      });

      if (res.success && res.data) {
        setCart(res.data);
        showToast('Promotional code removed', 'info');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const clearCart = async () => {
    const res = await apiRequest<Cart>('/cart/clear', { method: 'DELETE' });
    if (res.success && res.data) {
      setCart(res.data);
    }
  };

  const itemCount = cart?.items ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        isDrawerOpen,
        itemCount,
        openDrawer,
        closeDrawer,
        addToCart,
        updateQuantity,
        removeItem,
        applyCoupon,
        removeCoupon,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
