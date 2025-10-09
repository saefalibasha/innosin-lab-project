import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Package, RotateCw, Trash2, Eye, EyeOff } from 'lucide-react';
import { PlacedProduct } from '@/types/floorPlanTypes';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PlacedProductsBarProps {
  placedProducts: PlacedProduct[];
  selectedProducts: string[];
  onProductSelect: (productId: string, multiSelect?: boolean) => void;
  onDeleteSelected: () => void;
  onRotateSelected: () => void;
  onClearSelection: () => void;
}

export const PlacedProductsBar: React.FC<PlacedProductsBarProps> = ({
  placedProducts,
  selectedProducts,
  onProductSelect,
  onDeleteSelected,
  onRotateSelected,
  onClearSelection
}) => {
  const selectedCount = selectedProducts.length;
  const totalProducts = placedProducts.length;

  const handleProductClick = (product: PlacedProduct, multiSelect: boolean) => {
    onProductSelect(product.id, multiSelect);
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

        {placedProducts.length > 0 ? (
          <TooltipProvider>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-2 pb-2">
                {placedProducts.map((product) => {
                  const isSelected = selectedProducts.includes(product.id);
                  
                  return (
                    <Card
                      key={product.id}
                      className={`cursor-pointer transition-all duration-200 min-w-0 flex-shrink-0 ${
                        isSelected 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:border-muted-foreground/50'
                      }`}
                      onClick={(e) => handleProductClick(product, e.shiftKey || e.ctrlKey || e.metaKey)}
                    >
                      <CardContent className="p-3 w-56">
                        <div className="flex items-start gap-3">
                          {/* Product Image */}
                          <div className="w-12 h-12 flex-shrink-0 bg-white rounded border flex items-center justify-center overflow-hidden">
                            {product.thumbnail ? (
                              <img
                                src={product.thumbnail}
                                alt={product.name}
                                className="max-w-full max-h-full object-contain"
                              />
                            ) : (
                              <Package className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="min-w-0 flex-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="font-medium text-xs text-foreground truncate">
                                  {product.name}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>{product.name}</TooltipContent>
                            </Tooltip>
                            
                            <div className="text-xs text-muted-foreground mt-0.5 truncate">
                              {product.originalDimensions ? 
                                `${Math.round(product.originalDimensions.length)}×${Math.round(product.originalDimensions.width)}×${Math.round(product.originalDimensions.height)}mm` :
                                `${Math.round(product.dimensions.length)}×${Math.round(product.dimensions.width)}×${Math.round(product.dimensions.height)}mm`
                              }
                            </div>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-xs text-muted-foreground/80 mt-0.5 truncate">
                                  {product.category}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>{product.category}</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-xs text-muted-foreground/60 font-mono mt-0.5 truncate">
                                  {product.productId}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>{product.productId}</TooltipContent>
                            </Tooltip>
                          </div>

                          {/* Selection indicator */}
                          {isSelected && (
                            <Eye className="h-3 w-3 text-primary flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </TooltipProvider>
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
