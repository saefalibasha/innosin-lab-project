
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Product } from '@/types/product';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/usePerformanceOptimization';

interface VirtualizedProductListProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  selectedProductId?: string;
  itemHeight?: number;
  containerHeight?: number;
}

const VirtualizedProductList: React.FC<VirtualizedProductListProps> = ({
  products,
  onProductSelect,
  selectedProductId,
  itemHeight = 120,
  containerHeight = 600
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filter products based on search
  const filteredProducts = React.useMemo(() => {
    if (!debouncedSearchTerm) return products;
    
    return products.filter(product => 
      product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      product.product_code?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [products, debouncedSearchTerm]);

  // Calculate visible items
  const visibleStartIndex = Math.floor(scrollTop / itemHeight);
  const visibleEndIndex = Math.min(
    visibleStartIndex + Math.ceil(containerHeight / itemHeight) + 2,
    filteredProducts.length - 1
  );

  const visibleProducts = React.useMemo(() => {
    return filteredProducts.slice(visibleStartIndex, visibleEndIndex + 1);
  }, [filteredProducts, visibleStartIndex, visibleEndIndex]);

  const totalHeight = filteredProducts.length * itemHeight;
  const offsetY = visibleStartIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-input bg-background text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        />
      </div>

      {/* Results Counter */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredProducts.length} products
      </div>

      {/* Virtualized List Container */}
      <div
        ref={containerRef}
        className="border rounded-md bg-background"
        style={{ height: containerHeight, overflow: 'auto' }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleProducts.map((product, index) => {
              const actualIndex = visibleStartIndex + index;
              const isSelected = selectedProductId === product.id;
              
              return (
                <ProductListItem
                  key={`${product.id}-${actualIndex}`}
                  product={product}
                  isSelected={isSelected}
                  onSelect={() => onProductSelect(product)}
                  height={itemHeight}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Memoized product item component
const ProductListItem = React.memo<{
  product: Product;
  isSelected: boolean;
  onSelect: () => void;
  height: number;
}>(({ product, isSelected, onSelect, height }) => {
  return (
    <div
      className={`border-b p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
        isSelected ? 'bg-muted border-primary' : ''
      }`}
      style={{ height }}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3 h-full">
        {/* Product Thumbnail */}
        <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.name}
              className="w-full h-full object-cover rounded-md"
              loading="lazy"
            />
          ) : (
            <div className="text-muted-foreground text-xs text-center">
              No Image
            </div>
          )}
        </div>
        
        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{product.name}</h4>
          <p className="text-xs text-muted-foreground truncate">{product.description}</p>
          {product.product_code && (
            <p className="text-xs font-mono text-muted-foreground">{product.product_code}</p>
          )}
          {product.dimensions && (
            <p className="text-xs text-muted-foreground">{product.dimensions}</p>
          )}
        </div>
        
        {/* Selection Indicator */}
        {isSelected && (
          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
        )}
      </div>
    </div>
  );
});

ProductListItem.displayName = 'ProductListItem';

export default VirtualizedProductList;
