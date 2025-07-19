
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductVariantCard } from './ProductVariantCard';
import { Package, Info } from 'lucide-react';

interface Product {
  id: string;
  product_code: string;
  name: string;
  category: string;
  product_series: string;
  finish_type: string;
  orientation: string;
  door_type: string;
  drawer_count: number;
  dimensions: string;
  editable_title: string;
  editable_description: string;
  is_active: boolean;
}

interface ProductSeriesSectionProps {
  seriesName: string;
  products: Product[];
  onProductSelect: (product: Product) => void;
}

export const ProductSeriesSection: React.FC<ProductSeriesSectionProps> = ({
  seriesName,
  products,
  onProductSelect
}) => {
  const displayName = seriesName.replace('Laboratory Bench Knee Space Series', 'KS Series');
  const isKneeSpaceSeries = seriesName.includes('Knee Space');
  
  // Group products by finish type for KS Series
  const productsByFinish = products.reduce((acc, product) => {
    const finish = product.finish_type || 'PC';
    if (!acc[finish]) acc[finish] = [];
    acc[finish].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const finishLabels = {
    'PC': 'Powder Coat',
    'SS': 'Stainless Steel'
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-xl">{displayName}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {products.length} {products.length === 1 ? 'variant' : 'variants'} available
                {isKneeSpaceSeries && ' • 7 sizes (KS700-KS1200) • 2 finishes (PC/SS)'}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700">
            {seriesName.replace('Laboratory Bench Knee Space Series', 'Knee Space')}
          </Badge>
        </div>
        
        {isKneeSpaceSeries && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg mt-4">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Laboratory Bench Knee Space Series</p>
              <p>Ergonomic solutions with 7 width configurations (700-1200mm) available in both Powder Coat (PC) and Stainless Steel (SS) finishes.</p>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {isKneeSpaceSeries && Object.keys(productsByFinish).length > 1 ? (
          // Show finish groups for KS Series
          <div className="space-y-6">
            {Object.entries(productsByFinish).map(([finish, finishProducts]) => (
              <div key={finish}>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={finish === 'SS' ? 'default' : 'secondary'} className="text-xs">
                    {finish} ({finishLabels[finish as keyof typeof finishLabels] || finish})
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {finishProducts.length} sizes available
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {finishProducts.map((product) => (
                    <ProductVariantCard
                      key={product.id}
                      product={product}
                      onSelect={() => onProductSelect(product)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Regular product grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {products.map((product) => (
              <ProductVariantCard
                key={product.id}
                product={product}
                onSelect={() => onProductSelect(product)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
