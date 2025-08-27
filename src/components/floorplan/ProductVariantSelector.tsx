
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Package, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProductVariant {
  id: string;
  name: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  description: string;
  drawerCount?: number;
  configuration?: string;
  productId: string;
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
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch variants from database
  useEffect(() => {
    if (isOpen && product) {
      fetchProductVariants();
    }
  }, [isOpen, product]);

  const fetchProductVariants = async () => {
    setLoading(true);
    try {
      // Query for product variants based on base product ID or series
      const baseProductId = product.productId?.toLowerCase() || '';
      const seriesMatch = baseProductId.match(/(mc|mcc)-pc/);
      
      if (seriesMatch) {
        // Fetch variants for mobile/modular cabinets
        const { data: variantData, error } = await supabase
          .from('products')
          .select('*')
          .ilike('product_id', `%${seriesMatch[0]}%`)
          .order('number_of_drawers', { ascending: true });

        if (error) {
          console.error('Error fetching variants:', error);
          generateFallbackVariants();
          return;
        }

        if (variantData && variantData.length > 0) {
          const processedVariants = variantData.map(item => ({
            id: item.product_id,
            name: item.name,
            dimensions: {
              length: item.length || 500,
              width: item.width || 500,
              height: item.height || 650
            },
            description: `${item.number_of_drawers ? `${item.number_of_drawers} Drawers` : 'Standard Configuration'}`,
            drawerCount: item.number_of_drawers,
            configuration: item.configuration || 'Standard',
            productId: item.product_id
          }));

          setVariants(processedVariants);
        } else {
          generateFallbackVariants();
        }
      } else {
        generateFallbackVariants();
      }
    } catch (error) {
      console.error('Error fetching product variants:', error);
      generateFallbackVariants();
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackVariants = () => {
    // Fallback variants if database query fails
    const fallbackVariants: ProductVariant[] = [];
    
    // Check if it's a mobile cabinet or modular cabinet
    const isMobileCabinet = product.name?.toLowerCase().includes('mobile cabinet') || 
                           product.productId?.toLowerCase().includes('mc-');
    const isModularCabinet = product.name?.toLowerCase().includes('modular cabinet') ||
                            product.productId?.toLowerCase().includes('mcc-');
    
    if (isMobileCabinet || isModularCabinet) {
      const baseVariants = [
        { drawers: 2, description: '2 Drawers', suffix: 'DWR2' },
        { drawers: 3, description: '3 Drawers', suffix: 'DWR3' }, 
        { drawers: 4, description: '4 Drawers', suffix: 'DWR4' },
        { drawers: 6, description: '6 Drawers', suffix: 'DWR6' },
        { drawers: 8, description: '8 Drawers', suffix: 'DWR8' }
      ];

      baseVariants.forEach(variant => {
        fallbackVariants.push({
          id: `${product.productId}-${variant.suffix}`,
          name: `${product.name} - ${variant.description}`,
          dimensions: product.dimensions || { length: 500, width: 500, height: 650 },
          description: variant.description,
          drawerCount: variant.drawers,
          configuration: variant.suffix,
          productId: `${product.productId}-${variant.suffix}`
        });
      });

      // Add hand variants
      const handVariants = [
        { hand: 'LH', description: 'Left Hand' },
        { hand: 'RH', description: 'Right Hand' }
      ];
      
      handVariants.forEach(variant => {
        fallbackVariants.push({
          id: `${product.productId}-${variant.hand}`,
          name: `${product.name} - ${variant.description}`,
          dimensions: product.dimensions || { length: 500, width: 500, height: 650 },
          description: variant.description,
          configuration: variant.hand,
          productId: `${product.productId}-${variant.hand}`
        });
      });
    } else {
      // Default variant for other products
      fallbackVariants.push({
        id: `${product.productId}-default`,
        name: product.name,
        dimensions: product.dimensions || { length: 500, width: 500, height: 650 },
        description: 'Standard configuration',
        configuration: 'Default',
        productId: product.productId
      });
    }
    
    setVariants(fallbackVariants);
  };

  const handleVariantSelect = () => {
    const variant = variants.find(v => v.id === selectedVariant);
    if (variant) {
      onVariantSelect(variant);
      onClose();
    }
  };

  if (!isOpen) return null;

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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading variants...</span>
            </div>
          ) : (
            <>
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
                          <span className="text-xs text-muted-foreground">
                            {variant.dimensions.length}×{variant.dimensions.width}×{variant.dimensions.height}mm
                          </span>
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
                      <p className="text-xs font-mono">
                        {variant.dimensions.length}×{variant.dimensions.width}×{variant.dimensions.height}mm
                      </p>
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductVariantSelector;
