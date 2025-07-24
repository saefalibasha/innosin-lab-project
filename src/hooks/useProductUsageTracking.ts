
import { useState, useCallback } from 'react';
import { PlacedProduct } from '@/types/floorPlanTypes';

interface ProductUsage {
  productId: string;
  productName: string;
  usageCount: number;
  lastUsed: Date;
  totalPlacements: number;
}

interface FloorPlanSession {
  id: string;
  name: string;
  createdAt: Date;
  placedProducts: PlacedProduct[];
  totalProductsUsed: number;
}

export const useProductUsageTracking = () => {
  const [productUsage, setProductUsage] = useState<Map<string, ProductUsage>>(new Map());
  const [currentSession, setCurrentSession] = useState<FloorPlanSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<FloorPlanSession[]>([]);

  const startNewSession = useCallback((sessionName: string = 'Untitled Floor Plan') => {
    const newSession: FloorPlanSession = {
      id: Date.now().toString(),
      name: sessionName,
      createdAt: new Date(),
      placedProducts: [],
      totalProductsUsed: 0
    };
    setCurrentSession(newSession);
  }, []);

  const trackProductUsage = useCallback((productId: string, productName: string) => {
    setProductUsage(prev => {
      const updated = new Map(prev);
      const existing = updated.get(productId);
      
      if (existing) {
        updated.set(productId, {
          ...existing,
          usageCount: existing.usageCount + 1,
          lastUsed: new Date(),
          totalPlacements: existing.totalPlacements + 1
        });
      } else {
        updated.set(productId, {
          productId,
          productName,
          usageCount: 1,
          lastUsed: new Date(),
          totalPlacements: 1
        });
      }
      
      return updated;
    });
  }, []);

  const trackProductPlacement = useCallback((placedProduct: PlacedProduct) => {
    if (!currentSession) return;

    setCurrentSession(prev => {
      if (!prev) return prev;
      
      const updatedProducts = [...prev.placedProducts, placedProduct];
      
      return {
        ...prev,
        placedProducts: updatedProducts,
        totalProductsUsed: updatedProducts.length
      };
    });

    // Track general usage
    trackProductUsage(placedProduct.productId, placedProduct.name);
  }, [currentSession, trackProductUsage]);

  const removeProductFromSession = useCallback((productId: string) => {
    if (!currentSession) return;

    setCurrentSession(prev => {
      if (!prev) return prev;
      
      const updatedProducts = prev.placedProducts.filter(p => p.id !== productId);
      
      return {
        ...prev,
        placedProducts: updatedProducts,
        totalProductsUsed: updatedProducts.length
      };
    });
  }, [currentSession]);

  const saveSession = useCallback(() => {
    if (!currentSession) return;

    setSessionHistory(prev => [...prev, currentSession]);
    setCurrentSession(null);
  }, [currentSession]);

  const getUsageStats = useCallback(() => {
    const usageArray = Array.from(productUsage.values());
    const totalUsage = usageArray.reduce((sum, usage) => sum + usage.usageCount, 0);
    const mostUsedProduct = usageArray.reduce((max, usage) => 
      usage.usageCount > max.usageCount ? usage : max, 
      { usageCount: 0 } as ProductUsage
    );

    return {
      totalProducts: usageArray.length,
      totalUsage,
      mostUsedProduct: mostUsedProduct.usageCount > 0 ? mostUsedProduct : null,
      recentlyUsed: usageArray
        .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
        .slice(0, 5)
    };
  }, [productUsage]);

  const getSessionProducts = useCallback(() => {
    if (!currentSession) return [];
    
    // Group products by type and count
    const productCounts = new Map<string, { product: PlacedProduct; count: number }>();
    
    currentSession.placedProducts.forEach(product => {
      const key = product.productId;
      if (productCounts.has(key)) {
        productCounts.get(key)!.count += 1;
      } else {
        productCounts.set(key, { product, count: 1 });
      }
    });
    
    return Array.from(productCounts.values());
  }, [currentSession]);

  return {
    productUsage: Array.from(productUsage.values()),
    currentSession,
    sessionHistory,
    startNewSession,
    trackProductUsage,
    trackProductPlacement,
    removeProductFromSession,
    saveSession,
    getUsageStats,
    getSessionProducts
  };
};
