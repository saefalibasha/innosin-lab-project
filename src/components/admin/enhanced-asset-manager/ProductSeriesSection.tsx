
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Package, Edit } from 'lucide-react';
import { ProductVariantCard } from './ProductVariantCard';

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
  company_tags: string[];
  is_active: boolean;
}

interface ProductSeriesSectionProps {
  seriesName: string;
  products: Product[];
  onProductSelect: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onProductUpdated: () => void;
}

export const ProductSeriesSection: React.FC<ProductSeriesSectionProps> = ({
  seriesName,
  products,
  onProductSelect,
  onEditProduct,
  onProductUpdated,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const displayName = seriesName.replace('Laboratory Bench Knee Space Series', 'Laboratory Bench KS Series');

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">{displayName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {products.length} product{products.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {products.length} variants
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-2"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductVariantCard
                key={product.id}
                product={product}
                onSelect={() => onProductSelect(product)}
                onEdit={() => onEditProduct(product)}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
