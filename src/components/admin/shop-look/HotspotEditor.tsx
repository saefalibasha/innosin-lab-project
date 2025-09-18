import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
  AlertCircle,
  Check,
} from 'lucide-react';
import HotspotProductSelector from './HotspotProductSelector';

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

  // --- Fetch shop look content ---
  const { data: contentList = [], isLoading: contentLoading } = useQuery({
    queryKey: ['shop-look-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_look_content')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((content) => ({
        id: String(content.id),
        background_image: content.background_image || '',
        background_alt: content.background_alt || '',
        title: content.title || '',
      })) as ShopLookContent[];
    },
  });

  // --- Fetch hotspots ---
  const { data: hotspots = [], isLoading: hotspotsLoading } = useQuery({
    queryKey: ['shop-look-hotspots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_look_hotspots')
        .select('*')
        .order('display_order');

      if (error) throw error;
      
      // Transform specifications from JSON to array format
      return (data || []).map(hotspot => ({
        ...hotspot,
        specifications: Array.isArray(hotspot.specifications) 
          ? hotspot.specifications 
          : typeof hotspot.specifications === 'string' 
            ? [hotspot.specifications]
            : typeof hotspot.specifications === 'object' && hotspot.specifications !== null
              ? Object.values(hotspot.specifications)
              : ['Premium Quality', 'Professional Grade', 'Industry Standard']
      })) as Hotspot[];
    },
  });

  // --- CRUD for hotspots ---
  const createHotspotMutation = useMutation({
    mutationFn: async (hotspotData: Partial<Hotspot>) => {
      if (!hotspotData.title) throw new Error('Title is required');
      if (hotspotData.x_position === undefined || hotspotData.y_position === undefined) {
        throw new Error('Position is required');
      }

      const dataToInsert = {
        title: hotspotData.title,
        x_position: hotspotData.x_position,
        y_position: hotspotData.y_position,
        description: hotspotData.description || '',
        price: hotspotData.price || 'Contact for pricing',
        category: hotspotData.category || 'Laboratory Equipment',
        image: hotspotData.image || '',
        product_link: hotspotData.product_link || '/products',
        specifications: JSON.stringify(
          hotspotData.specifications || ['Premium Quality', 'Professional Grade', 'Industry Standard']
        ),
        is_active: hotspotData.is_active ?? true,
        display_order: hotspotData.display_order ?? 0,
      };

      const { data, error } = await supabase
        .from('shop_look_hotspots')
        .insert(dataToInsert)
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
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create hotspot');
    },
  });

  const updateHotspotMutation = useMutation({
    mutationFn: async ({ id, ...hotspotData }: Partial<Hotspot> & { id: string }) => {
      // Ensure specifications are properly serialized
      const updateData = {
        ...hotspotData,
        specifications: hotspotData.specifications 
          ? JSON.stringify(hotspotData.specifications)
          : undefined
      };
      
      const { data, error } = await supabase
        .from('shop_look_hotspots')
        .update(updateData)
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
    onError: () => {
      toast.error('Failed to update hotspot');
    },
  });

  const deleteHotspotMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('shop_look_hotspots').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-look-hotspots'] });
      toast.success('Hotspot deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete hotspot');
    },
  });

  // --- Image click to place hotspot ---
  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!isCreating) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setNewHotspotPosition({ x, y });
    setFormData({
      x_position: x,
      y_position: y,
      is_active: true,
      display_order: hotspots.length,
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
    // Enhanced validation
    if (!formData.title?.trim()) {
      toast.error('Please select a product for this hotspot');
      return;
    }
    if (formData.x_position === undefined || formData.y_position === undefined) {
      toast.error('Please click on the image to set hotspot position');
      return;
    }
    if (!formData.image || formData.image === '/placeholder.svg') {
      toast.warning('Selected product has no image. Using default placeholder.');
    }

    // Show saving state
    if (isCreating && newHotspotPosition) {
      toast.info('Creating hotspot...');
      createHotspotMutation.mutate(formData);
    } else if (editingHotspot) {
      toast.info('Updating hotspot...');
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

  // Simplified product selection for hotspots
  const handleProductSelect = async (product: any) => {
    try {
      // Show loading state
      toast.info('Loading product details...');
      
      // Get complete product data
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', product.id)
        .single();

      if (error) throw error;

      // Extract specifications properly
      let specs = ['Premium Quality', 'Professional Grade', 'Industry Standard'];
      if (data.specifications) {
        if (Array.isArray(data.specifications)) {
          specs = data.specifications.map((s: any) => String(s));
        } else if (typeof data.specifications === 'object') {
          specs = Object.values(data.specifications).map((s: any) => String(s));
        }
      }

      // Add product dimensions to specifications if available
      if (data.dimensions) {
        specs.unshift(`Size: ${data.dimensions}`);
      }

      // Create comprehensive hotspot data
      const hotspotData = {
        title: data.name || 'Product',
        description: data.description || data.full_description || '',
        category: data.category || 'Laboratory Equipment',
        price: 'Contact for pricing', // Products table doesn't have price field
        image: data.thumbnail_path || data.overview_image_path || '/placeholder.svg',
        product_link: `/products/${data.id}`,
        specifications: specs,
        x_position: formData.x_position,
        y_position: formData.y_position,
        is_active: true,
        display_order: formData.display_order ?? hotspots.length,
      };

      setFormData((prev) => ({
        ...prev,
        ...hotspotData,
      }));

      toast.success('Product selected successfully!');
    } catch (err: any) {
      console.error('Error fetching product details:', err);
      toast.error('Failed to load product details. Please try again.');
    }
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

  return (
    <div className="space-y-6">
      {/* Enhanced Controls */}
      <div className="flex items-center justify-between">
        {!isCreating && !editingHotspot && (
          <div className="flex items-center gap-4">
            <Button onClick={handleCreateMode} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Hotspot
            </Button>
            {isCreating && (
              <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                💡 Click on the image to place your hotspot
              </div>
            )}
          </div>
        )}

        {(isCreating || editingHotspot) && (
          <div className="flex gap-2">
            <Button 
              onClick={handleSave} 
              size="sm"
              disabled={createHotspotMutation.isPending || updateHotspotMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {createHotspotMutation.isPending || updateHotspotMutation.isPending ? 'Saving...' : 'Save Hotspot'}
            </Button>
            <Button onClick={handleCancel} variant="outline" size="sm">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            {hotspots.length} Hotspots
          </Badge>
          {currentContent && (
            <Badge variant="secondary" className="text-xs">
              {currentContent.title}
            </Badge>
          )}
        </div>
      </div>

      {/* Background image - Same dimensions as home page */}
      <div className="relative">
        <img
          src={currentContent.background_image || '/api/placeholder/1200/800'}
          alt={currentContent.background_alt}
          className={`w-full h-[700px] lg:h-[800px] object-cover rounded-lg border ${isCreating ? 'cursor-crosshair' : ''}`}
          onClick={handleImageClick}
          onError={(e) => {
            e.currentTarget.src = '/api/placeholder/1200/800';
          }}
        />
        {/* Enhanced Hotspot markers */}
        {hotspots.map((hotspot) => (
          <div
            key={hotspot.id}
            className="absolute group cursor-pointer"
            style={{ left: `${hotspot.x_position}%`, top: `${hotspot.y_position}%`, transform: 'translate(-50%, -50%)' }}
            onClick={() => handleEdit(hotspot)}
          >
            {/* Hotspot marker */}
            <div className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold transition-all duration-200 group-hover:scale-110">
              {hotspot.display_order + 1}
            </div>
            
            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {hotspot.title}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
              </div>
            </div>
          </div>
        ))}

        {/* New hotspot preview */}
        {isCreating && newHotspotPosition && (
          <div
            className="absolute w-8 h-8 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold animate-pulse"
            style={{ left: `${newHotspotPosition.x}%`, top: `${newHotspotPosition.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <Plus className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Product selector */}
      {(isCreating && newHotspotPosition) || editingHotspot ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {editingHotspot ? 'Edit Hotspot Product' : 'Select Product for Hotspot'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <HotspotProductSelector
              onProductSelect={handleProductSelect}
              selectedProductId={formData.title ? 'selected' : undefined}
            />

            {/* Enhanced Selected product preview */}
            {formData.title && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img 
                      src={formData.image || '/placeholder.svg'} 
                      alt={formData.title} 
                      className="w-24 h-24 object-cover rounded-lg border"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                      <Check className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{formData.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{formData.category}</p>
                    <p className="text-green-600 font-semibold">{formData.price}</p>
                    {formData.description && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{formData.description}</p>
                    )}
                    {formData.specifications && formData.specifications.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Array.isArray(formData.specifications) 
                          ? formData.specifications.slice(0, 3).map((spec, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {spec}
                              </Badge>
                            ))
                          : Object.values(formData.specifications).slice(0, 3).map((spec, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {String(spec)}
                              </Badge>
                            ))
                        }
                      </div>
                    )}
                  </div>
                </div>

                {/* Description editor */}
                <div className="mt-4 pt-4 border-t border-green-200">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Custom Description (Override product description)
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter a custom description for this hotspot..."
                    className="mt-2 min-h-[80px]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This description will be shown in the Shop The Look section
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Hotspot Management List */}
      {hotspots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Manage Hotspots ({hotspots.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hotspots.map((hotspot, index) => (
                <div key={hotspot.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white text-sm font-bold flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{hotspot.title}</h4>
                      <p className="text-sm text-muted-foreground">{hotspot.category}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Position: {Math.round(hotspot.x_position)}%, {Math.round(hotspot.y_position)}%
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={hotspot.is_active} 
                      onCheckedChange={(checked) => {
                        updateHotspotMutation.mutate({ 
                          ...hotspot, 
                          is_active: checked 
                        });
                      }}
                    />
                    <Button
                      onClick={() => handleEdit(hotspot)}
                      size="sm"
                      variant="outline"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(hotspot.id)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
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
