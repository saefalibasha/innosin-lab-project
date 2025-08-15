
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Eye, Package, Settings } from 'lucide-react';

interface ProductSeries {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail_path: string;
  is_active: boolean;
  variant_count: number;
  completion_percentage: number;
}

interface ProductSeriesViewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  series: ProductSeries | null;
  onEdit: (series: ProductSeries) => void;
  onManageVariants: (series: ProductSeries) => void;
}

export const ProductSeriesViewDialog: React.FC<ProductSeriesViewDialogProps> = ({
  isOpen,
  onOpenChange,
  series,
  onEdit,
  onManageVariants
}) => {
  if (!series) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {series.name}
            </div>
            <Badge variant={series.is_active ? "default" : "secondary"}>
              {series.is_active ? "Active" : "Inactive"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Series Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Series Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Category</h4>
                  <p>{series.category}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Status</h4>
                  <Badge variant={series.is_active ? "default" : "secondary"}>
                    {series.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              
              {series.description && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Description</h4>
                  <p className="text-sm">{series.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Variant Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Variant Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{series.variant_count}</div>
                  <div className="text-sm text-muted-foreground">Total Variants</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{series.completion_percentage}%</div>
                  <div className="text-sm text-muted-foreground">Completion</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {series.thumbnail_path ? '✓' : '✗'}
                  </div>
                  <div className="text-sm text-muted-foreground">Has Thumbnail</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onEdit(series)}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Series
            </Button>
            <Button
              onClick={() => onManageVariants(series)}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Manage Variants
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
