import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Package } from 'lucide-react';

/** Matches the DB shape you shared previously (subset used here) */
type DBProduct = {
  id: string;
  name: string;
  dimensions?: string; // e.g. "500×500×650 mm"
  description?: string;
  product_code?: string;
};

export interface ProductVariant {
  id: string;
  name: string;
  dimensions: string;
  description: string;
  drawerCount?: number;
  configuration?: string;
}

interface ProductVariantSelectorProps {
  product: DBProduct | Record<string, any>; // tolerate older callers
  isOpen: boolean;
  onClose: () => void;
  onVariantSelect: (variant: ProductVariant) => void;
}

const fallbackDimensions = '500×500×650 mm';

const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  product,
  isOpen,
  onClose,
  onVariantSelect,
}) => {
  const [selectedVariant, setSelectedVariant] = useState<string>('');

  if (!isOpen) return null;

  // Normalize product fields safely
  const productName: string = (product?.name ?? 'Product').toString();
  const productCode: string = (product?.product_code ?? '').toString();
  const productDims: string = (product?.dimensions ?? fallbackDimensions).toString();
  const baseId = productCode || productName.replace(/\s+/g, '-').toLowerCase();

  const getProductVariants = (pName: string, pCode: string, dims: string): ProductVariant[] => {
    const nameLC = pName.toLowerCase();
    const codeLC = pCode.toLowerCase();

    const isMobileCabinet =
      nameLC.includes('mobile cabinet') || codeLC.startsWith('mc-');

    const isModularCabinet =
      nameLC.includes('modular cabinet') || codeLC.startsWith('mcc-');

    const variants: ProductVariant[] = [];

    // Always include a Standard/default option
    variants.push({
      id: `${baseId}-standard`,
      name: `${pName} - Standard`,
      dimensions: dims,
      description: 'Standard configuration',
      configuration: 'Standard',
    });

    if (isMobileCabinet || isModularCabinet) {
      // Drawer-count variants
      const drawerDefs = [
        { drawers: 2, suffix: 'DWR2', description: '2 Drawers' },
        { drawers: 3, suffix: 'DWR3', description: '3 Drawers' },
        { drawers: 4, suffix: 'DWR4', description: '4 Drawers' },
        { drawers: 6, suffix: 'DWR6', description: '6 Drawers' },
        { drawers: 8, suffix: 'DWR8', description: '8 Drawers' },
      ];

      drawerDefs.forEach((d) =>
        variants.push({
          id: `${baseId}-${d.suffix}`,
          name: `${pName} - ${d.description}`,
          dimensions: dims,
          description: d.description,
          drawerCount: d.drawers,
          configuration: d.suffix,
        })
      );

      // Handedness variants
      const handDefs = [
        { hand: 'LH', description: 'Left Hand' },
        { hand: 'RH', description: 'Right Hand' },
      ];

      handDefs.forEach((h) =>
        variants.push({
          id: `${baseId}-${h.hand}`,
          name: `${pName} - ${h.description}`,
          dimensions: dims,
          description: h.description,
          configuration: h.hand,
        })
      );
    }

    return variants;
  };

  const variants = getProductVariants(productName, productCode, productDims);

  const handleVariantSelect = () => {
    const variant = variants.find((v) => v.id === selectedVariant);
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
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{productName}</p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Choose Configuration:</label>
            <Select value={selectedVariant} onValueChange={setSelectedVariant}>
              <SelectTrigger>
                <SelectValue placeholder="Select a variant" />
              </SelectTrigger>
              <SelectContent>
                {variants.map((variant) => (
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
            const v = variants.find((vv) => vv.id === selectedVariant);
            if (!v) return null;
            return (
              <div className="p-3 bg-muted rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {v.configuration && <Badge variant="secondary">{v.configuration}</Badge>}
                    {typeof v.drawerCount === 'number' && (
                      <Badge variant="outline">{v.drawerCount} Drawers</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{v.description}</p>
                  <p className="text-xs font-mono">{v.dimensions}</p>
                </div>
              </div>
            );
          })()}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleVariantSelect} disabled={!selectedVariant} className="flex-1">
              Select Variant
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductVariantSelector;
