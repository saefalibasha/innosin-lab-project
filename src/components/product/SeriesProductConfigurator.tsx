
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EnhancedVariantSelector from './EnhancedVariantSelector';
import { Product } from '@/types/product';
import { Settings } from 'lucide-react';

interface SeriesProductConfiguratorProps {
  series: Product;
  variants: Product[];
  selectedVariantId: string;
  onVariantChange: (variantId: string) => void;
  selectedFinish: string;
  onFinishChange: (finish: string) => void;
}

const SeriesProductConfigurator: React.FC<SeriesProductConfiguratorProps> = ({
  series,
  variants,
  selectedVariantId,
  onVariantChange,
  selectedFinish,
  onFinishChange
}) => {
  return (
    <EnhancedVariantSelector
      series={series}
      variants={variants}
      selectedVariantId={selectedVariantId}
      onVariantChange={onVariantChange}
      selectedFinish={selectedFinish}
      onFinishChange={onFinishChange}
    />
  );
};

export default SeriesProductConfigurator;
