
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, Trash2, Eye, Package } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  product_code: string;
  category: string;
  dimensions?: string;
  description?: string;
  full_description?: string;
  product_series?: string;
  finish_type?: string;
  orientation?: string;
  door_type?: string;
  drawer_count?: number;
  specifications?: any;
  keywords?: string[];
  company_tags?: string[];
  thumbnail_path?: string;
  model_path?: string;
  additional_images?: string[];
  overview_image_path?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductViewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onToggleStatus: (productId: string, currentStatus: boolean) => void;
}

const ProductViewDialog: React.FC<ProductViewDialogProps> = ({
  isOpen,
  onOpenChange,
  product,
  onEdit,
  onDelete,
  onToggleStatus
}) => {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {product.name}
            </DialogTitle>
            <Badge variant={product.is_active ? "default" : "secondary"}>
              {product.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Product Code</h3>
              <p className="text-lg">{product.product_code}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Category</h3>
              <p className="text-lg">{product.category}</p>
            </div>
            {product.product_series && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Product Series</h3>
                <p className="text-lg">{product.product_series}</p>
              </div>
            )}
            {product.dimensions && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Dimensions</h3>
                <p className="text-lg">{product.dimensions}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Technical Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {product.finish_type && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Finish Type</h3>
                <p>{product.finish_type}</p>
              </div>
            )}
            {product.orientation && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Orientation</h3>
                <p>{product.orientation}</p>
              </div>
            )}
            {product.door_type && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Door Type</h3>
                <p>{product.door_type}</p>
              </div>
            )}
          </div>

          {product.drawer_count > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Drawer Count</h3>
              <p>{product.drawer_count}</p>
            </div>
          )}

          <Separator />

          {/* Description */}
          {product.description && (
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">Description</h3>
              <p className="text-sm leading-relaxed">{product.description}</p>
            </div>
          )}

          {product.full_description && (
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">Full Description</h3>
              <p className="text-sm leading-relaxed">{product.full_description}</p>
            </div>
          )}

          {/* Keywords */}
          {product.keywords && product.keywords.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {product.keywords.map((keyword, index) => (
                  <Badge key={index} variant="outline">{keyword}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Company Tags */}
          {product.company_tags && product.company_tags.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">Company Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.company_tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Asset Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Thumbnail</h3>
              <p className="text-sm">{product.thumbnail_path ? 'Available' : 'Not set'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">3D Model</h3>
              <p className="text-sm">{product.model_path ? 'Available' : 'Not set'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Additional Images</h3>
              <p className="text-sm">{product.additional_images?.length || 0} images</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <div className="flex gap-2">
              <Button onClick={() => onEdit(product)} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                onClick={() => onToggleStatus(product.id, product.is_active)}
                variant={product.is_active ? "outline" : "default"}
              >
                {product.is_active ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
            <Button onClick={() => onDelete(product.id)} variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductViewDialog;
