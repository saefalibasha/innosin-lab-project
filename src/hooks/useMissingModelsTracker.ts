
import { useState, useCallback } from 'react';

interface MissingModel {
  productId: string;
  productName: string;
  timestamp: number;
}

export const useMissingModelsTracker = () => {
  const [missingModels, setMissingModels] = useState<MissingModel[]>([]);

  const trackMissingModel = useCallback((productId: string, productName: string) => {
    setMissingModels(prev => {
      // Avoid duplicates
      if (prev.some(model => model.productId === productId)) {
        return prev;
      }
      
      const newModel: MissingModel = {
        productId,
        productName,
        timestamp: Date.now()
      };
      
      console.warn(`Missing 3D model tracked for: ${productName} (${productId})`);
      
      return [...prev, newModel];
    });
  }, []);

  const clearMissingModel = useCallback((productId: string) => {
    setMissingModels(prev => prev.filter(model => model.productId !== productId));
  }, []);

  const clearAllMissingModels = useCallback(() => {
    setMissingModels([]);
  }, []);

  return {
    missingModels,
    trackMissingModel,
    clearMissingModel,
    clearAllMissingModels
  };
};
