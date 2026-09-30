import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, WishlistItem } from '../types.ts';
import { apiRequest } from '../services/api.ts';
import { useToast } from './ToastContext.tsx';

interface WishlistContextType {
  items: WishlistItem[];
  count: number;
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (product: Product) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const { showToast } = useToast();

  const refreshWishlist = async () => {
    try {
      const res = await apiRequest<WishlistItem[]>('/wishlist');
      if (res.success && res.data) {
        setItems(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, []);

  const isInWishlist = (productId: number) => {
    return items.some((item) => item.product_id === productId);
  };

  const toggleWishlist = async (product: Product) => {
    const isSaved = isInWishlist(product.id);
    // Optimistic UI update
    if (isSaved) {
      setItems((prev) => prev.filter((i) => i.product_id !== product.id));
      showToast('Removed from your wishlist', 'info');
    } else {
      setItems((prev) => [
        ...prev,
        {
          id: Math.floor(Math.random() * 100000),
          user_id: 3,
          product_id: product.id,
          product,
          created_at: new Date().toISOString(),
        },
      ]);
      showToast('Added to your wishlist', 'success');
    }

    try {
      await apiRequest('/wishlist/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id }),
      });
    } catch {
      // rollback on error
      refreshWishlist();
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        count: items.length,
        isInWishlist,
        toggleWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
