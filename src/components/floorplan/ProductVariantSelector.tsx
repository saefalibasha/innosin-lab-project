import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Package } from 'lucide-react';

interface ProductVariant {
  id: string;
  name: string;
  dimensions: string;
  description: string;
  drawerCount?: number;
  configuration?: string;
}

interface ProductVariantSelectorProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  onVariantSelect: (variant: ProductVariant) => void;
}

const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  product,
  isOpen,
  onClose,
  onVariantSelect
}) => {
  const [selectedVariant, setSelectedVariant] = useState<string>('');

  if (!isOpen) return null;

  // Generate variants based on product type
  const getProductVariants = (product: any): ProductVariant[] => {
    const variants: ProductVariant[] = [];
    
    // Check if it's a mobile cabinet or modular cabinet
    const isMobileCabinet = product.name?.toLowerCase().includes('mobile cabinet') || 
                           product.productId?.toLowerCase().includes('mc-');
    const isModularCabinet = product.name?.toLowerCase().includes('modular cabinet') ||
                            product.productId?.toLowerCase().includes('mcc-');
    
    if (isMobileCabinet || isModularCabinet) {
      // Add drawer variants
      const baseVariants = [
        { drawers: 2, suffix: 'DWR2', description: '2 Drawers' },
        { drawers: 3, suffix: 'DWR3', description: '3 Drawers' }, 
        { drawers: 4, suffix: 'DWR4', description: '4 Drawers' },
        { drawers: 6, suffix: 'DWR6', description: '6 Drawers' },
        { drawers: 8, suffix: 'DWR8', description: '8 Drawers' }
      ];
      
      // Add left/right hand variants
      const handVariants = [
        { hand: 'LH', description: 'Left Hand' },
        { hand: 'RH', description: 'Right Hand' }
      ];
      
      // Standard configuration
      variants.push({
        id: `${product.productId}-standard`,
        name: `${product.name} - Standard`,
        dimensions: product.dimensions || '500×500×650 mm',
        description: 'Standard configuration',
        configuration: 'Standard'
      });
      
      // Add drawer variants
      baseVariants.forEach(variant => {
        variants.push({
          id: `${product.productId}-${variant.suffix}`,
          name: `${product.name} - ${variant.description}`,
          dimensions: product.dimensions || '500×500×650 mm',
          description: variant.description,
          drawerCount: variant.drawers,
          configuration: variant.suffix
        });
      });
      
      // Add hand variants
      handVariants.forEach(variant => {
        variants.push({
          id: `${product.productId}-${variant.hand}`,
          name: `${product.name} - ${variant.description}`,
          dimensions: product.dimensions || '500×500×650 mm',
          description: variant.description,
          configuration: variant.hand
        });
      });
    } else {
      // Default variant for other products
      variants.push({
        id: `${product.productId}-default`,
        name: product.name,
        dimensions: product.dimensions || 'Standard size',
        description: 'Standard configuration',
        configuration: 'Default'
      });
    }
    
    return variants;
  };

  const variants = getProductVariants(product);

  const handleVariantSelect = () => {
    const variant = variants.find(v => v.id === selectedVariant);
    if (variant) {
      onVariantSelect(variant);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Select Product Variant
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{product.name}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Choose Configuration:</label>
            <Select value={selectedVariant} onValueChange={setSelectedVariant}>
              <SelectTrigger>
                <SelectValue placeholder="Select a variant" />
              </SelectTrigger>
              <SelectContent>
                {variants.map(variant => (
                  <SelectItem key={variant.id} value={variant.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{variant.description}</span>
                      <span className="text-xs text-muted-foreground">{variant.dimensions}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedVariant && (() => {
            const variant = variants.find(v => v.id === selectedVariant);
            return variant ? (
              <div className="p-3 bg-muted rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{variant.configuration}</Badge>
                    {variant.drawerCount && (
                      <Badge variant="outline">{variant.drawerCount} Drawers</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{variant.description}</p>
                  <p className="text-xs font-mono">{variant.dimensions}</p>
                </div>
              </div>
            ) : null;
          })()}
          
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleVariantSelect} 
              disabled={!selectedVariant}
              className="flex-1"
            >
              Select Variant
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductVariantSelector;