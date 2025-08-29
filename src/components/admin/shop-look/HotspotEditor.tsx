import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
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
  AlertCircle,
} from 'lucide-react';
import EnhancedSeriesSelector from '@/components/floorplan/EnhancedSeriesSelector';

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
      return data as Hotspot[];
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
    if (!formData.title?.trim()) {
      toast.error('Please select a product for this hotspot');
      return;
    }
    if (formData.x_position === undefined || formData.y_position === undefined) {
      toast.error('Please click on the image to set hotspot position');
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

  // ✅ new: fetch product details from Supabase products table
  const handleProductSelect = async (product: any) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', product.id)
        .single();

      if (error) throw error;

      setFormData((prev) => ({
        ...prev,
        title: data.name,
        description: data.description || '',
        category: data.category,
        price: data.price || 'Contact for pricing',
        image: data.thumbnail || data.image || '',
        product_link: `/products/${data.id}`,
        specifications: data.specifications || ['Premium Quality', 'Professional Grade'],
      }));
    } catch (err: any) {
      console.error('Error fetching product details:', err);
      toast.error('Failed to load product details from Supabase');
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
      {/* Controls */}
      <div className="flex items-center justify-between">
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

        <Badge variant="outline" className="flex items-center gap-1">
          <Target className="w-3 h-3" />
          {hotspots.length} Hotspots
        </Badge>
      </div>

      {/* Background image */}
      <div className="relative">
        <img
          src={currentContent.background_image || '/placeholder.svg'}
          alt={currentContent.background_alt}
          className={`w-full h-[600px] object-cover rounded-lg border ${isCreating ? 'cursor-crosshair' : ''}`}
          onClick={handleImageClick}
        />
        {/* Hotspot markers */}
        {hotspots.map((hotspot) => (
          <div
            key={hotspot.id}
            className="absolute w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer"
            style={{ left: `${hotspot.x_position}%`, top: `${hotspot.y_position}%`, transform: 'translate(-50%, -50%)' }}
            onClick={() => handleEdit(hotspot)}
          >
            {hotspot.display_order + 1}
          </div>
        ))}
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
            <EnhancedSeriesSelector
              onProductDrag={() => {}}
              currentTool="select"
              onProductUsed={(id) => console.log('Product used:', id)}
              onProductSelect={handleProductSelect}
            />

            {/* Selected product preview */}
            {formData.title && (
              <div className="flex items-center gap-4 mt-4 p-4 border rounded-lg">
                <img src={formData.image} alt={formData.title} className="w-20 h-20 object-cover rounded" />
                <div>
                  <h4 className="font-bold">{formData.title}</h4>
                  <p className="text-sm text-muted-foreground">{formData.category}</p>
                  <p className="text-green-600">{formData.price}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default HotspotEditor;
