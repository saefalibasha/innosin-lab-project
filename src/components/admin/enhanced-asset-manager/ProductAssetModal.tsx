
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Package2, 
  Image, 
  Box, 
  FileText, 
  Upload, 
  Eye, 
  Edit3, 
  Save, 
  X,
  Ruler,
  Settings,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Product {
  id: string;
  product_code: string;
  name: string;
  product_series: string;
  finish_type: string;
  orientation: string;
  door_type: string;
  drawer_count: number;
  dimensions: string;
  editable_title: string;
  editable_description: string;
}

interface ProductAssetModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductAssetModal: React.FC<ProductAssetModalProps> = ({
  product,
  onClose
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState(product);
  const [isSaving, setSaving] = useState(false);

  // Check for existing assets
  const productFolder = `innosin-${product.product_code.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const expectedAssets = {
    model: `${productFolder}/${product.product_code}.glb`,
    image: `${productFolder}/${product.product_code}.jpg`,
    description: `${productFolder}/${product.product_code}.txt`
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          editable_title: editedProduct.editable_title,
          editable_description: editedProduct.editable_description
        })
        .eq('id', product.id);

      if (error) throw error;

      toast.success('Product updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const getOrientationDisplay = (orientation: string) => {
    if (!orientation || orientation === 'None') return 'Standard';
    return orientation;
  };

  const getConfigurationDisplay = () => {
    const parts = [];
    
    if (product.door_type && product.door_type !== 'None') {
      parts.push(product.door_type);
    }
    
    if (product.drawer_count > 0) {
      parts.push(`${product.drawer_count} Drawers`);
    }

    const orientation = getOrientationDisplay(product.orientation);
    if (orientation !== 'Standard') {
      parts.push(orientation);
    }

    return parts.join(' • ') || 'Standard Configuration';
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Package2 className="h-5 w-5 text-primary" />
              {product.product_code} - Asset Management
            </DialogTitle>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Information */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Product Code</Label>
                    <p className="font-medium">{product.product_code}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Series</Label>
                    <p className="font-medium">{product.product_series}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Finish</Label>
                    <Badge variant={product.finish_type === 'SS' ? 'default' : 'secondary'}>
                      {product.finish_type}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Orientation</Label>
                    <p className="font-medium">{getOrientationDisplay(product.orientation)}</p>
                  </div>
                </div>

                <Separator />

                {/* Configuration */}
                <div>
                  <Label className="text-muted-foreground">Configuration</Label>
                  <p className="font-medium">{getConfigurationDisplay()}</p>
                </div>

                {/* Dimensions */}
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-muted-foreground">Dimensions</Label>
                    <p className="font-medium">{product.dimensions}</p>
                  </div>
                </div>

                <Separator />

                {/* Editable Fields */}
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="title">Display Title</Label>
                    {isEditing ? (
                      <Input
                        id="title"
                        value={editedProduct.editable_title}
                        onChange={(e) => setEditedProduct({
                          ...editedProduct,
                          editable_title: e.target.value
                        })}
                      />
                    ) : (
                      <p className="font-medium">{product.editable_title || product.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    {isEditing ? (
                      <Textarea
                        id="description"
                        value={editedProduct.editable_description}
                        onChange={(e) => setEditedProduct({
                          ...editedProduct,
                          editable_description: e.target.value
                        })}
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {product.editable_description || 'No description available'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Asset Management */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Box className="h-5 w-5" />
                  Asset Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 3D Model */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Box className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">3D Model (.glb)</p>
                      <p className="text-xs text-muted-foreground">{expectedAssets.model}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <Button size="sm" variant="outline">
                      <Upload className="h-4 w-4 mr-1" />
                      Upload
                    </Button>
                  </div>
                </div>

                {/* Product Image */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Image className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Product Image (.jpg)</p>
                      <p className="text-xs text-muted-foreground">{expectedAssets.image}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <Button size="sm" variant="outline">
                      <Upload className="h-4 w-4 mr-1" />
                      Upload
                    </Button>
                  </div>
                </div>

                {/* Description File */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Description (.txt)</p>
                      <p className="text-xs text-muted-foreground">{expectedAssets.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <Button size="sm" variant="outline">
                      <Upload className="h-4 w-4 mr-1" />
                      Upload
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Asset Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Upload className="h-4 w-4 mr-1" />
                    Bulk Upload
                  </Button>
                </div>

                {/* Asset Completion Status */}
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Asset Completion</span>
                    <span className="text-sm text-muted-foreground">0/3</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Upload 3D model, product image, and description to complete this product
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
