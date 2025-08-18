
import { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { ProductTypeDetector, ProductTypeConfig } from '@/utils/productTypeDetector';

export const useProductConfigurator = (product: Product | null, variants: Product[] = []) => {
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedFinish, setSelectedFinish] = useState<string>('PC');
  const [productConfig, setProductConfig] = useState<ProductTypeConfig | null>(null);

  // Initialize selected variant and configuration
  useEffect(() => {
    if (!product) return;

    // Set initial variant
    const initialVariant = variants.length > 0 
      ? variants.find(v => v.is_active) || variants[0]
      : product;
    
    if (initialVariant) {
      setSelectedVariantId(initialVariant.id);
      
      // Set initial finish from the variant
      if (initialVariant.finish_type) {
        setSelectedFinish(initialVariant.finish_type);
      }
    }

    // Detect product type and configuration
    const config = ProductTypeDetector.detectProductType(product, variants);
    setProductConfig(config);

  }, [product, variants]);

  const handleVariantChange = (variantId: string) => {
    setSelectedVariantId(variantId);
    
    // Update finish based on selected variant
    const variant = variants.find(v => v.id === variantId);
    if (variant?.finish_type) {
      setSelectedFinish(variant.finish_type);
    }
  };

  const handleFinishChange = (finish: string) => {
    setSelectedFinish(finish);
  };

  const selectedVariant = variants.find(v => v.id === selectedVariantId) || product;

  const shouldShowConfigurator = productConfig?.hasConfigurator && 
    (variants.length > 1 || productConfig.primaryAttributes.some(attr => 
      variants.some(v => v[attr] !== undefined && v[attr] !== null && v[attr] !== '')
    ));

  return {
    selectedVariantId,
    selectedVariant,
    selectedFinish,
    productConfig,
    shouldShowConfigurator,
    handleVariantChange,
    handleFinishChange
  };
};
