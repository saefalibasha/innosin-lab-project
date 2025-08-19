
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VariantSelector from './VariantSelector';
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
  // Extract series slug from various possible sources
  const seriesSlug = series.product_series?.toLowerCase().replace(/\s+/g, '-') || '';
  const seriesName = series.product_series || series.name || '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Product Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <VariantSelector
          variants={variants}
          selectedVariantId={selectedVariantId}
          onVariantChange={onVariantChange}
          selectedFinish={selectedFinish}
          onFinishChange={onFinishChange}
          seriesSlug={seriesSlug}
          seriesName={seriesName}
        />
      </CardContent>
    </Card>
  );
};

export default SeriesProductConfigurator;
