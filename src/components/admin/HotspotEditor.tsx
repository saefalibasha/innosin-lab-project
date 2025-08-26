
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Save, X, MapPin } from 'lucide-react';
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

interface ShopLookImage {
  id: string;
  url: string;
  filename: string;
  alt: string;
}

const HotspotEditor = () => {
  const [selectedImage, setSelectedImage] = useState<ShopLookImage | null>(null);
  const [editingHotspot, setEditingHotspot] = useState<Hotspot | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newHotspotPosition, setNewHotspotPosition] = useState<{ x: number; y: number } | null>(null);
  const [formData, setFormData] = useState<Partial<Hotspot>>({});
  const queryClient = useQueryClient();

  // Fetch shop look images
  const { data: images = [], isLoading: imagesLoading } = useQuery({
    queryKey: ['shop-look-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_look_images')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Convert to proper format, handling type mismatch
      return (data || []).map(img => ({
        id: String(img.id),
        url: img.url || '',
        filename: img.filename || '',
        alt: img.alt || ''
      })) as ShopLookImage[];
    }
  });

  // Fetch hotspots
  const { data: hotspots = [], isLoading: hotspotsLoading } = useQuery({
    queryKey: ['shop-look-hotspots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_look_hotspots')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Save hotspot mutation
  const saveHotspotMutation = useMutation({
    mutationFn: async (hotspotData: Partial<Hotspot>) => {
      const dataToSave = {
        ...hotspotData,
        specifications: JSON.stringify(hotspotData.specifications || [])
      };

      if (hotspotData.id) {
        const { error } = await supabase
          .from('shop_look_hotspots')
          .update(dataToSave)
          .eq('id', hotspotData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('shop_look_hotspots')
          .insert([dataToSave]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-look-hotspots'] });
      setEditingHotspot(null);
      setIsCreating(false);
      setFormData({});
      setNewHotspotPosition(null);
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
      queryClient.invalidateQueries({ queryKey: ['shop-look-hotspots'] });
      toast.success('Hotspot deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete hotspot: ' + error.message);
    }
  });

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!isCreating) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    setNewHotspotPosition({ x, y });
    setFormData({
      x_position: x,
      y_position: y,
      title: '',
      description: '',
      price: 'Contact for pricing',
      category: 'Laboratory Equipment',
      image: '',
      product_link: '/products',
      specifications: ['Premium Quality', 'Professional Grade'],
      is_active: true,
      display_order: hotspots.length
    });
  };

  const handleEditHotspot = (hotspot: any) => {
    setEditingHotspot(hotspot);
    setFormData({
      ...hotspot,
      specifications: Array.isArray(hotspot.specifications) 
        ? hotspot.specifications 
        : typeof hotspot.specifications === 'string'
        ? JSON.parse(hotspot.specifications)
        : ['Premium Quality', 'Professional Grade']
    });
  };

  const handleSave = () => {
    if (!formData.title) {
      toast.error('Title is required');
      return;
    }
    saveHotspotMutation.mutate(formData);
  };

  const handleCancel = () => {
    setEditingHotspot(null);
    setIsCreating(false);
    setFormData({});
    setNewHotspotPosition(null);
  };

  const handleInputChange = (field: keyof Hotspot, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSpecificationChange = (index: number, value: string) => {
    const specs = [...(formData.specifications || [])];
    specs[index] = value;
    handleInputChange('specifications', specs);
  };

  const addSpecification = () => {
    const specs = [...(formData.specifications || []), ''];
    handleInputChange('specifications', specs);
  };

  const removeSpecification = (index: number) => {
    const specs = [...(formData.specifications || [])];
    specs.splice(index, 1);
    handleInputChange('specifications', specs);
  };

  if (imagesLoading || hotspotsLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No shop look images found. Please upload an image first.</p>
      </div>
    );
  }

  const currentImage = selectedImage || images[0];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Shop The Look Hotspots</h3>
        <div className="flex space-x-2">
          <Button
            onClick={() => setIsCreating(!isCreating)}
            variant={isCreating ? "destructive" : "default"}
          >
            {isCreating ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {isCreating ? 'Cancel' : 'Add Hotspot'}
          </Button>
        </div>
      </div>

      {images.length > 1 && (
        <div className="space-y-2">
          <Label>Select Background Image</Label>
          <div className="flex flex-wrap gap-2">
            {images.map((image) => (
              <Button
                key={image.id}
                variant={selectedImage?.id === image.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedImage(image)}
              >
                {image.filename || `Image ${image.id}`}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="relative">
        <div className={`relative ${isCreating ? 'cursor-crosshair' : ''}`}>
          <img
            src={currentImage.url}
            alt={currentImage.alt}
            className="w-full h-[600px] object-cover rounded-lg border"
            onClick={handleImageClick}
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          
          {isCreating && (
            <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-2 rounded-md text-sm">
              Click on the image to place a hotspot
            </div>
          )}

          {/* Render existing hotspots */}
          {hotspots
            .filter(hotspot => hotspot.is_active)
            .map((hotspot) => (
              <div
                key={hotspot.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                style={{
                  left: `${hotspot.x_position}%`,
                  top: `${hotspot.y_position}%`
                }}
              >
                <Button
                  className="w-8 h-8 rounded-full bg-white border-4 border-blue-500 shadow-lg hover:scale-110 transition-all duration-200 p-0"
                  onClick={() => handleEditHotspot(hotspot)}
                >
                  <MapPin className="w-4 h-4 text-blue-500" />
                </Button>
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {hotspot.title}
                </div>
              </div>
            ))}

          {/* Render new hotspot position */}
          {newHotspotPosition && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${newHotspotPosition.x}%`,
                top: `${newHotspotPosition.y}%`
              }}
            >
              <div className="w-8 h-8 rounded-full bg-green-500 border-4 border-white shadow-lg animate-pulse flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit/Create Form */}
      {(editingHotspot || newHotspotPosition) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingHotspot ? 'Edit Hotspot' : 'Create New Hotspot'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Product name"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category || ''}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="Laboratory Equipment"
                />
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  value={formData.price || ''}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="Contact for pricing"
                />
              </div>
              <div>
                <Label htmlFor="product_link">Product Link</Label>
                <Input
                  id="product_link"
                  value={formData.product_link || ''}
                  onChange={(e) => handleInputChange('product_link', e.target.value)}
                  placeholder="/products"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                placeholder="Product description"
              />
            </div>

            <div>
              <Label htmlFor="image">Product Image URL</Label>
              <Input
                id="image"
                value={formData.image || ''}
                onChange={(e) => handleInputChange('image', e.target.value)}
                placeholder="Image URL"
              />
            </div>

            <div>
              <Label>Specifications</Label>
              <div className="space-y-2">
                {(formData.specifications || []).map((spec, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={spec}
                      onChange={(e) => handleSpecificationChange(index, e.target.value)}
                      placeholder="Specification"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSpecification(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSpecification}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Specification
                </Button>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saveHotspotMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {saveHotspotMutation.isPending ? 'Saving...' : 'Save Hotspot'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hotspots List */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Hotspots</CardTitle>
        </CardHeader>
        <CardContent>
          {hotspots.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hotspots created yet. Click "Add Hotspot" to get started.
            </p>
          ) : (
            <div className="space-y-2">
              {hotspots.map((hotspot) => (
                <div
                  key={hotspot.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{hotspot.title}</h4>
                      <Badge variant={hotspot.is_active ? 'default' : 'secondary'}>
                        {hotspot.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {hotspot.category} • Position: {Math.round(hotspot.x_position)}%, {Math.round(hotspot.y_position)}%
                    </p>
                  </div>
                  <div className="flex space-x-2">
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
                      onClick={() => deleteHotspotMutation.mutate(hotspot.id)}
                      disabled={deleteHotspotMutation.isPending}
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
    </div>
  );
};

export { HotspotEditor };
export default HotspotEditor;
