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
import { 
  getOrientationDisplayName, 
  formatDrawerCount, 
  formatFinishType 
} from '@/utils/productTerminology';

interface EnhancedSeriesSelectorProps {
  onProductDrag: (product: any) => void;
  currentTool: string;
  onProductUsed?: (productId: string) => void;
}

const EnhancedSeriesSelector: React.FC<EnhancedSeriesSelectorProps> = ({ 
  onProductDrag, 
  currentTool, 
  onProductUsed 
}) => {
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showVariantSelector, setShowVariantSelector] = useState(false);
  const [selectedProductForVariants, setSelectedProductForVariants] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [seriesFilters, setSeriesFilters] = useState<Record<string, {
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
  }>>({});
  const { productSeries, loading, error } = useProductSeries();

  const extractDimensions = (product: Product) => {
    if (product.dimensions) {
      const m = product.dimensions.match(/(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)\s*(mm|cm|m)?/i);
      if (m) {
        const [, L, W, H, unit = 'mm'] = m;
        const factor = unit === 'mm' ? 0.001 : unit === 'cm' ? 0.01 : 1;
        return {
          length: parseFloat(L) * factor,
          width: parseFloat(W) * factor,
          height: parseFloat(H) * factor
        };
      }
    }
    return { length: 1.0, width: 0.6, height: 0.85 };
  };

  const filteredSeries = useMemo(() => {
    if (!searchTerm) return productSeries;
    return productSeries.filter(series =>
      series.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      series.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [productSeries, searchTerm]);

  const handleSeriesToggle = (seriesId: string) => {
    setExpandedSeries(expandedSeries === seriesId ? null : seriesId);
    setSelectedProduct(null);
    if (!seriesFilters[seriesId]) {
      setSeriesFilters(prev => ({ ...prev, [seriesId]: {} }));
    }
  };

  const handleFilterChange = (seriesId: string, filterType: string, value: string) => {
    setSeriesFilters(prev => ({
      ...prev,
      [seriesId]: {
        ...prev[seriesId],
        [filterType]: value === 'all' ? undefined : value
      }
    }));
    setSelectedProduct(null);
  };

  const getFilteredProducts = (seriesId: string, products: Product[]) => {
    const filters = seriesFilters[seriesId] || {};
    return products.filter(p => {
      if (filters.finish && p.finish_type !== filters.finish) return false;
      if (filters.orientation && p.orientation !== filters.orientation) return false;
      if (filters.drawerCount && String(p.number_of_drawers || 0) !== filters.drawerCount) return false;
      if (filters.doorType && p.door_type !== filters.doorType) return false;
      if (filters.dimensions && p.dimensions !== filters.dimensions) return false;
      if (filters.category && p.category !== filters.category) return false;
      if (filters.mountingType && p.mounting_type !== filters.mountingType) return false;
      if (filters.mixingType && p.mixing_type !== filters.mixingType) return false;
      if (filters.handleType && p.handle_type !== filters.handleType) return false;
      if (filters.cabinetClass && p.cabinet_class !== filters.cabinetClass) return false;
      if (filters.emergencyShowerType && p.emergency_shower_type !== filters.emergencyShowerType) return false;
      return true;
    });
  };

  const getAvailableFilterOptions = (
    seriesId: string,
    products: Product[],
    field: keyof Product,
    currentFilters: Record<string, any>
  ) => {
    const other = { ...currentFilters };
    delete other[field === 'finish_type' ? 'finish' : 
                 field === 'orientation' ? 'orientation' :
                 field === 'number_of_drawers' ? 'drawerCount' :
                 field === 'door_type' ? 'doorType' :
                 field === 'dimensions' ? 'dimensions' :
                 field === 'mounting_type' ? 'mountingType' :
                 field === 'mixing_type' ? 'mixingType' :
                 field === 'handle_type' ? 'handleType' :
                 field === 'cabinet_class' ? 'cabinetClass' :
                 field === 'emergency_shower_type' ? 'emergencyShowerType' : ''];

    const filtered = products.filter(p => {
      if (other.finish && p.finish_type !== other.finish) return false;
      if (other.orientation && p.orientation !== other.orientation) return false;
      if (other.drawerCount && String(p.number_of_drawers || 0) !== other.drawerCount) return false;
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

  const getUniqueValues = (products: Product[], field: keyof Product): string[] => {
    const vals = products.map(p => {
      let v = p[field];
      if (field === 'number_of_drawers') v = p.number_of_drawers;
      return typeof v === 'string' || typeof v === 'number' ? String(v) : '';
    }).filter(Boolean);

    const unique = [...new Set(vals)];

    if (field === 'dimensions') {
      const vol = (s: string) => {
        const m = s.match(/(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)/i);
        if (!m) return 0;
        const [, L, W, H] = m;
        return parseFloat(L) * parseFloat(W) * parseFloat(H);
      };
      return unique.sort((a, b) => vol(a) - vol(b));
    }
    if (field === 'number_of_drawers') {
      return unique.sort((a, b) => parseInt(a) - parseInt(b));
    }
    if (field === 'door_type') {
      const order = ['Solid', 'Glass', 'Mesh', 'Open'];
      return unique.sort((a, b) => {
        const ai = order.indexOf(a), bi = order.indexOf(b);
        if (ai !== -1 && bi !== -1) return ai - bi;
        if (ai !== -1) return -1;
        if (bi !== -1) return 1;
        return a.localeCompare(b);
      });
    }
    if (field === 'finish_type') {
      const order = ['Powder Coat', 'Stainless Steel', 'Epoxy', 'Phenolic'];
      return unique.sort((a, b) => {
        const ai = order.indexOf(a), bi = order.indexOf(b);
        if (ai !== -1 && bi !== -1) return ai - bi;
        if (ai !== -1) return -1;
        if (bi !== -1) return 1;
        return a.localeCompare(b);
      });
    }
    return unique.sort();
  };

  const handleProductSelect = (product: Product) => {
    const isMobile = product.name?.toLowerCase().includes('mobile cabinet') || 
                     product.product_code?.toLowerCase().includes('mc-');
    const isModular = product.name?.toLowerCase().includes('modular cabinet') ||
                      product.product_code?.toLowerCase().includes('mcc-');
    if (isMobile || isModular) {
      setSelectedProductForVariants(product);
      setShowVariantSelector(true);
    } else {
      setSelectedProduct(product);
    }
  };

  const handleVariantSelect = (variant: any) => {
    const productWithVariant = {
      ...selectedProductForVariants!,
      id: `${selectedProductForVariants?.id}-${variant.configuration}`,
      name: variant.name,
      variant: variant.configuration,
      drawerCount: variant.drawerCount
    };
    setSelectedProduct(productWithVariant);
    setShowVariantSelector(false);
    setSelectedProductForVariants(null);
  };

  const handleDragStart = (e: React.DragEvent, product: Product) => {
    const d = extractDimensions(product);
    const canvasScale = 100; // 1m = 100px on canvas
    const scaled = {
      length: d.length * canvasScale,
      width: d.width * canvasScale,
      height: d.height * canvasScale
    };

    const payload = {
      id: product.id,
      productId: product.id,
      name: formatProductName(product.name),
      category: product.category,
      dimensions: scaled,
      realDimensions: d,
      color: getCategoryColor(product.category),
      modelPath: product.model_path || product.modelPath,
      thumbnail: product.thumbnail_path || product.thumbnail,
      description: product.description,
      specifications: product.specifications,
      productCode: product.product_code || product.id,
      series: formatSeriesName(product.category || ''),
      finish: formatFinishType(product.finish_type || ''),
      orientation: getOrientationDisplayName(product.orientation || ''),
      drawerCount: product.number_of_drawers ? formatDrawerCount(product.number_of_drawers) : '',
      doorType: product.door_type ? toTitleCase(product.door_type) : ''
    };

    e.dataTransfer.setData('application/json', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'copy';
    onProductDrag(payload);
    if (onProductUsed) onProductUsed(product.id);
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'Innosin Lab': '#10b981',
      'Broen-Lab': '#3b82f6',
      'Hamilton Laboratory Solutions': '#1d4ed8',
      'Oriental Giken Inc.': '#ef4444'
    };
    return colors[category] || '#6b7280';
  };

  const isInteractionDisabled = currentTool !== 'select';

  if (loading) {
    return (
      <div className="p-4 text-center">
        <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-spin" />
        <p className="text-sm text-muted-foreground">Loading series...</p>
      </div>
    );
  }
  if (error) {
    return <div className="p-4 text-center text-sm text-destructive">Error loading series: {error}</div>;
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
          {filteredSeries.map(series => (
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
                {/* === Filters (unchanged logic) === */}
                <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Filter Variants:</div>

                  {/* Finish */}
                  {getUniqueValues(series.products, 'finish_type').length > 1 && (
                    <div>
                      <label className="text-xs font-medium">Finish:</label>
                      <Select
                        value={seriesFilters[series.id]?.finish || 'all'}
                        onValueChange={(value) => handleFilterChange(series.id, 'finish', value)}
                      >
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Finishes</SelectItem>
                          {getAvailableFilterOptions(series.id, series.products, 'finish_type', seriesFilters[series.id] || {})
                            .map(v => <SelectItem key={v} value={v}>{formatFinishType(v)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Mounting */}
                  {getUniqueValues(series.products, 'mounting_type').length > 1 && (
                    <div>
                      <label className="text-xs font-medium">Mounting:</label>
                      <Select
                        value={seriesFilters[series.id]?.mountingType || 'all'}
                        onValueChange={(value) => handleFilterChange(series.id, 'mountingType', value)}
                      >
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Mounting Types</SelectItem>
                          {getAvailableFilterOptions(series.id, series.products, 'mounting_type', seriesFilters[series.id] || {})
                            .map(v => <SelectItem key={v} value={v}>{toTitleCase(v)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Handle */}
                  {getUniqueValues(series.products, 'handle_type').length > 1 && (
                    <div>
                      <label className="text-xs font-medium">Handle:</label>
                      <Select
                        value={seriesFilters[series.id]?.handleType || 'all'}
                        onValueChange={(value) => handleFilterChange(series.id, 'handleType', value)}
                      >
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Handle Types</SelectItem>
                          {getAvailableFilterOptions(series.id, series.products, 'handle_type', seriesFilters[series.id] || {})
                            .map(v => <SelectItem key={v} value={v}>{toTitleCase(v)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Class */}
                  {getUniqueValues(series.products, 'cabinet_class').length > 1 && (
                    <div>
                      <label className="text-xs font-medium">Class:</label>
                      <Select
                        value={seriesFilters[series.id]?.cabinetClass || 'all'}
                        onValueChange={(value) => handleFilterChange(series.id, 'cabinetClass', value)}
                      >
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Classes</SelectItem>
                          {getAvailableFilterOptions(series.id, series.products, 'cabinet_class', seriesFilters[series.id] || {})
                            .map(v => <SelectItem key={v} value={v}>{toTitleCase(v)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Emergency Shower */}
                  {getUniqueValues(series.products, 'emergency_shower_type').length > 1 && (
                    <div>
                      <label className="text-xs font-medium">Emergency Shower:</label>
                      <Select
                        value={seriesFilters[series.id]?.emergencyShowerType || 'all'}
                        onValueChange={(value) => handleFilterChange(series.id, 'emergencyShowerType', value)}
                      >
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {getAvailableFilterOptions(series.id, series.products, 'emergency_shower_type', seriesFilters[series.id] || {})
                            .map(v => <SelectItem key={v} value={v}>{toTitleCase(v)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Mixing */}
                  {getUniqueValues(series.products, 'mixing_type').length > 1 && (
                    <div>
                      <label className="text-xs font-medium">Mixing:</label>
                      <Select
                        value={seriesFilters[series.id]?.mixingType || 'all'}
                        onValueChange={(value) => handleFilterChange(series.id, 'mixingType', value)}
                      >
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Mixing Types</SelectItem>
                          {getAvailableFilterOptions(series.id, series.products, 'mixing_type', seriesFilters[series.id] || {})
                            .map(v => <SelectItem key={v} value={v}>{toTitleCase(v)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Drawers */}
                  {(getUniqueValues(series.products, 'number_of_drawers').length > 0 || 
                    series.products.some(p => p.number_of_drawers && p.number_of_drawers > 0)) && (
                    <div>
                      <label className="text-xs font-medium">Drawers:</label>
                      <Select
                        value={seriesFilters[series.id]?.drawerCount || 'all'}
                        onValueChange={(value) => handleFilterChange(series.id, 'drawerCount', value)}
                      >
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Drawer Counts</SelectItem>
                          {getAvailableFilterOptions(series.id, series.products, 'number_of_drawers', seriesFilters[series.id] || {})
                            .filter(c => c && c !== '0' && c !== 'null')
                            .map(c => <SelectItem key={c} value={c}>{formatDrawerCount(parseInt(c))}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Orientation */}
                  {getUniqueValues(series.products, 'orientation').length > 1 && (
                    <div>
                      <label className="text-xs font-medium">Orientation:</label>
                      <Select
                        value={seriesFilters[series.id]?.orientation || 'all'}
                        onValueChange={(value) => handleFilterChange(series.id, 'orientation', value)}
                      >
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Orientations</SelectItem>
                          {getAvailableFilterOptions(series.id, series.products, 'orientation', seriesFilters[series.id] || {})
                            .map(o => <SelectItem key={o} value={o}>{getOrientationDisplayName(o)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Door Type */}
                  {getUniqueValues(series.products, 'door_type').length > 1 && (
                    <div>
                      <label className="text-xs font-medium">Door Type:</label>
                      <Select
                        value={seriesFilters[series.id]?.doorType || 'all'}
                        onValueChange={(value) => handleFilterChange(series.id, 'doorType', value)}
                      >
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Door Types</SelectItem>
                          {getAvailableFilterOptions(series.id, series.products, 'door_type', seriesFilters[series.id] || {})
                            .map(v => <SelectItem key={v} value={v}>{toTitleCase(v)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Size */}
                  {getUniqueValues(series.products, 'dimensions').length > 1 && (
                    <div>
                      <label className="text-xs font-medium">Size:</label>
                      <Select
                        value={seriesFilters[series.id]?.dimensions || 'all'}
                        onValueChange={(value) => handleFilterChange(series.id, 'dimensions', value)}
                      >
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sizes</SelectItem>
                          {getUniqueValues(series.products, 'dimensions').map(size => (
                            <SelectItem key={size} value={size}>{size}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* === IMAGE-ONLY PRODUCT GRID === */}
                <div className="grid grid-cols-2 gap-3">
                  {getFilteredProducts(series.id, series.products).map(product => {
                    const thumb = product.thumbnail_path || product.thumbnail;
                    return (
                      <div
                        key={product.id}
                        draggable={!isInteractionDisabled}
                        onDragStart={(e) => handleDragStart(e, product)}
                        onClick={() => handleProductSelect(product)}
                        title={formatProductName(product.name)}
                        className={`group relative rounded-lg overflow-hidden border transition-all ${
                          selectedProduct?.id === product.id
                            ? 'border-primary ring-2 ring-primary/30'
                            : 'border-border hover:border-primary/50'
                        } ${isInteractionDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-move'}`}
                        style={{ aspectRatio: '4 / 3' }}
                      >
                        {/* image */}
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={product.name}
                            className="w-full h-full object-cover group-active:scale-[0.98] transition-transform"
                            draggable={false}
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                            No image
                          </div>
                        )}

                        {/* subtle brand/category tag (remove if you want only image) */}
                        <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded">
                          {toTitleCase(product.category || 'Product')}
                        </div>
                      </div>
                    );
                  })}

                  {getFilteredProducts(series.id, series.products).length === 0 && (
                    <div className="col-span-2 text-center py-4 text-sm text-muted-foreground">
                      No products match the selected filters
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>

      {/* Variant chooser (unchanged, but you can also make it image-only later if you want) */}
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
