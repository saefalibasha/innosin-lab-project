import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Target, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import ProductSelector from '../ProductSelector';
import { toast } from 'sonner';

interface Hotspot {
  id: string;
  x_position: number;
  y_position: number;
  title: string;
  description: string | null;
  price: string | null;
  category: string | null;
  image: string | null;
  product_link: string | null;
  specifications: any;
  is_active: boolean;
  display_order: number | null;
}

interface HotspotFormData {
  title: string;
  description: string;
  price: string;
  category: string;
  image: string;
  product_link: string;
  specifications: string[];
  x_position?: number;
  y_position?: number;
}

const HotspotEditor = () => {
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [formData, setFormData] = useState<HotspotFormData>({
    title: '',
    description: '',
    price: 'Contact for pricing',
    category: 'Laboratory Equipment',
    image: '',
    product_link: '/products',
    specifications: []
  });
  const [isPlacingHotspot, setIsPlacingHotspot] = useState(false);

  const queryClient = useQueryClient();

  // Fetch shop look content for background image
  const { data: content } = useQuery({
    queryKey: ['shop-look-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_look_content')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch hotspots
  const { data: hotspots = [], isLoading: hotspotsLoading } = useQuery({
    queryKey: ['shop-look-hotspots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_look_hotspots')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Create/Update hotspot mutation
  const hotspotMutation = useMutation({
    mutationFn: async ({ hotspotData, isUpdate }: { hotspotData: any, isUpdate: boolean }) => {
      if (isUpdate && selectedHotspot) {
        const { data, error } = await supabase
          .from('shop_look_hotspots')
          .update(hotspotData)
          .eq('id', selectedHotspot.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('shop_look_hotspots')
          .insert([hotspotData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-look-hotspots'] });
      setIsEditing(false);
      setSelectedHotspot(null);
      setIsPlacingHotspot(false);
      resetForm();
      toast.success('Hotspot saved successfully');
    },
    onError: (error) => {
      console.error('Error saving hotspot:', error);
      toast.error('Failed to save hotspot');
    }
  });

  // Delete hotspot mutation
  const deleteHotspotMutation = useMutation({
    mutationFn: async (hotspotId: string) => {
      const { error } = await supabase
        .from('shop_look_hotspots')
        .delete()
        .eq('id', hotspotId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-look-hotspots'] });
      setSelectedHotspot(null);
      toast.success('Hotspot deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting hotspot:', error);
      toast.error('Failed to delete hotspot');
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: 'Contact for pricing',
      category: 'Laboratory Equipment',
      image: '',
      product_link: '/products',
      specifications: []
    });
  };

  const handleImageClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlacingHotspot) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setFormData(prev => ({ ...prev, x_position: x, y_position: y }));
    setShowProductSelector(true);
  }, [isPlacingHotspot]);

  const handleProductSelect = (product: any) => {
    const specifications = Array.isArray(product.specifications) 
      ? product.specifications 
      : typeof product.specifications === 'object' && product.specifications
        ? Object.values(product.specifications).filter(Boolean)
        : ['Premium Quality', 'Professional Grade', 'Industry Standard'];

    setFormData(prev => ({
      ...prev,
      title: product.name || '',
      description: product.description || '',
      category: product.category || 'Laboratory Equipment',
      image: product.thumbnail_path || '',
      product_link: `/products/${product.id}`,
      specifications: specifications
    }));
    
    setShowProductSelector(false);
    setIsEditing(true);
  };

  const handleSaveHotspot = () => {
    const hotspotData = {
      x_position: formData.x_position,
      y_position: formData.y_position,
      title: formData.title,
      description: formData.description,
      price: formData.price,
      category: formData.category,
      image: formData.image,
      product_link: formData.product_link,
      specifications: formData.specifications,
      is_active: true,
      display_order: hotspots.length
    };

    hotspotMutation.mutate({ 
      hotspotData, 
      isUpdate: selectedHotspot !== null 
    });
  };

  const handleEditHotspot = (hotspot: Hotspot) => {
    setSelectedHotspot(hotspot);
    setFormData({
      title: hotspot.title,
      description: hotspot.description || '',
      price: hotspot.price || 'Contact for pricing',
      category: hotspot.category || 'Laboratory Equipment',
      image: hotspot.image || '',
      product_link: hotspot.product_link || '/products',
      specifications: Array.isArray(hotspot.specifications) 
        ? hotspot.specifications 
        : ['Premium Quality', 'Professional Grade', 'Industry Standard'],
      x_position: hotspot.x_position,
      y_position: hotspot.y_position,
    });
    setIsEditing(true);
  };

  const handleDeleteHotspot = (hotspotId: string) => {
    if (confirm('Are you sure you want to delete this hotspot?')) {
      deleteHotspotMutation.mutate(hotspotId);
    }
  };

  if (!content?.background_image) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            Please upload a background image in the Content Editor first.
          </p>
          <Button variant="outline">
            Go to Content Editor
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Hotspot Editor
            </div>
            <Button
              onClick={() => setIsPlacingHotspot(!isPlacingHotspot)}
              variant={isPlacingHotspot ? "destructive" : "default"}
            >
              {isPlacingHotspot ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Hotspot
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Background Image with Hotspots */}
          <div 
            className={`relative overflow-hidden rounded-lg border-2 ${
              isPlacingHotspot ? 'border-primary cursor-crosshair' : 'border-border'
            }`}
            onClick={handleImageClick}
          >
            <img
              src={content.background_image}
              alt={content.background_alt || 'Background'}
              className="w-full h-auto max-h-96 object-cover"
            />
            
            {/* Existing Hotspots */}
            {hotspots.map((hotspot) => (
              <div
                key={hotspot.id}
                className="absolute w-6 h-6 bg-primary border-2 border-white rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform shadow-lg"
                style={{
                  left: `${hotspot.x_position}%`,
                  top: `${hotspot.y_position}%`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditHotspot(hotspot);
                }}
              />
            ))}
            
            {isPlacingHotspot && (
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                <p className="bg-background px-4 py-2 rounded-lg shadow-lg">
                  Click anywhere to place a hotspot
                </p>
              </div>
            )}
          </div>
          
          {isPlacingHotspot && (
            <p className="text-sm text-muted-foreground mt-2">
              Click on the image above to place a new hotspot, then select a product from your catalog.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Hotspots List */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Hotspots ({hotspots.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {hotspotsLoading ? (
            <p>Loading hotspots...</p>
          ) : hotspots.length === 0 ? (
            <p className="text-muted-foreground">No hotspots created yet. Add your first hotspot above!</p>
          ) : (
            <div className="space-y-3">
              {hotspots.map((hotspot) => (
                <div
                  key={hotspot.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{hotspot.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Position: {hotspot.x_position.toFixed(1)}%, {hotspot.y_position.toFixed(1)}%
                    </p>
                    {hotspot.category && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        {hotspot.category}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditHotspot(hotspot)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteHotspot(hotspot.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Selector Dialog */}
      <Dialog open={showProductSelector} onOpenChange={setShowProductSelector}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select Product for Hotspot</DialogTitle>
          </DialogHeader>
          <ProductSelector
            onProductSelect={handleProductSelect}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Hotspot Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedHotspot ? 'Edit Hotspot' : 'Create Hotspot'}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="product-link">Product Link</Label>
                <Input
                  id="product-link"
                  value={formData.product_link}
                  onChange={(e) => setFormData(prev => ({ ...prev, product_link: e.target.value }))}
                />
              </div>

              <div>
                <Label>Specifications</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.specifications.map((spec, index) => (
                    <Badge key={index} variant="secondary">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveHotspot}
                  disabled={hotspotMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {hotspotMutation.isPending ? 'Saving...' : 'Save Hotspot'}
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HotspotEditor;
