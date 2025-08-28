import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Target,
  Package,
  AlertCircle
} from 'lucide-react';

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

interface ShopLookContent {
  id: string;
  background_image: string;
  background_alt: string;
  title: string;
}

const HotspotEditor = () => {
  const [selectedContent, setSelectedContent] = useState<ShopLookContent | null>(null);
  const [editingHotspot, setEditingHotspot] = useState<Hotspot | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newHotspotPosition, setNewHotspotPosition] = useState<{ x: number; y: number } | null>(null);
  const [formData, setFormData] = useState<Partial<Hotspot>>({});
  const queryClient = useQueryClient();

  // Fetch shop look content for background image
  const { data: contentList = [], isLoading: contentLoading } = useQuery({
    queryKey: ['shop-look-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_look_content')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(content => ({
        id: String(content.id),
        background_image: content.background_image || '',
        background_alt: content.background_alt || '',
        title: content.title || ''
      })) as ShopLookContent[];
    }
  });

  // Fetch existing hotspots
  const { data: hotspots = [], isLoading: hotspotsLoading } = useQuery({
    queryKey: ['shop-look-hotspots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_look_hotspots')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data as Hotspot[];
    }
  });

  // Create hotspot mutation
  const createHotspotMutation = useMutation({
    mutationFn: async (hotspotData: Partial<Hotspot>) => {
      const { data, error } = await supabase
        .from('shop_look_hotspots')
        .insert([hotspotData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-look-hotspots'] });
      toast.success('Hotspot created successfully');
      handleCancel();
    },
    onError: (error) => {
      console.error('Error creating hotspot:', error);
      toast.error('Failed to create hotspot');
    }
  });

  // Update hotspot mutation
  const updateHotspotMutation = useMutation({
    mutationFn: async ({ id, ...hotspotData }: Partial<Hotspot> & { id: string }) => {
      const { data, error } = await supabase
        .from('shop_look_hotspots')
        .update(hotspotData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-look-hotspots'] });
      toast.success('Hotspot updated successfully');
      handleCancel();
    },
    onError: (error) => {
      console.error('Error updating hotspot:', error);
      toast.error('Failed to update hotspot');
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
      console.error('Error deleting hotspot:', error);
      toast.error('Failed to delete hotspot');
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
      specifications: ['Premium Quality', 'Professional Grade', 'Industry Standard'],
      is_active: true,
      display_order: hotspots.length
    });
  };

  const handleCreateMode = () => {
    setIsCreating(true);
    setNewHotspotPosition(null);
    toast.info('Click on the image to place a new hotspot');
  };

  const handleEdit = (hotspot: Hotspot) => {
    setEditingHotspot(hotspot);
    setFormData(hotspot);
    setIsCreating(false);
    setNewHotspotPosition(null);
  };

  const handleSave = () => {
    if (!formData.title?.trim()) {
      toast.error('Please enter a title for the hotspot');
      return;
    }

    if (isCreating && newHotspotPosition) {
      createHotspotMutation.mutate(formData);
    } else if (editingHotspot) {
      updateHotspotMutation.mutate({ ...formData, id: editingHotspot.id });
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingHotspot(null);
    setNewHotspotPosition(null);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this hotspot?')) {
      deleteHotspotMutation.mutate(id);
    }
  };

  const handleInputChange = (field: keyof Hotspot, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSpecificationsChange = (specs: string) => {
    const specArray = specs.split('\n').filter(spec => spec.trim());
    handleInputChange('specifications', specArray);
  };

  if (contentLoading || hotspotsLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (contentList.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No shop look content found. Please create content first.</p>
      </div>
    );
  }

  const currentContent = selectedContent || contentList[0];

  if (!currentContent.background_image) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No background image found. Please upload a background image first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isCreating && !editingHotspot && (
            <Button onClick={handleCreateMode} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Hotspot
            </Button>
          )}
          
          {(isCreating || editingHotspot) && (
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save Hotspot
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
        
        <Badge variant="outline" className="flex items-center gap-1">
          <Target className="w-3 h-3" />
          {hotspots.length} Hotspots
        </Badge>
      </div>

      {/* Background Content Selection */}
      {contentList.length > 1 && (
        <div className="space-y-2">
          <Label>Select Background Content</Label>
          <div className="flex flex-wrap gap-2">
            {contentList.map((content) => (
              <Button
                key={content.id}
                variant={selectedContent?.id === content.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedContent(content)}
              >
                {content.title || `Content ${content.id}`}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Image with Hotspots */}
      <div className="relative">
        <div className={`relative ${isCreating ? 'cursor-crosshair' : ''}`}>
          <img
            src={currentContent.background_image || '/placeholder.svg'}
            alt={currentContent.background_alt}
            className="w-full h-[600px] object-cover rounded-lg border"
            onClick={handleImageClick}
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          
          {/* Existing Hotspots */}
          {hotspots.map((hotspot) => (
            <div
              key={hotspot.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                editingHotspot?.id === hotspot.id ? 'z-20' : 'z-10'
              }`}
              style={{ 
                left: `${hotspot.x_position}%`, 
                top: `${hotspot.y_position}%` 
              }}
            >
              <div className={`relative group ${
                editingHotspot?.id === hotspot.id ? 'scale-110' : ''
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer transition-all ${
                  editingHotspot?.id === hotspot.id 
                    ? 'bg-blue-600 ring-4 ring-blue-200' 
                    : hotspot.is_active 
                    ? 'bg-red-500 hover:bg-red-600 hover:scale-110' 
                    : 'bg-gray-400'
                }`}
                onClick={() => handleEdit(hotspot)}
                >
                  {hotspot.display_order + 1}
                </div>
                
                {/* Hotspot preview on hover */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                  <div className="bg-black/90 text-white p-2 rounded text-xs whitespace-nowrap max-w-48">
                    <div className="font-medium">{hotspot.title}</div>
                    <div className="text-gray-300">{hotspot.category}</div>
                    <div className="text-green-400">{hotspot.price}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* New Hotspot Position */}
          {newHotspotPosition && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
              style={{ 
                left: `${newHotspotPosition.x}%`, 
                top: `${newHotspotPosition.y}%` 
              }}
            >
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold ring-4 ring-blue-200 animate-pulse">
                +
              </div>
            </div>
          )}
        </div>
        
        {isCreating && (
          <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded text-sm">
            Click on the image to place a hotspot
          </div>
        )}
      </div>

      {/* Hotspot Form */}
      {(isCreating && newHotspotPosition) || editingHotspot ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {editingHotspot ? 'Edit Hotspot' : 'New Hotspot'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Product Title</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter product title"
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
                  placeholder="/products/product-slug"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Product description"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="image">Product Image URL</Label>
              <Input
                id="image"
                value={formData.image || ''}
                onChange={(e) => handleInputChange('image', e.target.value)}
                placeholder="https://example.com/product-image.jpg"
              />
            </div>
            
            <div>
              <Label htmlFor="specifications">Specifications (one per line)</Label>
              <Textarea
                id="specifications"
                value={formData.specifications?.join('\n') || ''}
                onChange={(e) => handleSpecificationsChange(e.target.value)}
                placeholder="Premium Quality&#10;Professional Grade&#10;Industry Standard"
                rows={3}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active !== false}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
                <Label>Active</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="display_order">Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order || 0}
                  onChange={(e) => handleInputChange('display_order', parseInt(e.target.value))}
                  className="w-20"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Hotspots List */}
      {hotspots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Existing Hotspots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {hotspots.map((hotspot) => (
                <div key={hotspot.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      hotspot.is_active ? 'bg-red-500' : 'bg-gray-400'
                    }`}>
                      {hotspot.display_order + 1}
                    </div>
                    <div>
                      <div className="font-medium">{hotspot.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {hotspot.category} • {hotspot.price}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(hotspot)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(hotspot.id)}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HotspotEditor;
