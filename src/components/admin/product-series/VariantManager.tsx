
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Search, Package, Image, Box, Eye, Plus } from 'lucide-react';
import { VariantFormDialog } from './VariantFormDialog';

interface DatabaseVariant {
  id: string;
  product_code: string;
  name: string;
  category: string;
  dimensions?: string;
  door_type?: string;
  orientation?: string;
  finish_type?: string;
  mounting_type?: string;
  mixing_type?: string;
  handle_type?: string;
  emergency_shower_type?: string;
  number_of_drawers?: number;
  description?: string;
  thumbnail_path?: string;
  model_path?: string;
  is_active: boolean;
}

interface ProductSeries {
  id: string;
  name: string;
  product_code: string;
  product_series: string;
  category: string;
  description: string;
  series_slug: string;
  is_active: boolean;
  variant_count: number;
  completion_rate: number;
  series_thumbnail_path?: string;
  series_model_path?: string;
  variants: DatabaseVariant[];
}

interface VariantManagerProps {
  open: boolean;
  onClose: () => void;
  series: ProductSeries;
  onVariantsUpdated: () => void;
}

const VariantManager: React.FC<VariantManagerProps> = ({
  open,
  onClose,
  series,
  onVariantsUpdated
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<DatabaseVariant | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const filteredVariants = series.variants.filter(variant =>
    variant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variant.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variant.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variant.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    return value.toString();
  };

  const handleAddVariant = () => {
    setSelectedVariant(null);
    setIsCreating(true);
    setIsFormDialogOpen(true);
  };

  const handleEditVariant = (variant: DatabaseVariant) => {
    // Transform DatabaseVariant to match VariantFormDialog's Product interface
    const transformedVariant = {
      id: variant.id,
      name: variant.name,
      product_code: variant.product_code,
      category: variant.category,
      product_series: series.product_series,
      finish_type: variant.finish_type || 'PC',
      is_active: variant.is_active,
      thumbnail_path: variant.thumbnail_path,
      model_path: variant.model_path,
      dimensions: variant.dimensions,
      orientation: variant.orientation,
      door_type: variant.door_type,
      drawer_count: variant.number_of_drawers,
      description: variant.description
    };
    
    setSelectedVariant(transformedVariant as any);
    setIsCreating(false);
    setIsFormDialogOpen(true);
  };

  const handleFormClose = () => {
    setIsFormDialogOpen(false);
    setSelectedVariant(null);
    setIsCreating(false);
  };

  const handleVariantSaved = () => {
    onVariantsUpdated();
    handleFormClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Manage Variants - {series.name}
              </div>
              <Button onClick={handleAddVariant} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Variant
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden space-y-4">
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Series Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{series.variants.length}</div>
                    <div className="text-sm text-muted-foreground">Total Variants</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {series.variants.filter(v => v.is_active).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Variants</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {series.variants.filter(v => v.thumbnail_path && v.model_path).length}
                    </div>
                    <div className="text-sm text-muted-foreground">With Assets</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search variants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Badge variant="outline">
                {filteredVariants.length} variants
              </Badge>
            </div>

            {/* Variants Table */}
            <Card className="flex-1 overflow-hidden">
              <CardContent className="p-0 h-full">
                <div className="overflow-auto h-full">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead>Product Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Dimensions</TableHead>
                        <TableHead>Door Type</TableHead>
                        <TableHead>Orientation</TableHead>
                        <TableHead>Finish Type</TableHead>
                        <TableHead>Mounting Type</TableHead>
                        <TableHead>Mixing Type</TableHead>
                        <TableHead>Handle Type</TableHead>
                        <TableHead>Emergency Shower Type</TableHead>
                        <TableHead>Drawers</TableHead>
                        <TableHead>Assets</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVariants.map((variant) => (
                        <TableRow key={variant.id} className="hover:bg-muted/50">
                          <TableCell className="font-mono text-sm">
                            {variant.product_code}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div>
                              <div>{variant.name}</div>
                              {variant.description && (
                                <div className="text-xs text-muted-foreground line-clamp-2">
                                  {variant.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{formatValue(variant.category)}</TableCell>
                          <TableCell>{formatValue(variant.dimensions)}</TableCell>
                          <TableCell>{formatValue(variant.door_type)}</TableCell>
                          <TableCell>{formatValue(variant.orientation)}</TableCell>
                          <TableCell>{formatValue(variant.finish_type)}</TableCell>
                          <TableCell>{formatValue(variant.mounting_type)}</TableCell>
                          <TableCell>{formatValue(variant.mixing_type)}</TableCell>
                          <TableCell>{formatValue(variant.handle_type)}</TableCell>
                          <TableCell>{formatValue(variant.emergency_shower_type)}</TableCell>
                          <TableCell>
                            {variant.number_of_drawers ? `${variant.number_of_drawers}` : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`flex items-center gap-1 ${variant.thumbnail_path ? 'text-green-600' : 'text-red-600'}`}>
                                <Image className="h-3 w-3" />
                                <span className="text-xs">
                                  {variant.thumbnail_path ? 'Yes' : 'No'}
                                </span>
                              </div>
                              <div className={`flex items-center gap-1 ${variant.model_path ? 'text-green-600' : 'text-red-600'}`}>
                                <Box className="h-3 w-3" />
                                <span className="text-xs">
                                  {variant.model_path ? 'Yes' : 'No'}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={variant.is_active ? "default" : "secondary"}>
                              {variant.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditVariant(variant)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Variant Form Dialog */}
      <VariantFormDialog
        open={isFormDialogOpen}
        onClose={handleFormClose}
        series={series}
        variant={selectedVariant}
        onVariantSaved={handleVariantSaved}
      />
    </>
  );
};

export default VariantManager;
