import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Target, MousePointer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Hotspot {
  id: string;
  x_position: number;
  y_position: number;
  title: string;
  description: string;
  price: string;
  category: string;
  image: string;
  product_link: string;
  specifications: string[];
  is_active: boolean;
  display_order: number;
}

export const HotspotEditor = () => {
  const [editingHotspot, setEditingHotspot] = useState<Hotspot | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPositioning, setIsPositioning] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const queryClient = useQueryClient();

  // Fetch hotspots
  const { data: hotspots = [], isLoading } = useQuery({
    queryKey: ['admin-shop-look-hotspots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_look_hotspots')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch background image
  const { data: content } = useQuery({
    queryKey: ['admin-shop-look-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_look_content')
        .select('*')
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Save hotspot mutation
  const saveHotspotMutation = useMutation({
    mutationFn: async (hotspot: any) => {
      if (hotspot.id) {
        const { error } = await supabase
          .from('shop_look_hotspots')
          .update(hotspot)
          .eq('id', hotspot.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('shop_look_hotspots')
          .insert(hotspot);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shop-look-hotspots'] });
      queryClient.invalidateQueries({ queryKey: ['shop-look-hotspots'] });
      setIsDialogOpen(false);
      setEditingHotspot(null);
      toast.success('Hotspot saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save hotspot: ' + error.message);
    }
  });

  // Delete hotspot mutation
  const deleteHotspotMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shop_look_hotspots')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shop-look-hotspots'] });
      queryClient.invalidateQueries({ queryKey: ['shop-look-hotspots'] });
      toast.success('Hotspot deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete hotspot: ' + error.message);
    }
  });

  const handleEdit = (hotspot: Hotspot) => {
    setEditingHotspot(hotspot);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingHotspot({
      id: '',
      x_position: 50,
      y_position: 50,
      title: '',
      description: '',
      price: 'Contact for pricing',
      category: 'Laboratory Equipment',
      image: '',
      product_link: '/products',
      specifications: ['Premium Quality', 'Professional Grade', 'Industry Standard'],
      is_active: true,
      display_order: hotspots.length + 1
    });
    setIsDialogOpen(true);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isPositioning || !editingHotspot) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setEditingHotspot({
      ...editingHotspot,
      x_position: Math.round(x * 100) / 100,
      y_position: Math.round(y * 100) / 100
    });
    
    setIsPositioning(false);
    toast.success('Position updated! Click save to apply changes.');
  };

  const handleSave = (formData: FormData) => {
    const specs = formData.get('specifications') as string;
    const specificationsArray = specs.split(',').map(s => s.trim()).filter(s => s);

    const hotspotData = {
      id: editingHotspot?.id || undefined,
      x_position: editingHotspot?.x_position || 50,
      y_position: editingHotspot?.y_position || 50,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      price: formData.get('price') as string,
      category: formData.get('category') as string,
      image: formData.get('image') as string,
      product_link: formData.get('product_link') as string,
      specifications: specificationsArray,
      is_active: formData.get('is_active') === 'on',
      display_order: parseInt(formData.get('display_order') as string)
    };

    saveHotspotMutation.mutate(hotspotData);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading hotspots...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Manage Hotspots</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="w-4 h-4 mr-2" />
              Add Hotspot
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>
                {editingHotspot?.id ? 'Edit Hotspot' : 'Add New Hotspot'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Visual Position Editor */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Position on Image</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant={isPositioning ? "destructive" : "outline"}
                    onClick={() => setIsPositioning(!isPositioning)}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    {isPositioning ? 'Cancel' : 'Set Position'}
                  </Button>
                </div>
                
                <div className="relative border rounded-lg overflow-hidden">
                  <img
                    ref={imageRef}
                    src={content?.background_image || '/shop-the-look/modern-lab-setup.jpg'}
                    alt="Background"
                    className={`w-full h-64 object-cover ${isPositioning ? 'cursor-crosshair' : ''}`}
                    onClick={handleImageClick}
                  />
                  {editingHotspot && (
                    <div
                      className="absolute w-6 h-6 bg-blue-500 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                      style={{
                        left: `${editingHotspot.x_position}%`,
                        top: `${editingHotspot.y_position}%`
                      }}
                    >
                      <Plus className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {isPositioning && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                      <div className="bg-white/90 px-4 py-2 rounded-lg">
                        <MousePointer className="w-5 h-5 mx-auto mb-1" />
                        <p className="text-sm">Click to set position</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Position: {editingHotspot?.x_position?.toFixed(1)}%, {editingHotspot?.y_position?.toFixed(1)}%
                </div>
              </div>

              {/* Form Fields */}
              <form onSubmit={(e) => { e.preventDefault(); handleSave(new FormData(e.currentTarget)); }} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={editingHotspot?.title}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      name="category"
                      defaultValue={editingHotspot?.category}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      name="price"
                      defaultValue={editingHotspot?.price}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingHotspot?.description}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      name="image"
                      defaultValue={editingHotspot?.image}
                      placeholder="/path/to/product-image.jpg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="product_link">Product Link</Label>
                    <Input
                      id="product_link"
                      name="product_link"
                      defaultValue={editingHotspot?.product_link}
                      placeholder="/products"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="specifications">Specifications (comma-separated)</Label>
                  <Input
                    id="specifications"
                    name="specifications"
                    defaultValue={editingHotspot?.specifications?.join(', ')}
                    placeholder="Premium Quality, Professional Grade, Industry Standard"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input
                      id="display_order"
                      name="display_order"
                      type="number"
                      defaultValue={editingHotspot?.display_order}
                      min="1"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      name="is_active"
                      defaultChecked={editingHotspot?.is_active}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saveHotspotMutation.isPending}>
                    {saveHotspotMutation.isPending ? 'Saving...' : 'Save Hotspot'}
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {hotspots.map((hotspot) => (
          <Card key={hotspot.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{hotspot.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{hotspot.category}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant={hotspot.is_active ? 'default' : 'secondary'}>
                      {hotspot.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">{hotspot.price}</Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(hotspot)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteHotspotMutation.mutate(hotspot.id)}
                    disabled={deleteHotspotMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Position: {hotspot.x_position}%, {hotspot.y_position}%
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {hotspot.description}
                  </p>
                </div>
                {hotspot.image && (
                  <img
                    src={hotspot.image}
                    alt={hotspot.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};