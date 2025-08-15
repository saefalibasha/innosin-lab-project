
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface Variant {
  id: string;
  name: string;
  product_code: string;
  dimensions: string;
  thumbnail_path: string;
  model_path: string;
  is_active: boolean;
  finish_type: string;
  orientation: string;
  drawer_count: number;
}

interface EnhancedVariantManagerProps {
  seriesId: string;
  seriesName: string;
}

export const EnhancedVariantManager: React.FC<EnhancedVariantManagerProps> = ({
  seriesId,
  seriesName
}) => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [newVariant, setNewVariant] = useState({
    name: '',
    product_code: '',
    dimensions: '',
    thumbnail_path: '',
    model_path: '',
    is_active: true,
    finish_type: '',
    orientation: '',
    drawer_count: 0
  });

  useEffect(() => {
    fetchVariants();
  }, [seriesId]);

  const fetchVariants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('parent_series_id', seriesId)
        .eq('is_series_parent', false)
        .order('name');

      if (error) throw error;
      setVariants(data || []);
    } catch (error) {
      console.error('Error fetching variants:', error);
      toast.error('Failed to load variants');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariant = async () => {
    try {
      const { error } = await supabase
        .from('products')
        .insert([{
          ...newVariant,
          parent_series_id: seriesId,
          is_series_parent: false,
          category: 'Laboratory Equipment', // Default category
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast.success('Variant added successfully!');
      setIsAddDialogOpen(false);
      setNewVariant({
        name: '',
        product_code: '',
        dimensions: '',
        thumbnail_path: '',
        model_path: '',
        is_active: true,
        finish_type: '',
        orientation: '',
        drawer_count: 0
      });
      fetchVariants();
    } catch (error) {
      console.error('Error adding variant:', error);
      toast.error('Failed to add variant');
    }
  };

  const handleUpdateVariant = async (variant: Variant) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: variant.name,
          product_code: variant.product_code,
          dimensions: variant.dimensions,
          thumbnail_path: variant.thumbnail_path,
          model_path: variant.model_path,
          is_active: variant.is_active,
          finish_type: variant.finish_type,
          orientation: variant.orientation,
          drawer_count: variant.drawer_count,
          updated_at: new Date().toISOString()
        })
        .eq('id', variant.id);

      if (error) throw error;

      toast.success('Variant updated successfully!');
      setEditingVariant(null);
      fetchVariants();
    } catch (error) {
      console.error('Error updating variant:', error);
      toast.error('Failed to update variant');
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', variantId);

      if (error) throw error;

      toast.success('Variant deleted successfully!');
      fetchVariants();
    } catch (error) {
      console.error('Error deleting variant:', error);
      toast.error('Failed to delete variant');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8">Loading variants...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Variants for {seriesName}</h3>
          <p className="text-sm text-muted-foreground">{variants.length} variants found</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Variant
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Dimensions</TableHead>
                  <TableHead>Finish</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell>
                      {editingVariant?.id === variant.id ? (
                        <Input
                          value={editingVariant.name}
                          onChange={(e) => setEditingVariant({...editingVariant, name: e.target.value})}
                        />
                      ) : (
                        variant.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingVariant?.id === variant.id ? (
                        <Input
                          value={editingVariant.product_code}
                          onChange={(e) => setEditingVariant({...editingVariant, product_code: e.target.value})}
                        />
                      ) : (
                        variant.product_code
                      )}
                    </TableCell>
                    <TableCell>
                      {editingVariant?.id === variant.id ? (
                        <Input
                          value={editingVariant.dimensions}
                          onChange={(e) => setEditingVariant({...editingVariant, dimensions: e.target.value})}
                        />
                      ) : (
                        variant.dimensions
                      )}
                    </TableCell>
                    <TableCell>
                      {editingVariant?.id === variant.id ? (
                        <Input
                          value={editingVariant.finish_type}
                          onChange={(e) => setEditingVariant({...editingVariant, finish_type: e.target.value})}
                        />
                      ) : (
                        variant.finish_type
                      )}
                    </TableCell>
                    <TableCell>
                      {editingVariant?.id === variant.id ? (
                        <Switch
                          checked={editingVariant.is_active}
                          onCheckedChange={(checked) => setEditingVariant({...editingVariant, is_active: checked})}
                        />
                      ) : (
                        variant.is_active ? '✓' : '✗'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingVariant?.id === variant.id ? (
                        <div className="flex items-center gap-1">
                          <Button size="sm" onClick={() => handleUpdateVariant(editingVariant)}>
                            <Save className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingVariant(null)}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" onClick={() => setEditingVariant(variant)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-500">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Variant</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{variant.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteVariant(variant.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Add Variant Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Variant</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="variant-name">Name</Label>
              <Input
                id="variant-name"
                value={newVariant.name}
                onChange={(e) => setNewVariant({...newVariant, name: e.target.value})}
                placeholder="Variant name"
              />
            </div>
            <div>
              <Label htmlFor="variant-code">Product Code</Label>
              <Input
                id="variant-code"
                value={newVariant.product_code}
                onChange={(e) => setNewVariant({...newVariant, product_code: e.target.value})}
                placeholder="Product code"
              />
            </div>
            <div>
              <Label htmlFor="variant-dimensions">Dimensions</Label>
              <Input
                id="variant-dimensions"
                value={newVariant.dimensions}
                onChange={(e) => setNewVariant({...newVariant, dimensions: e.target.value})}
                placeholder="Dimensions"
              />
            </div>
            <div>
              <Label htmlFor="variant-finish">Finish Type</Label>
              <Input
                id="variant-finish"
                value={newVariant.finish_type}
                onChange={(e) => setNewVariant({...newVariant, finish_type: e.target.value})}
                placeholder="Finish type"
              />
            </div>
            <div>
              <Label htmlFor="variant-orientation">Orientation</Label>
              <Input
                id="variant-orientation"
                value={newVariant.orientation}
                onChange={(e) => setNewVariant({...newVariant, orientation: e.target.value})}
                placeholder="Orientation"
              />
            </div>
            <div>
              <Label htmlFor="variant-drawers">Drawer Count</Label>
              <Input
                id="variant-drawers"
                type="number"
                value={newVariant.drawer_count}
                onChange={(e) => setNewVariant({...newVariant, drawer_count: parseInt(e.target.value) || 0})}
                placeholder="Number of drawers"
              />
            </div>
            <div className="col-span-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="variant-active"
                  checked={newVariant.is_active}
                  onCheckedChange={(checked) => setNewVariant({...newVariant, is_active: checked})}
                />
                <Label htmlFor="variant-active">Active Variant</Label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddVariant}>Add Variant</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
