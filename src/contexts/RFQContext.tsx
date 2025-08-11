
import React from 'react';

export interface RFQItem {
  id: string;
  name: string;
  category: string;
  dimensions: string;
  image: string;
  quantity: number;
  notes: string;
}

interface RFQContextType {
  items: RFQItem[];
  addItem: (item: Omit<RFQItem, 'quantity' | 'notes'>) => void;
  updateItem: (id: string, updates: Partial<RFQItem>) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  itemCount: number;
}

const RFQContext = React.createContext<RFQContextType | undefined>(undefined);

export const RFQProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = React.useState<RFQItem[]>([]);

  const addItem = (item: Omit<RFQItem, 'quantity' | 'notes'>) => {
    setItems(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) {
        return prev.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1, notes: '' }];
    });
  };

  const updateItem = (id: string, updates: Partial<RFQItem>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <RFQContext.Provider value={{
      items,
      addItem,
      updateItem,
      removeItem,
      clearCart,
      itemCount
    }}>
      {children}
    </RFQContext.Provider>
  );
};

export const useRFQ = () => {
  const context = React.useContext(RFQContext);
  if (context === undefined) {
    throw new Error('useRFQ must be used within a RFQProvider');
  }
  return context;
};
