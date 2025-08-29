import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Package, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { useProductSeries } from '@/hooks/useProductSeries';
import { Product } from '@/types/product';
import ProductVariantSelector from './ProductVariantSelector';
import {
  formatSeriesName,
  formatProductName,
} from '@/utils/seriesNameFormatter';
import {
  getOrientationDisplayName,
  formatFinishType,
} from '@/utils/productTerminology';

interface EnhancedSeriesSelectorProps {
  onProductDrag: (product: any) => void;
  currentTool: string;
  onProductUsed?: (productId: string) => void;
  /** ✅ NEW: Callback when product is clicked (used by HotspotEditor) */
  onProductSelect?: (product: Product) => void;
}

const EnhancedSeriesSelector: React.FC<EnhancedSeriesSelectorProps> = ({
  onProductDrag,
  currentTool,
  onProductUsed,
  onProductSelect,
}) => {
  const { productSeries, loading, error } = useProductSeries();

  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [seriesFilters, setSeriesFilters] = useState<Record<string, any>>({});
  const [showVariantSelector, setShowVariantSelector] = useState(false);
  const [selectedProductForVariants, setSelectedProductForVariants] =
    useState<Product | null>(null);

  const isInteractionDisabled = currentTool !== 'select';

  // Helpers (same as before)...
  const deriveDrawerCount = (p: Product): number | null => {
    const direct =
      (p as any).number_of_drawers ??
      (p as any).drawers ??
      (p as any).drawer_count ??
      null;
    if (direct !== null && direct !== undefined) {
      const n = parseInt(String(direct), 10);
      return isNaN(n) ? null : n;
    }

    const hay = [
      (p as any).product_code,
      p.id,
      p.name,
      (p as any).description,
      (p as any).short_description,
    ]
      .filter(Boolean)
      .join(' ')
      .toString();

    let m = hay.match(/\bD[RW]{2}[-\s]?(\d{1,2})\b/i);
    if (m && m[1]) return parseInt(m[1], 10);

    m = hay.match(/\b(\d{1,2})\s*[- ]?\s*drawers?\b/i);
    if (m && m[1]) return parseInt(m[1], 10);

    return null;
  };

  const toDrawerCode = (n: number) => `DWR${n}`;

  const filteredSeries = useMemo(() => {
    if (!searchTerm) return productSeries;
    const term = searchTerm.toLowerCase();
    return productSeries.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.description?.toLowerCase().includes(term)
    );
  }, [productSeries, searchTerm]);

  const handleSeriesToggle = (seriesId: string) => {
    setExpandedSeries(expandedSeries === seriesId ? null : seriesId);
    if (!seriesFilters[seriesId]) {
      setSeriesFilters((prev) => ({ ...prev, [seriesId]: {} }));
    }
  };

  const getFilteredProducts = (seriesId: string, products: Product[]): Product[] => {
    const f = seriesFilters[seriesId] || {};
    return products.filter((p) => {
      if (f.finish && p.finish_type !== f.finish) return false;
      if (f.orientation && p.orientation !== f.orientation) return false;
      if (f.drawerCount) {
        const n = deriveDrawerCount(p);
        if (String(n ?? '') !== f.drawerCount) return false;
      }
      if (f.doorType && p.door_type !== f.doorType) return false;
      if (f.dimensions && p.dimensions !== f.dimensions) return false;
      if (f.category && p.category !== f.category) return false;
      if (f.mountingType && p.mounting_type !== f.mountingType) return false;
      if (f.mixingType && p.mixing_type !== f.mixingType) return false;
      if (f.handleType && p.handle_type !== f.handleType) return false;
      if (f.cabinetClass && p.cabinet_class !== f.cabinetClass) return false;
      if (f.emergencyShowerType && p.emergency_shower_type !== f.emergencyShowerType) return false;
      return true;
    });
  };

  const handleProductClick = (seriesId: string, product: Product) => {
    const series = productSeries.find((s) => s.id === seriesId);
    if (!series) return;

    const stillValid = getFilteredProducts(seriesId, series.products);

    if (stillValid.length > 1) {
      setSelectedProductForVariants(product);
      setShowVariantSelector(true);
    } else {
      setSelectedProductForVariants(null);
      setShowVariantSelector(false);
    }

    // ✅ Notify parent (HotspotEditor)
    onProductSelect?.(product);
  };

  const handleVariantSelect = () => {
    setShowVariantSelector(false);
    setSelectedProductForVariants(null);
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-spin" />
        <p className="text-sm text-muted-foreground">Loading series...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-destructive">Error loading series: {error}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search series..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {filteredSeries.map((series) => {
            const f = seriesFilters[series.id] || {};
            const filtered = getFilteredProducts(series.id, series.products);
            const hasAnyDrawers =
              series.products.some((p) => deriveDrawerCount(p) !== null);

            return (
              <Collapsible
                key={series.id}
                open={expandedSeries === series.id}
                onOpenChange={() => handleSeriesToggle(series.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full p-3 h-auto text-left justify-between items-center"
                  >
                    <div className="flex flex-col items-start space-y-1">
                      <div className="font-medium text-sm leading-tight">
                        {formatSeriesName(series.name)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {series.products.length} variants
                      </div>
                    </div>
                    {expandedSeries === series.id ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-3 pl-4 mt-2">
                  {/* Product grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {filtered.map((product) => (
                      <div
                        key={product.id}
                        draggable={!isInteractionDisabled}
                        onDragStart={(e) => {
                          const payload = { id: product.id, ...product };
                          e.dataTransfer.setData('application/json', JSON.stringify(payload));
                          e.dataTransfer.effectAllowed = 'copy';
                          onProductUsed?.(product.id);
                          onProductDrag(payload);
                        }}
                        onClick={() => handleProductClick(series.id, product)}
                        className={`border rounded-lg p-2 transition-all ${
                          isInteractionDisabled
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-pointer hover:border-primary/60'
                        }`}
                        title={formatProductName(product.name)}
                      >
                        <div className="aspect-square bg-white rounded overflow-hidden flex items-center justify-center">
                          <img
                            src={(product as any).thumbnail_path || (product as any).thumbnail}
                            alt={product.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <p className="text-[10px] text-center mt-2 font-medium text-muted-foreground">
                          {(product as any).product_code || product.id}
                        </p>
                      </div>
                    ))}

                    {filtered.length === 0 && (
                      <div className="col-span-2 text-center py-4 text-sm text-muted-foreground">
                        No products match the selected filters
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>

      <ProductVariantSelector
        product={selectedProductForVariants || undefined}
        isOpen={showVariantSelector}
        onClose={() => {
          setShowVariantSelector(false);
          setSelectedProductForVariants(null);
        }}
        onVariantSelect={handleVariantSelect}
      />
    </div>
  );
};

export default EnhancedSeriesSelector;
