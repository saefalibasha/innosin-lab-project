
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Package } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ProductVariantCard } from './ProductVariantCard';

interface Product {
  id: string;
  product_code: string;
  name: string;
  product_series: string;
  finish_type: string;
  orientation: string;
  door_type: string;
  drawer_count: number;
  dimensions: string;
  editable_title: string;
  editable_description: string;
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
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFinish, setSelectedFinish] = useState<string>('all');
  const [selectedOrientation, setSelectedOrientation] = useState<string>('all');

  // Get unique finishes and orientations for this series
  const finishes = [...new Set(products.map(p => p.finish_type).filter(Boolean))];
  const orientations = [...new Set(products.map(p => p.orientation).filter(Boolean))];

  // Filter products based on selected filters
  const filteredProducts = products.filter(product => {
    const finishMatch = selectedFinish === 'all' || product.finish_type === selectedFinish;
    const orientationMatch = selectedOrientation === 'all' || product.orientation === selectedOrientation;
    return finishMatch && orientationMatch;
  });

  // Group products by configuration (door type, drawer count, dimensions)
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    let key = '';
    if (product.door_type && product.door_type !== 'None') {
      key = product.door_type;
      if (product.drawer_count > 0) {
        key += ` (${product.drawer_count} Drawers)`;
      }
    } else if (product.drawer_count > 0) {
      key = `${product.drawer_count} Drawers`;
    } else {
      key = product.dimensions || 'Standard';
    }

    if (!acc[key]) acc[key] = [];
    acc[key].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <Card className="mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">{seriesName}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {products.length} variants available
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {finishes.map(finish => (
                  <Badge key={finish} variant="outline" className="text-xs">
                    {finish}
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent>
            {/* Filter Controls */}
            <div className="flex gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Finish Type:</label>
                <div className="flex gap-2">
                  <Button
                    variant={selectedFinish === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFinish('all')}
                  >
                    All
                  </Button>
                  {finishes.map(finish => (
                    <Button
                      key={finish}
                      variant={selectedFinish === finish ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedFinish(finish)}
                    >
                      {finish}
                    </Button>
                  ))}
                </div>
              </div>

              {orientations.length > 1 && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Orientation:</label>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedOrientation === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedOrientation('all')}
                    >
                      All
                    </Button>
                    {orientations.map(orientation => (
                      <Button
                        key={orientation}
                        variant={selectedOrientation === orientation ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedOrientation(orientation)}
                      >
                        {orientation === 'None' ? 'Standard' : orientation}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Product Groups */}
            <div className="space-y-6">
              {Object.entries(groupedProducts).map(([groupName, groupProducts]) => (
                <div key={groupName} className="space-y-3">
                  <h4 className="font-semibold text-primary border-b pb-2">
                    {groupName}
                    <span className="ml-2 text-sm text-muted-foreground font-normal">
                      ({groupProducts.length} variants)
                    </span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupProducts.map(product => (
                      <ProductVariantCard
                        key={product.id}
                        product={product}
                        onClick={() => onProductSelect(product)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No products match the selected filters
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
