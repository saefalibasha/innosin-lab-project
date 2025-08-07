
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Product as ProductType } from '@/types/product';

interface ProductViewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductType | null;
  onEdit: (product: ProductType) => void;
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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{product.name}</span>
            <Badge variant={product.is_active ? "default" : "secondary"}>
              {product.is_active ? "Active" : "Inactive"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Product Code</h4>
              <p>{product.product_code || 'N/A'}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Category</h4>
              <p>{product.category}</p>
            </div>
          </div>

          {product.dimensions && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Dimensions</h4>
              <p>{product.dimensions}</p>
            </div>
          )}

          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Description</h4>
            <p className="text-sm">{product.description || 'No description available'}</p>
          </div>

          {product.fullDescription && product.fullDescription !== product.description && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Full Description</h4>
              <p className="text-sm">{product.fullDescription}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {product.finish_type && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Finish Type</h4>
                <p className="capitalize">{product.finish_type.replace('-', ' ')}</p>
              </div>
            )}
            {product.orientation && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Orientation</h4>
                <p>{product.orientation}</p>
              </div>
            )}
          </div>

          {product.company_tags && product.company_tags.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {product.company_tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(product)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleStatus(product.id, product.is_active || false)}
              >
                {product.is_active ? (
                  <><EyeOff className="h-4 w-4 mr-1" />Deactivate</>
                ) : (
                  <><Eye className="h-4 w-4 mr-1" />Activate</>
                )}
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(product.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductViewDialog;
