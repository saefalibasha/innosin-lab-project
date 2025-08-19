
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Package, Search, Plus, Eye, Edit, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductSeriesFormDialog } from './ProductSeriesFormDialog';
import { ProductSeriesViewDialog } from './ProductSeriesViewDialog';
import { EnhancedVariantManager } from './EnhancedVariantManager';

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

export const ProductSeriesManager = () => {
  const [series, setSeries] = useState<ProductSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeries, setSelectedSeries] = useState<ProductSeries | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false);

  useEffect(() => {
    fetchProductSeries();
  }, []);

  const fetchProductSeries = async () => {
    setLoading(true);
    try {
      // Fetch parent series
      const { data: parentSeries, error: parentError } = await supabase
        .from('products')
        .select('*')
        .eq('is_series_parent', true)
        .order('name');

      if (parentError) throw parentError;

      // Calculate stats for each series
      const seriesWithStats = await Promise.all(
        (parentSeries || []).map(async (parent) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('parent_series_id', parent.id)
            .eq('is_series_parent', false);

          // Calculate completion percentage
          const hasDescription = parent.description && parent.description.length > 0;
          const hasThumbnail = parent.thumbnail_path && parent.thumbnail_path.length > 0;
          const hasVariants = (count || 0) > 0;
          
          const completionFields = [hasDescription, hasThumbnail, hasVariants];
          const completedFields = completionFields.filter(Boolean).length;
          const completion_percentage = Math.round((completedFields / completionFields.length) * 100);

          return {
            id: parent.id,
            name: parent.name,
            category: parent.category,
            description: parent.description || '',
            thumbnail_path: parent.thumbnail_path || '',
            is_active: parent.is_active,
            variant_count: count || 0,
            completion_percentage
          };
        })
      );

      setSeries(seriesWithStats);
    } catch (error) {
      console.error('Error fetching product series:', error);
      toast.error('Failed to load product series');
    } finally {
      setLoading(false);
    }
  };

  const filteredSeries = series.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (seriesItem: ProductSeries) => {
    setSelectedSeries(seriesItem);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (seriesItem: ProductSeries) => {
    // TODO: Implement edit functionality
    toast.info('Edit functionality coming soon!');
  };

  const handleManageVariants = (seriesItem: ProductSeries) => {
    setSelectedSeries(seriesItem);
    setIsVariantDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Product Series Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading product series...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Product Series Manager
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search product series..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Series
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSeries.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Product Series Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No series match your search criteria.' : 'Start by adding your first product series.'}
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Series
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSeries.map((seriesItem) => (
                <Card key={seriesItem.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{seriesItem.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {seriesItem.category}
                        </p>
                      </div>
                      <Badge variant={seriesItem.is_active ? "default" : "secondary"}>
                        {seriesItem.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {seriesItem.description || 'No description available'}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Variants</span>
                        <span className="font-medium">{seriesItem.variant_count}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Completion</span>
                        <span className="font-medium">{seriesItem.completion_percentage}%</span>
                      </div>
                      <Progress value={seriesItem.completion_percentage} className="h-2" />
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleView(seriesItem)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEdit(seriesItem)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleManageVariants(seriesItem)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Variants
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Series Dialog */}
      <ProductSeriesFormDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSeriesCreated={fetchProductSeries}
      />

      {/* View Series Dialog */}
      <ProductSeriesViewDialog
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        series={selectedSeries}
        onEdit={handleEdit}
        onManageVariants={handleManageVariants}
      />

      {/* Variant Management Dialog */}
      <Dialog open={isVariantDialogOpen} onOpenChange={setIsVariantDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              Manage Variants - {selectedSeries?.name}
            </DialogTitle>
            <DialogDescription>
              Add, edit, or remove variants for this product series.
            </DialogDescription>
          </DialogHeader>
          {selectedSeries && (
            <EnhancedVariantManager 
              seriesId={selectedSeries.id}
              seriesName={selectedSeries.name}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
