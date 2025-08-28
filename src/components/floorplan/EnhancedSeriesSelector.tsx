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

/** -------- Drawer normalization helpers ---------- */
/**
 * Try very hard to extract a drawer count from inconsistent data:
 * - number_of_drawers (canonical)
 * - drawer_count / drawerCount
 * - configuration.drawerCount / configuration.drawers
 * - product name like "3-Drawer", "2 Drawer", "4DR"
 * - product_code patterns like "DR3", "3DR"
 */
const deriveDrawerCount = (p: any): number => {
  // explicit numeric fields
  const direct =
    p.number_of_drawers ??
    p.drawer_count ??
    p.drawerCount ??
    p.drawers ??
    p?.configuration?.drawerCount ??
    p?.configuration?.drawers;

  const toNum = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  };
  if (toNum(direct) >= 0) return toNum(direct);

  // parse common strings in name / code
  const text = [
    p.name,
    p.product_code,
    p.productCode,
    p.id,
    p.sku,
  ]
    .filter(Boolean)
    .join(' ');

  // e.g. "3-Drawer", "3 Drawer", "3DR", "DR3"
  const patterns: RegExp[] = [
    /(\d+)\s*[- ]?\s*drawer/i,
    /\b(\d+)\s*dr\b/i,
    /\bdr\s*(\d+)\b/i,
  ];
  for (const rx of patterns) {
    const m = String(text).match(rx);
    if (m && toNum(m[1]) >= 0) return toNum(m[1]);
  }

  return 0;
};

/** map of UI filter key ↔ product field path */
const FIELD_KEY_MAP = {
  finish_type: 'finish' as const,
  orientation: 'orientation' as const,
  number_of_drawers: 'drawerCount' as const,
  door_type: 'doorType' as const,
  dimensions: 'dimensions' as const,
  mounting_type: 'mountingType' as const,
  mixing_type: 'mixingType' as const,
  handle_type: 'handleType' as const,
  cabinet_class: 'cabinetClass' as const,
  emergency_shower_type: 'emergencyShowerType' as const,
};

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

  // Variant chooser (only if multiple choices remain)
  const [showVariantSelector, setShowVariantSelector] = useState(false);
  const [selectedProductForVariants, setSelectedProductForVariants] =
    useState<Product | null>(null);

  const isInteractionDisabled = currentTool !== 'select';

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

  /** Unique values for a given field (with smart drawer derivation) */
  const getUniqueValues = (products: Product[], field: keyof Product | 'number_of_drawers'): string[] => {
    if (field === 'number_of_drawers') {
      const counts = products.map(deriveDrawerCount);
      const uniques = Array.from(new Set(counts)).filter((n) => Number.isFinite(n));
      return uniques.sort((a, b) => a - b).map(String);
    }

    const values = products
      .map((p: any) => {
        const v = p[field];
        return typeof v === 'number' || typeof v === 'string' ? String(v) : '';
      })
      .filter(Boolean);

    const uniques = [...new Set(values)];

    // dimension sort (by pseudo-volume)
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

    // door/finish preferred order
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

  /** Apply filters with derived drawer count */
  const getFilteredProducts = (seriesId: string, products: Product[]): Product[] => {
    const f = seriesFilters[seriesId] || {};
    return products.filter((p: any) => {
      if (f.finish && p.finish_type !== f.finish) return false;
      if (f.orientation && p.orientation !== f.orientation) return false;
      if (f.drawerCount && String(deriveDrawerCount(p) || 0) !== f.drawerCount) return false;
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

  /** Compute available values for one filter while honoring the others */
  const getAvailableFilterOptions = (
    seriesId: string,
    products: Product[],
    field: keyof Product | 'number_of_drawers',
    currentFilters: Record<string, any>
  ) => {
    const keyForUi = (FIELD_KEY_MAP as any)[field] as string | undefined;
    const other = { ...currentFilters };
    if (keyForUi) delete other[keyForUi];

    const filtered = products.filter((p: any) => {
      if (other.finish && p.finish_type !== other.finish) return false;
      if (other.orientation && p.orientation !== other.orientation) return false;
      if (other.drawerCount && String(deriveDrawerCount(p) || 0) !== other.drawerCount) return false;
      if (other.doorType && p.door_type !== other.doorType) return false;
      if (other.dimensions && p.dimensions !== other.dimensions) return false;
      if (other.mountingType && p.mounting_type !== other.mountingType) return false;
      if (other.mixingType && p.mixing_type !== other.mixingType) return false;
      if (other.handleType && p.handle_type !== other.handleType) return false;
      if (other.cabinetClass && p.cabinet_class !== other.cabinetClass) return false;
      if (other.emergencyShowerType && p.emergency_shower_type !== other.emergencyShowerType) return false;
      return true;
    });

    return getUniqueValues(filtered, field);
  };

  // click -> show variants popup only if >1 remain
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
      product_code: (product as any).product_code || (product as any).id,
      category: product.category,
      thumbnail: (product as any).thumbnail_path || (product as any).thumbnail,
      modelPath: (product as any).model_path || (product as any).modelPath,
      dimensions: (product as any).dimensions,
      finish_type: (product as any).finish_type,
      number_of_drawers: deriveDrawerCount(product), // <— normalized into payload
      orientation: (product as any).orientation,
      door_type: (product as any).door_type,
      color: getCategoryColor((product as any).category),
    };

    e.dataTransfer.setData('application/json', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'copy';
    if (onProductUsed) onProductUsed(product.id);
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

            const drawerOptions = getUniqueValues(
              series.products,
              'number_of_drawers'
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

                    {/* Drawers — now robust for Modular/Mobile cabinets */}
                    {(drawerOptions.length > 0 ||
                      series.products.some((p) => deriveDrawerCount(p) > 0)) && (
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
                            {getAvailableFilterOptions(
                              series.id,
                              series.products,
                              'number_of_drawers',
                              f
                            )
                              .filter((c) => c && c !== '0' && c !== 'null')
                              .map((count) => (
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
                    {filtered.map((product: any) => (
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
                            src={product.thumbnail_path || product.thumbnail}
                            alt={product.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>

                        {/* Product code caption */}
                        <p className="text-[10px] text-center mt-2 font-medium text-muted-foreground">
                          {(product as any).product_code || product.id}
                          {deriveDrawerCount(product) > 0 && (
                            <span className="ml-1 opacity-70">
                              • {formatDrawerCount(deriveDrawerCount(product))}
                            </span>
                          )}
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

      {/* Variant chooser (only when > 1 remain) */}
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
