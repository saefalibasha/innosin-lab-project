
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OptimizedOverviewImage } from '@/components/common/OptimizedOverviewImage';
import { ProductSeries } from '@/hooks/useProductSeries';

interface ProductGridProps {
  productSeries: ProductSeries[];
  onSeriesSelect: (series: ProductSeries) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  productSeries,
  onSeriesSelect
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {productSeries.map((series) => (
        <Card 
          key={series.id}
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200 overflow-hidden"
          onClick={() => onSeriesSelect(series)}
        >
          <div className="aspect-square relative">
            <OptimizedOverviewImage
              src={series.thumbnail || '/placeholder.svg'}
              alt={series.name}
              className="w-full h-full"
              showCompanyTag={true}
              companyTag={series.products[0]?.company_tags?.[0]}
            />
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-base mb-2 line-clamp-2 min-h-[3rem]">
              {series.name}
            </h3>
            <div className="space-y-2">
              <Badge variant="secondary" className="text-xs">
                {series.category}
              </Badge>
              {series.description && (
                <p className="text-sm text-muted-foreground line-clamp-3 min-h-[4.5rem]">
                  {series.description}
                </p>
              )}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">
                  {series.products.length} variant{series.products.length !== 1 ? 's' : ''}
                </span>
                {series.products[0]?.company_tags?.[0] && (
                  <Badge variant="outline" className="text-xs">
                    {series.products[0].company_tags[0]}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
