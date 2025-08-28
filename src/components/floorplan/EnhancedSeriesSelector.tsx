// src/components/floorplan/EnhancedSeriesSelector.tsx
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
  toTitleCase,
  formatProductName,
} from '@/utils/seriesNameFormatter';
import {
  getOrientationDisplayName,
  formatDrawerCount,
  formatFinishType,
} from '@/utils/productTerminology';

interface EnhancedSeriesSelectorProps {
  onProductDrag: (product: any) => void;
  currentTool: string;
  onProductUsed?: (productId: string) => void;
}

const EnhancedSeriesSelector: React.FC<EnhancedSeriesSelectorProps> = ({
  onProductDrag,
  currentTool,
  onProductUsed,
}) => {
  const { productSeries, loading, error } = useProductSeries();

  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [seriesFilters, setSeriesFilters] = useState<
    Record<
      string,
      {
        finish?: string;
        orientation?: string;
        drawerCount?: string;
        doorType?: string;
        dimensions?: string;
        category?: string;
        mountingType?: string;
        mixingType?: string;
        handleType?: string;
        cabinetClass?: string;
        emergencyShowerType?: string;
      }
    >
  >({});

  // Variant chooser (kept inside the selector only)
  const [showVariantSelector, setShowVariantSelector] = useState(false);
  const [selectedProductForVariants, setSelectedProductForVariants] =
    useState<Product | null>(null);

  const isInteractionDisabled = currentTool !== 'select';

  // ---- Drawer normalization helpers ----------------------------------------
  const getDrawerCount = (p: Product): number => {
    // Look across common fields and parse strings like "3", "3 Drawers"
    const raw =
      (p as any).number_of_drawers ??
      (p as any).drawer_count ??
      (p as any).drawers ??
      null;

    if (raw == null) {
      // sometimes embedded in the product name, e.g., "... 3-Drawer ..."
      const m =
        typeof p.name === 'string'
          ? p.name.match(/(\d+)\s*-\s*drawer|\b(\d+)\s*drawer/i)
          : null;
      if (m) {
        const n = parseInt(m[1] || m[2], 10);
        return Number.isFinite(n) ? n : 0;
      }
      return 0;
    }
    if (typeof raw === 'number') return raw;
    if (typeof raw === 'string') {
      const m = raw.match(/(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    }
    return 0;
  };

  const drawerCountsFor = (products: Product[]): string[] => {
    const set = new Set<string>();
    for (const p of products) {
      const n = getDrawerCount(p);
      // keep 0 as a *possible* value internally, but we won't show it in the UI
      set.add(String(n));
    }
    return [...set].sort((a, b) => parseInt(a) - parseInt(b));
  };
  // ---------------------------------------------------------------------------

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

  const handleFilterChange = (
    seriesId: string,
    filterKey:
      | 'finish'
      | 'orientation'
      | 'drawerCount'
      | 'doorType'
      | 'dimensions'
      | 'category'
      | 'mountingType'
      | 'mixingType'
      | 'handleType'
      | 'cabinetClass'
      | 'emergencyShowerType',
    value: string
  ) => {
    setSeriesFilters((prev) => ({
      ...prev,
      [seriesId]: {
        ...prev[seriesId],
        [filterKey]: value === 'all' ? undefined : value,
      },
    }));
  };

  const getUniqueValues = (products: Product[], field: keyof Product): string[] => {
    // Special case handled above for drawers; fall through for others
    const values = products
      .map((p) => {
        if (field === 'dimensions') return String(p.dimensions || '');
        if (field === 'door_type') return String(p.door_type || '');
        if (field === 'finish_type') return String(p.finish_type || '');
        if (field === 'orientation') return String(p.orientation || '');
        if (field === 'category') return String(p.category || '');
        if (field === 'mounting_type') return String((p as any).mounting_type || '');
        if (field === 'mixing_type') return String((p as any).mixing_type || '');
        if (field === 'handle_type') return String((p as any).handle_type || '');
        if (field === 'cabinet_class') return String((p as any).cabinet_class || '');
        if (field === 'emergency_shower_type')
          return String((p as any).emergency_shower_type || '');
        return '';
      })
      .filter(Boolean);

    const uniques = [...new Set(values)];

    // dimension sort (volume-ish)
    if (field === 'dimensions') {
      const vol = (dim: string) => {
        const m = dim.match(
          /(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)/i
        );
        if (!m) return 0;
        return parseFloat(m[1]) * parseFloat(m[2]) * parseFloat(m[3]);
      };
      return uniques.sort((a, b) => vol(a) - vol(b));
    }

    // door/finish nice-ish sorts
    if (field === 'door_type') {
      const order = ['Solid', 'Glass', 'Mesh', 'Open'];
      return uniques.sort((a, b) => {
        const ia = order.indexOf(a);
        const ib = order.indexOf(b);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return a.localeCompare(b);
      });
    }
    if (field === 'finish_type') {
      const order = ['Powder Coat', 'Stainless Steel', 'Epoxy', 'Phenolic'];
      return uniques.sort((a, b) => {
        const ia = order.indexOf(a);
        const ib = order.indexOf(b);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return a.localeCompare(b);
      });
    }

    return uniques.sort();
  };

  const getFilteredProducts = (seriesId: string, products: Product[]): Product[] => {
    const f = seriesFilters[seriesId] || {};
    return products.filter((p) => {
      if (f.finish && p.finish_type !== f.finish) return false;
      if (f.orientation && p.orientation !== f.orientation) return false;
      if (f.drawerCount && String(getDrawerCount(p)) !== f.drawerCount) return false;
      if (f.doorType && p.door_type !== f.doorType) return false;
      if (f.dimensions && p.dimensions !== f.dimensions) return false;
      if (f.category && p.category !== f.category) return false;
      if (f.mountingType && (p as any).mounting_type !== f.mountingType) return false;
      if (f.mixingType && (p as any).mixing_type !== f.mixingType) return false;
      if (f.handleType && (p as any).handle_type !== f.handleType) return false;
      if (f.cabinetClass && (p as any).cabinet_class !== f.cabinetClass) return false;
      if (
        f.emergencyShowerType &&
        (p as any).emergency_shower_type !== f.emergencyShowerType
      )
        return false;
      return true;
    });
  };

  const getAvailableFilterOptions = (
    seriesId: string,
    products: Product[],
    field: keyof Product | 'number_of_drawers',
    currentFilters: Record<string, any>
  ): string[] => {
    // apply all filters except the one we’re computing
    const other = { ...currentFilters };
    const mapKey: Record<string, string> = {
      finish_type: 'finish',
      orientation: 'orientation',
      number_of_drawers: 'drawerCount',
      door_type: 'doorType',
      dimensions: 'dimensions',
      mounting_type: 'mountingType',
      mixing_type: 'mixingType',
      handle_type: 'handleType',
      cabinet_class: 'cabinetClass',
      emergency_shower_type: 'emergencyShowerType',
    };
    delete other[mapKey[field as string] ?? ''];

    const filtered = products.filter((p) => {
      if (other.finish && p.finish_type !== other.finish) return false;
      if (other.orientation && p.orientation !== other.orientation) return false;
      if (other.drawerCount && String(getDrawerCount(p)) !== other.drawerCount) return false;
      if (other.doorType && p.door_type !== other.doorType) return false;
      if (other.dimensions && p.dimensions !== other.dimensions) return false;
      if (other.mountingType && (p as any).mounting_type !== other.mountingType)
        return false;
      if (other.mixingType && (p as any).mixing_type !== other.mixingType)
        return false;
      if (other.handleType && (p as any).handle_type !== other.handleType)
        return false;
      if (other.cabinetClass && (p as any).cabinet_class !== other.cabinetClass)
        return false;
      if (
        other.emergencyShowerType &&
        (p as any).emergency_shower_type !== other.emergencyShowerType
      )
        return false;
      return true;
    });

    if (field === 'number_of_drawers') {
      return drawerCountsFor(filtered);
    }
    return getUniqueValues(filtered, field as keyof Product);
  };

  // Clicking a product: only show variant chooser if >1 match remains
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
  };

  const handleVariantSelect = () => {
    setShowVariantSelector(false);
    setSelectedProductForVariants(null);
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'Innosin Lab': '#10b981',
      'Broen-Lab': '#3b82f6',
      'Hamilton Laboratory Solutions': '#1d4ed8',
      'Oriental Giken Inc.': '#ef4444',
    };
    return colors[category] || '#6b7280';
  };

  const handleDragStart = (e: React.DragEvent, product: Product) => {
    const payload = {
      id: product.id,
      productId: product.id,
      name: formatProductName(product.name),
      product_code: product.product_code || product.id,
      category: product.category,
      thumbnail: (product as any).thumbnail_path || (product as any).thumbnail,
      modelPath: (product as any).model_path || (product as any).modelPath,
      dimensions: product.dimensions,
      finish_type: product.finish_type,
      number_of_drawers: getDrawerCount(product), // normalized!
      orientation: product.orientation,
      door_type: product.door_type,
      color: getCategoryColor(product.category),
    };

    e.dataTransfer.setData('application/json', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'copy';
    onProductUsed?.(product.id);
    onProductDrag(payload);
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
      {isInteractionDisabled && (
        <div className="p-3 bg-warning/10 border border-warning/20 rounded-t text-sm text-warning-foreground">
          Switch to Select tool to place products
        </div>
      )}

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

            const drawerOptions = getAvailableFilterOptions(
              series.id,
              series.products,
              'number_of_drawers',
              f
            )
              .filter((c) => c && c !== '0' && c !== 'null');

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
                  {/* FILTER VARIANTS */}
                  <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                      Filter Variants
                    </div>

                    {/* Orientation */}
                    {getUniqueValues(series.products, 'orientation').length > 1 && (
                      <div>
                        <label className="text-xs font-medium">Orientation</label>
                        <Select
                          value={f.orientation || 'all'}
                          onValueChange={(value) =>
                            handleFilterChange(series.id, 'orientation', value)
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Orientations</SelectItem>
                            {getAvailableFilterOptions(
                              series.id,
                              series.products,
                              'orientation',
                              f
                            ).map((orientation) => (
                              <SelectItem key={orientation} value={orientation}>
                                {getOrientationDisplayName(orientation)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Drawers (now robust) */}
                    {(drawerOptions.length > 0 ||
                      series.products.some((p) => getDrawerCount(p) > 0)) && (
                      <div>
                        <label className="text-xs font-medium">Drawers</label>
                        <Select
                          value={f.drawerCount || 'all'}
                          onValueChange={(value) =>
                            handleFilterChange(series.id, 'drawerCount', value)
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Drawer Counts</SelectItem>
                            {drawerOptions.map((count) => (
                              <SelectItem key={count} value={count}>
                                {formatDrawerCount(parseInt(count))}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Size */}
                    {getUniqueValues(series.products, 'dimensions').length > 1 && (
                      <div>
                        <label className="text-xs font-medium">Size</label>
                        <Select
                          value={f.dimensions || 'all'}
                          onValueChange={(value) =>
                            handleFilterChange(series.id, 'dimensions', value)
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Sizes</SelectItem>
                            {getUniqueValues(series.products, 'dimensions').map(
                              (size) => (
                                <SelectItem key={size} value={size}>
                                  {size}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Finish */}
                    {getUniqueValues(series.products, 'finish_type').length > 1 && (
                      <div>
                        <label className="text-xs font-medium">Finish</label>
                        <Select
                          value={f.finish || 'all'}
                          onValueChange={(value) =>
                            handleFilterChange(series.id, 'finish', value)
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Finishes</SelectItem>
                            {getAvailableFilterOptions(
                              series.id,
                              series.products,
                              'finish_type',
                              f
                            ).map((finish) => (
                              <SelectItem key={finish} value={finish}>
                                {formatFinishType(finish)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* PRODUCT GRID */}
                  <div className="grid grid-cols-2 gap-3">
                    {filtered.map((product) => (
                      <div
                        key={product.id}
                        draggable={!isInteractionDisabled}
                        onDragStart={(e) => handleDragStart(e, product)}
                        onClick={() => handleProductClick(series.id, product)}
                        className={`border rounded-lg p-2 transition-all ${
                          isInteractionDisabled
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-move hover:border-primary/60'
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
                          {product.product_code || product.id}
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

      {/* Variant chooser (only if >1 valid remains) */}
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
