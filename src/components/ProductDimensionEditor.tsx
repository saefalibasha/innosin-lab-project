
import React, { useState } from 'react';
import { PlacedProduct } from '@/types/floorPlanTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProductDimensionEditorProps {
  product: PlacedProduct;
  onUpdateProduct: (product: PlacedProduct) => void;
  onClose: () => void;
}

interface ProductVariant {
  id: string;
  name: string;
  size: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  price?: number;
  modelPath?: string;
  thumbnail?: string;
}

interface ProductInfo {
  id: string;
  name: string;
  category: string;
  type: string;
  price?: number;
  variants: ProductVariant[];
}

const ProductDimensionEditor: React.FC<ProductDimensionEditorProps> = ({
  product,
  onUpdateProduct,
  onClose
}) => {
  const [editedProduct, setEditedProduct] = useState<PlacedProduct>(product);
  
  // Mock product data - in a real app, this would come from an API
  const productInfo: ProductInfo = {
    id: product.productId,
    name: product.name,
    category: product.category,
    type: 'laboratory-cabinet',
    price: 1200,
    variants: [
      {
        id: '755065',
        name: 'Standard Cabinet',
        size: '750×500×650',
        dimensions: { length: 750, width: 500, height: 650 },
        price: 1200
      },
      {
        id: '755080',
        name: 'Tall Cabinet',
        size: '750×500×800',
        dimensions: { length: 750, width: 500, height: 800 },
        price: 1400
      }
    ]
  };

  const handleDimensionChange = (dimension: 'length' | 'width' | 'height', value: number) => {
    setEditedProduct(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimension]: value
      }
    }));
  };

  const handleVariantSelect = (variant: ProductVariant) => {
    setEditedProduct(prev => ({
      ...prev,
      dimensions: variant.dimensions,
      name: variant.name
    }));
  };

  const handleSave = () => {
    onUpdateProduct(editedProduct);
    onClose();
  };

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Edit Product</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="dimensions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
            <TabsTrigger value="variants">Variants</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dimensions" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="length">Length (mm)</Label>
              <Input
                id="length"
                type="number"
                value={editedProduct.dimensions.length}
                onChange={(e) => handleDimensionChange('length', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="width">Width (mm)</Label>
              <Input
                id="width"
                type="number"
                value={editedProduct.dimensions.width}
                onChange={(e) => handleDimensionChange('width', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="height">Height (mm)</Label>
              <Input
                id="height"
                type="number"
                value={editedProduct.dimensions.height}
                onChange={(e) => handleDimensionChange('height', parseInt(e.target.value))}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="variants" className="space-y-4">
            <div className="space-y-2">
              <Label>Available Variants</Label>
              {productInfo.variants.map((variant) => (
                <Button
                  key={variant.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleVariantSelect(variant)}
                >
                  <div className="text-left">
                    <div className="font-medium">{variant.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {variant.size}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex gap-2 mt-4">
          <Button onClick={handleSave} className="flex-1">Save</Button>
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductDimensionEditor;
