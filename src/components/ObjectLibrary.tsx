
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import LazyProductImage from '@/components/LazyProductImage';
import { products } from '@/data/products';
import { Product } from '@/types/product';

type DrawingTool = 'wall' | 'line' | 'freehand' | 'pan' | 'eraser' | 'select' | 'interior-wall' | 'door' | 'rotate';

interface ObjectLibraryProps {
  onProductDrag: (product: any) => void;
  currentTool: DrawingTool;
}

// Helper function to parse dimensions from product names and specifications
const extractDimensions = (product: Product) => {
  // Try to extract dimensions from specifications first
  const dimensionSpec = product.specifications.find(spec => 
    spec.toLowerCase().includes('dimensions') || 
    spec.toLowerCase().includes('size') ||
    spec.toLowerCase().includes('width') ||
    spec.toLowerCase().includes('length') ||
    spec.toLowerCase().includes('height')
  );

  if (dimensionSpec) {
    // Extract numbers followed by units (mm, cm, m)
    const dimensionMatch = dimensionSpec.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*(?:x\s*(\d+(?:\.\d+)?))?\s*(mm|cm|m)?/i);
    if (dimensionMatch) {
      const [, length, width, height = '0.85', unit = 'm'] = dimensionMatch;
      const factor = unit === 'mm' ? 0.001 : unit === 'cm' ? 0.01 : 1;
      return {
        length: parseFloat(length) * factor,
        width: parseFloat(width) * factor,
        height: parseFloat(height) * factor
      };
    }
  }

  // Fallback: extract from product dimensions string
  if (product.dimensions) {
    const dimensionMatch = product.dimensions.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*(?:x\s*(\d+(?:\.\d+)?))?\s*(mm|cm|m)?/i);
    if (dimensionMatch) {
      const [, length, width, height = '0.85', unit = 'm'] = dimensionMatch;
      const factor = unit === 'mm' ? 0.001 : unit === 'cm' ? 0.01 : 1;
      return {
        length: parseFloat(length) * factor,
        width: parseFloat(width) * factor,
        height: parseFloat(height) * factor
      };
    }
  }

  // Default dimensions based on category
  const categoryDefaults: Record<string, any> = {
    'Broen-Lab': { length: 1.2, width: 0.6, height: 0.85 },
    'Hamilton Laboratory Solutions': { length: 3.0, width: 0.75, height: 0.85 },
    'Oriental Giken Inc.': { length: 1.5, width: 0.75, height: 2.4 },
    'Innosin Lab': { length: 1.0, width: 0.5, height: 1.8 }
  };

  return categoryDefaults[product.category] || { length: 1.0, width: 0.6, height: 0.85 };
};

// Helper function to get category color
const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'Broen-Lab': '#3b82f6',
    'Hamilton Laboratory Solutions': '#1d4ed8',
    'Oriental Giken Inc.': '#ef4444',
    'Innosin Lab': '#10b981'
  };
  return colors[category] || '#6b7280';
};

const ObjectLibrary: React.FC<ObjectLibraryProps> = ({ onProductDrag, currentTool }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Group products by category
  const categorizedProducts = useMemo(() => {
    const categories: Record<string, Product[]> = {};
    
    products.forEach(product => {
      if (!categories[product.category]) {
        categories[product.category] = [];
      }
      categories[product.category].push(product);
    });

    return categories;
  }, []);

  // Filter products based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categorizedProducts;

    const filtered: Record<string, Product[]> = {};
    Object.entries(categorizedProducts).forEach(([category, products]) => {
      const matchingProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.specifications.some(spec => 
          spec.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      if (matchingProducts.length > 0) {
        filtered[category] = matchingProducts;
      }
    });

    return filtered;
  }, [categorizedProducts, searchTerm]);

  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleDragStart = (e: React.DragEvent, product: Product) => {
    console.log('Drag start for product:', product.name);
    
    const dimensions = extractDimensions(product);
    const floorPlanProduct = {
      id: product.id,
      productId: product.id,
      name: product.name,
      category: product.category,
      dimensions,
      color: getCategoryColor(product.category),
      modelPath: product.modelPath,
      thumbnail: product.thumbnail,
      description: product.description,
      specifications: product.specifications,
      finishes: product.finishes,
      variants: product.variants
    };

    // Set data in multiple formats for better compatibility
    const productJSON = JSON.stringify(floorPlanProduct);
    e.dataTransfer.setData('application/json', productJSON);
    e.dataTransfer.setData('product', productJSON);
    e.dataTransfer.setData('text/plain', productJSON);
    
    console.log('Setting drag data:', productJSON);
    
    // Call the onProductDrag prop if provided
    if (onProductDrag) {
      onProductDrag(floorPlanProduct);
    }
  };

  const isInteractionDisabled = currentTool !== 'select';

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Product Library</CardTitle>
        <div className="text-xs text-muted-foreground mb-3">
          {Object.keys(filteredCategories).length} categories • {Object.values(filteredCategories).flat().length} products
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 h-8 text-xs"
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {isInteractionDisabled && (
          <div className="mx-3 mb-3 p-2 bg-warning/10 border border-warning/20 rounded text-xs text-warning-foreground">
            Switch to Select tool to place products
          </div>
        )}
        
        <ScrollArea className="h-80">
          <div className="space-y-2 p-3">
            {Object.entries(filteredCategories).map(([categoryName, categoryProducts]) => {
              const isCollapsed = collapsedCategories[categoryName];
              
              return (
                <Collapsible
                  key={categoryName}
                  open={!isCollapsed}
                  onOpenChange={() => toggleCategory(categoryName)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-2 h-auto"
                    >
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: getCategoryColor(categoryName) }}
                        />
                        <span className="font-medium text-xs">{categoryName}</span>
                        <Badge variant="outline" className="text-xs h-4">
                          {categoryProducts.length}
                        </Badge>
                      </div>
                      {isCollapsed ? (
                        <ChevronRight className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="space-y-1 mt-1">
                    {categoryProducts.map(product => {
                      const dimensions = extractDimensions(product);
                      
                      return (
                        <div
                          key={product.id}
                          draggable={!isInteractionDisabled}
                          onDragStart={(e) => handleDragStart(e, product)}
                          className={`border border-border rounded-lg p-2 transition-all duration-200 ${
                            isInteractionDisabled 
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'cursor-move hover:bg-accent hover:border-accent-foreground/20 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            <LazyProductImage
                              src={product.thumbnail}
                              alt={product.name}
                              className="w-12 h-12 rounded object-cover flex-shrink-0"
                              fallback="/placeholder.svg"
                            />
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-xs truncate">{product.name}</h4>
                                <div 
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: getCategoryColor(product.category) }}
                                />
                              </div>
                              
                              <p className="text-xs text-muted-foreground mb-1 truncate">
                                {product.description}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  {dimensions.length.toFixed(1)} × {dimensions.width.toFixed(1)}m
                                </span>
                                
                                {product.variants && product.variants.length > 1 && (
                                  <Badge variant="secondary" className="text-xs h-4">
                                    {product.variants.length} sizes
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
            
            {Object.keys(filteredCategories).length === 0 && (
              <div className="text-center py-8">
                <p className="text-xs text-muted-foreground">No products found</p>
                <p className="text-xs text-muted-foreground">Try adjusting your search</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ObjectLibrary;
