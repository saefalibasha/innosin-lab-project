import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { PlacedProduct } from '@/types/floorPlanTypes';
import { Product } from '@/types/product';
import { Ruler, Rotate3D, Palette, Package } from 'lucide-react';

interface ProductDimensionEditorProps {
  selectedProduct: PlacedProduct | null;
  onUpdateProduct: (product: PlacedProduct) => void;
  onDeleteProduct: () => void;
  onDuplicateProduct: () => void;
  units: 'mm' | 'cm' | 'm' | 'ft' | 'in';
}

const ProductDimensionEditor: React.FC<ProductDimensionEditorProps> = ({
  selectedProduct,
  onUpdateProduct,
  onDeleteProduct,
  onDuplicateProduct,
  units
}) => {
  const [localDimensions, setLocalDimensions] = useState({ length: 0, width: 0, height: 0 });
  const [localRotation, setLocalRotation] = useState(0);
  const [localScale, setLocalScale] = useState(1);
  const [selectedFinish, setSelectedFinish] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<string>('');

  // Unit conversion factors to meters
  const unitFactors = {
    mm: 0.001,
    cm: 0.01,
    m: 1,
    ft: 0.3048,
    in: 0.0254
  };

  const convertFromMeters = (value: number): number => {
    return value / unitFactors[units];
  };

  const convertToMeters = (value: number): number => {
    return value * unitFactors[units];
  };

  // Update local state when selected product changes
  useEffect(() => {
    if (selectedProduct) {
      setLocalDimensions({
        length: convertFromMeters(selectedProduct.dimensions.length),
        width: convertFromMeters(selectedProduct.dimensions.width),
        height: convertFromMeters(selectedProduct.dimensions.height)
      });
      setLocalRotation(selectedProduct.rotation);
      setLocalScale(selectedProduct.scale || 1);
      
      // Set default finish and variant if available
      if (selectedProduct.finishes && selectedProduct.finishes.length > 0) {
        setSelectedFinish(selectedProduct.finishes[0].type);
      }
      if (selectedProduct.variants && selectedProduct.variants.length > 0) {
        setSelectedVariant(selectedProduct.variants[0].id);
      }
    }
  }, [selectedProduct, units]);

  const handleDimensionChange = (dimension: 'length' | 'width' | 'height', value: string) => {
    const numValue = parseFloat(value) || 0;
    const newDimensions = { ...localDimensions, [dimension]: numValue };
    setLocalDimensions(newDimensions);

    if (selectedProduct) {
      const updatedProduct = {
        ...selectedProduct,
        dimensions: {
          length: convertToMeters(newDimensions.length),
          width: convertToMeters(newDimensions.width),
          height: convertToMeters(newDimensions.height)
        }
      };
      onUpdateProduct(updatedProduct);
    }
  };

  const handleRotationChange = (value: string) => {
    const rotation = parseFloat(value) || 0;
    setLocalRotation(rotation);
    
    if (selectedProduct) {
      const updatedProduct = { ...selectedProduct, rotation };
      onUpdateProduct(updatedProduct);
    }
  };

  const handleScaleChange = (value: string) => {
    const scale = parseFloat(value) || 1;
    setLocalScale(scale);
    
    if (selectedProduct) {
      const updatedProduct = { ...selectedProduct, scale };
      onUpdateProduct(updatedProduct);
    }
  };

  const handleFinishChange = (finishType: string) => {
    setSelectedFinish(finishType);
    
    if (selectedProduct && selectedProduct.finishes) {
      const finish = selectedProduct.finishes.find(f => f.type === finishType);
      if (finish) {
        const updatedProduct = {
          ...selectedProduct,
          modelPath: finish.modelPath || selectedProduct.modelPath,
          thumbnail: finish.thumbnail || selectedProduct.thumbnail
        };
        onUpdateProduct(updatedProduct);
      }
    }
  };

  const handleVariantChange = (variantId: string) => {
    setSelectedVariant(variantId);
    
    if (selectedProduct && selectedProduct.variants) {
      const variant = selectedProduct.variants.find(v => v.id === variantId);
      if (variant) {
        const updatedProduct = {
          ...selectedProduct,
          modelPath: variant.modelPath,
          thumbnail: variant.thumbnail,
          name: `${selectedProduct.name} - ${variant.size}`
        };
        onUpdateProduct(updatedProduct);
      }
    }
  };

  const quickRotations = [0, 45, 90, 135, 180, 225, 270, 315];

  if (!selectedProduct) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 text-center">
          <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Select a product to edit dimensions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Ruler className="w-4 h-4" />
          Product Editor
        </CardTitle>
        <div className="text-xs text-muted-foreground">
          {selectedProduct.name}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Dimensions */}
        <div className="space-y-3">
          <Label className="text-xs font-medium">Dimensions ({units})</Label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Length</Label>
              <Input
                type="number"
                value={localDimensions.length.toFixed(2)}
                onChange={(e) => handleDimensionChange('length', e.target.value)}
                className="h-8 text-xs"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Width</Label>
              <Input
                type="number"
                value={localDimensions.width.toFixed(2)}
                onChange={(e) => handleDimensionChange('width', e.target.value)}
                className="h-8 text-xs"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Height</Label>
              <Input
                type="number"
                value={localDimensions.height.toFixed(2)}
                onChange={(e) => handleDimensionChange('height', e.target.value)}
                className="h-8 text-xs"
                step="0.01"
                min="0"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Rotation */}
        <div className="space-y-2">
          <Label className="text-xs font-medium flex items-center gap-1">
            <Rotate3D className="w-3 h-3" />
            Rotation
          </Label>
          <div className="space-y-2">
            <Input
              type="number"
              value={localRotation}
              onChange={(e) => handleRotationChange(e.target.value)}
              className="h-8 text-xs"
              placeholder="Degrees"
              step="1"
              min="0"
              max="360"
            />
            <div className="grid grid-cols-4 gap-1">
              {quickRotations.map(angle => (
                <Button
                  key={angle}
                  variant={localRotation === angle ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRotationChange(angle.toString())}
                  className="h-6 text-xs"
                >
                  {angle}°
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Scale */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Scale</Label>
          <Input
            type="number"
            value={localScale}
            onChange={(e) => handleScaleChange(e.target.value)}
            className="h-8 text-xs"
            step="0.1"
            min="0.1"
            max="5"
          />
          <div className="flex gap-1">
            {[0.5, 1, 1.5, 2].map(scale => (
              <Button
                key={scale}
                variant={localScale === scale ? "default" : "outline"}
                size="sm"
                onClick={() => handleScaleChange(scale.toString())}
                className="h-6 text-xs flex-1"
              >
                {scale}×
              </Button>
            ))}
          </div>
        </div>

        {/* Finishes */}
        {selectedProduct.finishes && selectedProduct.finishes.length > 1 && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-1">
                <Palette className="w-3 h-3" />
                Finish
              </Label>
              <Select value={selectedFinish} onValueChange={handleFinishChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select finish" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProduct.finishes.map(finish => (
                    <SelectItem key={finish.type} value={finish.type} className="text-xs">
                      {finish.name}
                      {finish.price && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {finish.price}
                        </Badge>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Variants */}
        {selectedProduct.variants && selectedProduct.variants.length > 1 && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-xs font-medium">Size Variant</Label>
              <Select value={selectedVariant} onValueChange={handleVariantChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProduct.variants.map(variant => (
                    <SelectItem key={variant.id} value={variant.id} className="text-xs">
                      {variant.size}
                      <span className="text-muted-foreground ml-2">
                        {variant.dimensions}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <Separator />

        {/* Actions */}
        <div className="space-y-2">
          <Button
            onClick={onDuplicateProduct}
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs"
          >
            Duplicate Product
          </Button>
          <Button
            onClick={onDeleteProduct}
            variant="destructive"
            size="sm"
            className="w-full h-8 text-xs"
          >
            Delete Product
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductDimensionEditor;