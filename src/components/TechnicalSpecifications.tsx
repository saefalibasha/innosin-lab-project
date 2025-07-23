
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, Info } from 'lucide-react';

interface TechnicalSpecificationsProps {
  product: any;
  selectedVariant?: any;
}

const TechnicalSpecifications: React.FC<TechnicalSpecificationsProps> = ({
  product,
  selectedVariant
}) => {
  const displayProduct = selectedVariant || product;
  
  // Parse specifications
  const specifications = React.useMemo(() => {
    if (!displayProduct.specifications) return [];
    
    if (Array.isArray(displayProduct.specifications)) {
      return displayProduct.specifications;
    }
    
    if (typeof displayProduct.specifications === 'string') {
      try {
        const parsed = JSON.parse(displayProduct.specifications);
        return Array.isArray(parsed) ? parsed : [displayProduct.specifications];
      } catch {
        return [displayProduct.specifications];
      }
    }
    
    return [];
  }, [displayProduct.specifications]);

  const getFinishDisplayName = (finish: string) => {
    switch (finish) {
      case 'PC':
        return 'Powder Coat';
      case 'SS':
      case 'SS304':
        return 'Stainless Steel';
      default:
        return finish;
    }
  };

  const getOrientationDisplayName = (orientation: string) => {
    switch (orientation) {
      case 'LH':
        return 'Left Hand';
      case 'RH':
        return 'Right Hand';
      case 'None':
        return 'Standard';
      default:
        return orientation;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Technical Specifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Product Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Product Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product Code:</span>
                <Badge variant="outline">{displayProduct.product_code || displayProduct.id}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category:</span>
                <span className="text-foreground">{displayProduct.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dimensions:</span>
                <span className="text-foreground">{displayProduct.dimensions}</span>
              </div>
              {displayProduct.finish_type && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Finish:</span>
                  <span className="text-foreground">{getFinishDisplayName(displayProduct.finish_type)}</span>
                </div>
              )}
              {displayProduct.orientation && displayProduct.orientation !== 'None' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Orientation:</span>
                  <span className="text-foreground">{getOrientationDisplayName(displayProduct.orientation)}</span>
                </div>
              )}
              {displayProduct.drawer_count && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Drawer Count:</span>
                  <span className="text-foreground">{displayProduct.drawer_count}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Series Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Series:</span>
                <span className="text-foreground">{displayProduct.product_series || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Brand:</span>
                <span className="text-foreground">Innosin</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="text-foreground">{displayProduct.variant_type || 'Standard'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications List */}
        {specifications.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Product Specifications
              </h4>
              <ul className="space-y-2">
                {specifications.map((spec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-muted-foreground">{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Additional Information */}
        <Separator />
        <div className="text-xs text-muted-foreground">
          <p>
            All specifications are subject to change without notice. 
            Please consult with our technical team for the most current specifications.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TechnicalSpecifications;
