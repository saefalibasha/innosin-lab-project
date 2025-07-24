
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PlacedProduct } from '@/types/floorPlanTypes';

interface Product {
  id: string;
  name: string;
  category: string;
  type: string;
  size: string;
  price: number;
  dimensions: string;
  modelPath?: string;
  thumbnail?: string;
}

interface ProductDimensionEditorProps {
  selectedProduct: PlacedProduct | null;
  onUpdateProduct: (product: PlacedProduct) => void;
  onDeleteProduct: () => void;
  availableProducts: Product[];
  onProductSelect: (product: Product) => void;
}

const ProductDimensionEditor: React.FC<ProductDimensionEditorProps> = ({
  selectedProduct,
  onUpdateProduct,
  onDeleteProduct,
  availableProducts,
  onProductSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = Array.from(new Set(availableProducts.map(p => p.category)));

  const filteredProducts = availableProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDimensionChange = useCallback((field: 'length' | 'width' | 'height', value: string) => {
    if (!selectedProduct) return;
    
    const numValue = parseInt(value) || 0;
    onUpdateProduct({
      ...selectedProduct,
      dimensions: {
        ...selectedProduct.dimensions,
        [field]: numValue
      }
    });
  }, [selectedProduct, onUpdateProduct]);

  const handlePositionChange = useCallback((field: 'x' | 'y', value: string) => {
    if (!selectedProduct) return;
    
    const numValue = parseInt(value) || 0;
    onUpdateProduct({
      ...selectedProduct,
      position: {
        ...selectedProduct.position,
        [field]: numValue
      }
    });
  }, [selectedProduct, onUpdateProduct]);

  const handleProductClick = useCallback((product: Product) => {
    onProductSelect(product);
  }, [onProductSelect]);

  return (
    <div className="space-y-4">
      {/* Product Library */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Product Library</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory('all')}
              >
                All
              </Badge>
              {categories.map(category => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleProductClick(product)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{product.name}</h4>
                    <p className="text-xs text-gray-500">{product.category} • {product.size}</p>
                    <p className="text-xs text-gray-400">{product.dimensions}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">${product.price?.toFixed(2) || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Product Editor */}
      {selectedProduct && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Edit Product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">{selectedProduct.name}</Label>
              <p className="text-xs text-gray-500">{selectedProduct.category}</p>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-medium">Dimensions (mm)</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Length</Label>
                  <Input
                    type="number"
                    value={selectedProduct.dimensions.length}
                    onChange={(e) => handleDimensionChange('length', e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Width</Label>
                  <Input
                    type="number"
                    value={selectedProduct.dimensions.width}
                    onChange={(e) => handleDimensionChange('width', e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Height</Label>
                  <Input
                    type="number"
                    value={selectedProduct.dimensions.height}
                    onChange={(e) => handleDimensionChange('height', e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Position</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">X</Label>
                  <Input
                    type="number"
                    value={Math.round(selectedProduct.position.x)}
                    onChange={(e) => handlePositionChange('x', e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Y</Label>
                  <Input
                    type="number"
                    value={Math.round(selectedProduct.position.y)}
                    onChange={(e) => handlePositionChange('y', e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Rotation</Label>
              <Input
                type="number"
                value={Math.round(selectedProduct.rotation * 180 / Math.PI)}
                onChange={(e) => {
                  const degrees = parseInt(e.target.value) || 0;
                  onUpdateProduct({
                    ...selectedProduct,
                    rotation: degrees * Math.PI / 180
                  });
                }}
                placeholder="Degrees"
                className="text-xs"
              />
            </div>

            <Separator />

            <Button 
              variant="destructive" 
              size="sm" 
              onClick={onDeleteProduct}
              className="w-full"
            >
              Delete Product
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductDimensionEditor;
