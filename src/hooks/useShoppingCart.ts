
import { useState, useCallback } from 'react';

interface CartItem {
  id: string;
  quantity: number;
}

interface UseShoppingCartReturn {
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  items: CartItem[];
  totalItems: number;
}

export const useShoppingCart = (): UseShoppingCartReturn => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) {
        return prev.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    addItem,
    removeItem,
    items,
    totalItems
  };
};
