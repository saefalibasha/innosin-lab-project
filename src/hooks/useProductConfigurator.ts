
import { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { ProductTypeDetector, ProductTypeConfig } from '@/utils/productTypeDetector';

export const useProductConfigurator = (productNumber: string) => {
  const [selectedConfig, setSelectedConfig] = useState<any>({});
  const [currentAssets, setCurrentAssets] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [product, setProduct] = useState<Product | null>(null);

  const updateConfig = (config: any) => {
    setSelectedConfig(prev => ({ ...prev, ...config }));
  };

  const resetConfig = (newProduct: Product) => {
    setProduct(newProduct);
    setSelectedConfig({});
    setCurrentAssets({
      thumbnail: newProduct.thumbnail,
      model: newProduct.modelPath,
      images: newProduct.images || []
    });
  };

  const getConfiguratorOptions = () => {
    if (!product) return {};
    
    return {
      dimensions: product.dimensions,
      finishes: product.finishes || [],
      variants: product.variants || []
    };
  };

  return {
    selectedConfig,
    updateConfig,
    resetConfig,
    getConfiguratorOptions,
    currentAssets,
    isLoading,
    error
  };
};
