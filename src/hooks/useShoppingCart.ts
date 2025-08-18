
import { useState } from 'react';

interface CartItem {
  id: string;
  name: string;
  price?: number;
  quantity?: number;
  assets?: any;
  selectedConfig?: any;
}

export const useShoppingCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addItemToCart = (item: CartItem) => {
    setCartItems(prev => [...prev, { ...item, quantity: 1 }]);
  };

  const removeItemFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return {
    cartItems,
    addItemToCart,
    removeItemFromCart,
    clearCart,
    itemCount: cartItems.length
  };
};
