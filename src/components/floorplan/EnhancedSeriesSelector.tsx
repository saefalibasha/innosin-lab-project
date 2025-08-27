import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Package, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { useProductSeries } from '@/hooks/useProductSeries';
import { Product } from '@/types/product';
import ProductVariantSelector from './ProductVariantSelector';
import { formatSeriesName, toTitleCase, formatProductName } from '@/utils/seriesNameFormatter';
import { getOrientationDisplayName, formatDrawerCount, formatFinishType } from '@/utils/productTerminology';

interface EnhancedSeriesSelectorProps {
  onProductDrag: (product: any) => void;
  currentTool: string;
  onProductUsed?: (productId: string) => void;
}

type SeriesFilters = Record<
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
>;

const normalize = (v: unknown) =>
  v === null || v === undefined || v === '' ? undefined : String(v);

const numOrUndefined = (v: unknown) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const EnhancedSeriesSelector: React.FC<EnhancedSeriesSelectorProps> = ({
  onProductDrag,
  currentTool,
  onProductUsed,
}) => {
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showVariantSelector, setShowVariantSelector] = useState(false);
  const [selectedProductForVariants, setSelectedProductForVariants] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [seriesFilters, setSeriesFilters] = useState<SeriesFilters>({});
  const { productSeries, loading, error } = useProductSeries();

  // ————— helpers —————

  const extractDimensions = (product: Product) => {
    const dim = product.dimensions;
    if (dim) {
      const m = dim.match(
        /(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i
      );
      if (m) {
        const [, L, W, H, unit = 'mm'] = m;
        const factor = unit.toLowerCase() === 'mm' ? 0.001 : unit.toLowerCase() === 'cm' ? 0.01 : 1;
        return { length: parseFloat(L) * factor, width: parseFloat(W) * factor, height: parseFloat(H) * factor };
      }
    }
    return { length: 1.0, width: 0.6, height: 0.85 };
  };

  /** unique values helper with smart sorts */
  const uniqueValues = (products: Product[], field: keyof Product): string[] => {
    const vals = products
      .map(p => {
        if (field === 'number_of_drawers') {
          const n = numOrUndefined(p.number_of_drawers);
          return n === undefined ? '' : String(n);
        }
        const raw = (p as any)[field];
        return typeof raw === 'string' || typeof raw === 'number' ? String(raw) : '';
      })
      .filter(Boolean);

    const set = Array.from(new Set(vals));

    if (field === 'number_of_drawers') {
      return set.sort((a, b) => parseInt(a) - parseInt(b));
    }

    if (field === 'dimensions') {
      const vol = (s: string) => {
        const m = s.match(/(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)/i);
        if (!m) return 0;
        const [, L, W, H] = m;
        return parseFloat(L) * parseFloat(W) * parseFloat(H);
        };
      return set.sort((a, b) => vol(a) - vol(b));
    }

    if (field === 'door_type') {
      const order = ['Solid', 'Glass', 'Mesh', 'Open'];
      return set.sort((a, b) => {
        const ai = order.indexOf(a);
        const bi = order.indexOf(b);
        if (ai !== -1 && bi !== -1) return ai - bi;
        if (ai !== -1) return -1;
        if (bi !== -1) return 1;
        return a.localeCompare(b);
      });
    }

    if (field === 'finish_type') {
      const order = ['Powder Coat', 'Stainless Steel', 'Epoxy', 'Phenolic'];
      return set.sort((a, b) => {
        const ai = order.indexOf(a);
        const bi = order.indexOf(b);
        if (ai !== -1 && bi !== -1) return ai - bi;
        if (ai !== -1) return -1;
        if (bi !== -1) return 1;
        return a.localeCompare(b);
      });
    }

    return set.sort();
  };

  const filteredSeries = useMemo(() => {
    if (!searchTerm) return productSeries;
    const term = searchTerm.toLowerCase();
    return productSeries.filter(
      s => s.name.toLowerCase().includes(term) || s.description?.toLowerCase().includes(term)
    );
  }, [productSeries, searchTerm]);

  // ————— filter mechanics —————

  const handleSeriesToggle = (seriesId: string) => {
    setExpandedSeries(expandedSeries === seriesId ? null : seriesId);
    setSelectedProduct(null);
    if (!seriesFilters[seriesId]) {
      setSeriesFilters(prev => ({ ...prev, [seriesId]: {} }));
    }
  };

  const setFilter = (seriesId: string, key: keyof SeriesFilters[string], value: string) => {
    setSeriesFilters(prev => ({
      ...prev,
      [seriesId]: {
        ...prev[seriesId],
        [key]: value === 'all' ? undefined : value,
      },
    }));
    setSelectedProduct(null);
  };

  const applyFilters = (seriesId: string, products: Product[]) => {
    const f = seriesFilters[seriesId] || {};
    return products.filter(p => {
      const finish = normalize(p.finish_type);
      const orientation = normalize(p.orientation);
      const drawers = numOrUndefined(p.number_of_drawers);
      const doorType = normalize(p.door_type);
      const dimensions = normalize(p.dimensions);
      const category = normalize(p.category);
      const mounting = normalize(p.mounting_type);
      const mixing = normalize(p.mixing_type);
      const handle = normalize(p.handle_type);
      const cabinetClass = normalize(p.cabinet_class);
      const shower = normalize(p.emergency_shower_type);

      if (f.finish && finish !== f.finish) return false;
      if (f.orientation && orientation !== f.orientation) return false;
      if (f.drawerCount && String(drawers ?? '') !== f.drawerCount) return false;
      if (f.doorType && doorType !== f.doorType) return false;
      if (f.dimensions && dimensions !== f.dimensions) return false;
      if (f.category && category !== f.category) return false;
      if (f.mountingType && mounting !== f.mountingType) return false;
      if (f.mixingType && mixing !== f.mixingType) return false;
      if (f.handleType && handle !== f.handleType) return false;
      if (f.cabinetClass && cabinetClass !== f.cabinetClass) return false;
      if (f.emergencyShowerType && shower !== f.emergencyShowerType) return false;
      return true;
    });
  };

  const optionsFor = (
    seriesId: string,
    products: Product[],
    field: keyof Product,
    current: SeriesFilters[string]
  ) => {
    // temporarily drop this field from filters to compute options
    const { ...others } = current || {};
    const mapKey: Record<string, keyof SeriesFilters[string]> = {
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
    const k = mapKey[field as string];
    if (k) delete (others as any)[k];

    const temp = { [seriesId]: others } as SeriesFilters;
    const filtered = products.filter(p => applyFilters(seriesId, [p]).length > 0); // cheap reuse
    return uniqueValues(filtered, field);
  };

  // ————— selection and DnD —————

  const handleProductSelect = (product: Product) => {
    const mobile =
      product.name?.toLowerCase().includes('mobile cabinet') ||
      product.product_code?.toLowerCase().includes('mc-');
    const modular =
      product.name?.toLowerCase().includes('modular cabinet') ||
      product.product_code?.toLowerCase().includes('mcc-');

    if (mobile || modular) {
      setSelectedProductForVariants(product);
      setShowVariantSelector(true);
    } else {
      setSelectedProduct(product);
    }
  };

  const handleVariantSelect = (variant: any) => {
    // attach chosen configuration to the selected product (used primarily for display/drag)
    setSelectedProduct(
      selectedProductForVariants
        ? {
            ...selectedProductForVariants,
            id: `${selectedProductForVariants.id}-${variant.configuration}`,
            name: variant.name,
          }
        : null
    );
    setShowVariantSelector(false);
    setSelectedProductForVariants(null);
  };

  const handleDragStart = (e: React.DragEvent, product: Product) => {
    const dims = extractDimensions(product);
    const canvasScale = 100; // 1 m = 100 px for canvas
    const scaled = {
      length: dims.length * canvasScale,
      width: dims.width * canvasScale,
      height: dims.height * canvasScale,
    };

    const payload = {
      id: product.id,
      productId: product.id,
      name: formatProductName(product.name),
      category: product.category,
      dimensions: scaled,
      realDimensions: dims,
      color: getCategoryColor(product.category),
      modelPath: (product as any).model_path || (product as any).modelPath,
      thumbnail: (product as any).thumbnail_path || (product as any).thumbnail,
      description: product.description,
      specifications: product.specifications,
      productCode: product.product_code || product.id,
      series: formatSeriesName(product.category || ''),
      finish: formatFinishType(product.finish_type || ''),
      orientation: getOrientationDisplayName(product.orientation || ''),
      drawerCount:
        numOrUndefined(product.number_of_drawers) !== undefined
          ? formatDrawerCount(Number(product.number_of_drawers))
          : '',
      doorType: product.door_type ? toTitleCase(product.door_type) : '',
    };

    e.dataTransfer.setData('application/json', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'copy';
    onProductDrag(payload);
    onProductUsed?.(product.id);
  };

  const getCategoryColor = (category?: string): string => {
    const colors: Record<string, string> = {
      'Innosin Lab': '#10b981',
      'Broen-Lab': '#3b82f6',
      'Hamilton Laboratory Solutions': '#1d4ed8',
      'Oriental Giken Inc.': '#ef4444',
    };
    return (category && colors[category]) || '#6b7280';
  };

  const isInteractionDisabled = currentTool !== 'select';

  // ————— render —————

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
            const current = seriesFilters[series.id] || {};
            const filteredProducts = applyFilters(series.id, series.products);

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
                        {filteredProducts.length} variants
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
                  {/* Variant Filters */}
                  <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                      Filter Variants
                    </div>

                    {uniqueValues(series.products, 'finish_type').length > 1 && (
                      <div>
                        <label className="text-xs font-medium">Finish:</label>
                        <Select
                          value={current.finish || 'all'}
                          onValueChange={(v) => setFilter(series.id, 'finish', v)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="All Finishes" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Finishes</SelectItem>
                            {optionsFor(series.id, series.products, 'finish_type', current).map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {formatFinishType(opt)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {uniqueValues(series.products, 'number_of_drawers').length > 0 && (
                      <div>
                        <label className="text-xs font-medium">Drawers:</label>
                        <Select
                          value={current.drawerCount || 'all'}
                          onValueChange={(v) => setFilter(series.id, 'drawerCount', v)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="All Drawer Counts" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Drawer Counts</SelectItem>
                            {optionsFor(series.id, series.products, 'number_of_drawers', current)
                              .filter((n) => n && n !== '0')
                              .map((n) => (
                                <SelectItem key={n} value={n}>
                                  {formatDrawerCount(parseInt(n))}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {uniqueValues(series.products, 'orientation').length > 1 && (
                      <div>
                        <label className="text-xs font-medium">Orientation:</label>
                        <Select
                          value={current.orientation || 'all'}
                          onValueChange={(v) => setFilter(series.id, 'orientation', v)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="All Orientations" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Orientations</SelectItem>
                            {optionsFor(series.id, series.products, 'orientation', current).map((o) => (
                              <SelectItem key={o} value={o}>
                                {getOrientationDisplayName(o)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {uniqueValues(series.products, 'door_type').length > 1 && (
                      <div>
                        <label className="text-xs font-medium">Door Type:</label>
                        <Select
                          value={current.doorType || 'all'}
                          onValueChange={(v) => setFilter(series.id, 'doorType', v)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="All Door Types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Door Types</SelectItem>
                            {optionsFor(series.id, series.products, 'door_type', current).map((o) => (
                              <SelectItem key={o} value={o}>
                                {toTitleCase(o)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {uniqueValues(series.products, 'dimensions').length > 1 && (
                      <div>
                        <label className="text-xs font-medium">Size:</label>
                        <Select
                          value={current.dimensions || 'all'}
                          onValueChange={(v) => setFilter(series.id, 'dimensions', v)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="All Sizes" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Sizes</SelectItem>
                            {uniqueValues(series.products, 'dimensions').map((o) => (
                              <SelectItem key={o} value={o}>
                                {o}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Filtered Products — image-only cards with product_code overlay */}
                  {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {filteredProducts.map((product) => {
                        const code = product.product_code || product.id;
                        const img =
                          (product as any).thumbnail_path ||
                          (product as any).thumbnail ||
                          '';

                        return (
                          <div
                            key={product.id}
                            draggable={!isInteractionDisabled}
                            onDragStart={(e) => handleDragStart(e, product)}
                            onClick={() => handleProductSelect(product)}
                            className={`relative border rounded-lg overflow-hidden bg-white transition-all ${
                              isInteractionDisabled
                                ? 'opacity-50 cursor-not-allowed'
                                : 'cursor-move hover:shadow-md'
                            } ${
                              selectedProduct?.id === product.id ? 'ring-2 ring-primary' : ''
                            }`}
                          >
                            {/* badge with product_code */}
                            <div className="absolute left-2 top-2 z-10 rounded-md bg-black/60 text-white text-[10px] px-2 py-1">
                              {code}
                            </div>

                            <div className="aspect-video bg-gray-50">
                              {img ? (
                                <img
                                  src={img}
                                  alt={product.name}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="w-full h-full grid place-items-center text-xs text-muted-foreground">
                                  No Image
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground p-4 text-center">
                      No products match the selected filters
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>

      {/* Variant modal (still supported; tiles remain image-only) */}
      <ProductVariantSelector
        product={selectedProductForVariants}
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
