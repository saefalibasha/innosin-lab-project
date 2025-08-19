import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Package, RotateCw, Trash2, Eye, EyeOff } from 'lucide-react';
import { PlacedProduct } from '@/types/floorPlanTypes';

interface PlacedProductsBarProps {
  placedProducts: PlacedProduct[];
  selectedProducts: string[];
  onProductSelect: (productId: string, multiSelect?: boolean) => void;
  onDeleteSelected: () => void;
  onRotateSelected: () => void;
  onClearSelection: () => void;
}

interface ProductGroup {
  productId: string;
  name: string;
  category: string;
  count: number;
  instances: PlacedProduct[];
  color: string;
  dimensions: string;
}

export const PlacedProductsBar: React.FC<PlacedProductsBarProps> = ({
  placedProducts,
  selectedProducts,
  onProductSelect,
  onDeleteSelected,
  onRotateSelected,
  onClearSelection
}) => {
  // Group products by type
  const productGroups = React.useMemo(() => {
    const groupMap = new Map<string, ProductGroup>();
    
    placedProducts.forEach(product => {
      const key = `${product.productId}-${product.dimensions.length}-${product.dimensions.width}`;
      
      if (groupMap.has(key)) {
        const group = groupMap.get(key)!;
        group.count += 1;
        group.instances.push(product);
      } else {
        groupMap.set(key, {
          productId: product.productId,
          name: product.name,
          category: product.category || 'Other',
          count: 1,
          instances: [product],
          color: product.color || '#6b7280',
          dimensions: `${Math.round(product.dimensions.length)}×${Math.round(product.dimensions.width)}mm`
        });
      }
    });
    
    return Array.from(groupMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [placedProducts]);

  const selectedCount = selectedProducts.length;
  const totalProducts = placedProducts.length;

  const handleProductGroupClick = (group: ProductGroup, multiSelect: boolean) => {
    if (multiSelect) {
      // Toggle all instances in this group
      const allSelected = group.instances.every(p => selectedProducts.includes(p.id));
      if (allSelected) {
        // Deselect all in group
        group.instances.forEach(p => onProductSelect(p.id, true));
      } else {
        // Select all in group
        group.instances.forEach(p => {
          if (!selectedProducts.includes(p.id)) {
            onProductSelect(p.id, true);
          }
        });
      }
    } else {
      // Select all instances in this group only
      onClearSelection();
      group.instances.forEach(p => onProductSelect(p.id, true));
    }
  };

  const getGroupSelectionState = (group: ProductGroup) => {
    const selectedInGroup = group.instances.filter(p => selectedProducts.includes(p.id)).length;
    if (selectedInGroup === 0) return 'none';
    if (selectedInGroup === group.instances.length) return 'all';
    return 'partial';
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Placed Products</span>
              <Badge variant="secondary" className="text-xs">
                {totalProducts}
              </Badge>
            </div>
            
            {selectedCount > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">
                  {selectedCount} selected
                </Badge>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRotateSelected}
                    className="h-6 px-2"
                  >
                    <RotateCw className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onDeleteSelected}
                    className="h-6 px-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearSelection}
                    className="h-6 px-2"
                  >
                    <EyeOff className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {productGroups.length > 0 ? (
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              {productGroups.map((group) => {
                const selectionState = getGroupSelectionState(group);
                const isSelected = selectionState !== 'none';
                const isPartiallySelected = selectionState === 'partial';
                
                return (
                  <Card
                    key={`${group.productId}-${group.dimensions}`}
                    className={`cursor-pointer transition-all duration-200 min-w-0 flex-shrink-0 ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-muted-foreground/50'
                    } ${
                      isPartiallySelected 
                        ? 'border-primary/60 bg-primary/3' 
                        : ''
                    }`}
                    onClick={(e) => handleProductGroupClick(group, e.shiftKey || e.ctrlKey || e.metaKey)}
                  >
                    <CardContent className="p-3 w-40">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: group.color }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-xs truncate">
                              {group.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {group.dimensions}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 ml-2">
                          <Badge
                            variant={isSelected ? 'default' : 'secondary'}
                            className="text-xs h-4"
                          >
                            {group.count}
                          </Badge>
                          {isSelected && (
                            <Eye className="h-3 w-3 text-primary" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No products placed yet</p>
            <p className="text-xs">Drag products from the sidebar to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlacedProductsBar;