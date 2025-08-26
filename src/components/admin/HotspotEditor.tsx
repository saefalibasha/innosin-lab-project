import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Save, RotateCcw, Plus, Trash2, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ShopLookImage {
  id: string;
  url: string;
  filename: string;
  alt: string;
}

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
  specifications: string[] | null;
  is_active: boolean | null;
  display_order: number | null;
}

export const HotspotEditor = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editingHotspot, setEditingHotspot] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Hotspot>>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const queryClient = useQueryClient();

  // Fetch images
  const { data: images = [], isLoading: imagesLoading } = useQuery({
    queryKey: ['shop-look-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_look_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(img => ({
        id: img.id,
        url: img.url || '',
        filename: img.filename || '',
        alt: img.alt || ''
      })) as ShopLookImage[];
    }
  });

  // Fetch hotspots
  const { data: hotspots = [], isLoading: hotspotsLoading } = useQuery({
    queryKey: ['admin-shop-look-hotspots'],
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
      if (editingHotspot) {
        const { error } = await supabase
          .from('shop_look_hotspots')
          .update(hotspotData)
          .eq('id', editingHotspot);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('shop_look_hotspots')
          .insert(hotspotData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shop-look-hotspots'] });
      queryClient.invalidateQueries({ queryKey: ['shop-look-hotspots'] });
      setEditingHotspot(null);
      setFormData({});
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

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `shop-look/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('shop-look-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('shop-look-images')
      .getPublicUrl(filePath);

    // Save to database
    const { error: dbError } = await supabase
      .from('shop_look_images')
      .insert({
        url: publicUrl,
        filename: fileName,
        alt: file.name
      });

    if (dbError) throw dbError;

    return publicUrl;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      await uploadImage(file);
      queryClient.invalidateQueries({ queryKey: ['shop-look-images'] });
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!selectedImage) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setFormData({
      x_position: x,
      y_position: y,
      title: '',
      description: '',
      price: '',
      category: 'Laboratory Equipment',
      specifications: ['Premium Quality', 'Professional Grade'],
      is_active: true,
      display_order: hotspots.length + 1
    });
    setEditingHotspot(null);
  };

  const handleEdit = (hotspot: Hotspot) => {
    setFormData({
      ...hotspot,
      specifications: Array.isArray(hotspot.specifications) 
        ? hotspot.specifications 
        : ['Premium Quality', 'Professional Grade']
    });
    setEditingHotspot(hotspot.id);
  };

  const handleCancel = () => {
    setFormData({});
    setEditingHotspot(null);
  };

  const handleSave = () => {
    if (!formData.title || formData.x_position === undefined || formData.y_position === undefined) {
      toast.error('Please fill in all required fields');
      return;
    }

    saveHotspotMutation.mutate(formData);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this hotspot?')) {
      deleteHotspotMutation.mutate(id);
    }
  };

  const handleInputChange = (field: keyof Hotspot, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSpecificationChange = (index: number, value: string) => {
    const specs = Array.isArray(formData.specifications) ? [...formData.specifications] : [];
    specs[index] = value;
    setFormData(prev => ({ ...prev, specifications: specs }));
  };

  const addSpecification = () => {
    const specs = Array.isArray(formData.specifications) ? [...formData.specifications] : [];
    specs.push('');
    setFormData(prev => ({ ...prev, specifications: specs }));
  };

  const removeSpecification = (index: number) => {
    const specs = Array.isArray(formData.specifications) ? [...formData.specifications] : [];
    specs.splice(index, 1);
    setFormData(prev => ({ ...prev, specifications: specs }));
  };

  if (imagesLoading || hotspotsLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Shop The Look Hotspot Editor</h3>
        <div className="flex space-x-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('image-upload')?.click()}
            disabled={uploadingImage}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploadingImage ? 'Uploading...' : 'Upload Image'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Selection and Editor */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Background Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className={`relative cursor-pointer border-2 rounded-lg overflow-hidden ${
                      selectedImage === image.url ? 'border-primary' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedImage(image.url)}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-20 object-cover"
                    />
                    {selectedImage === image.url && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <Badge>Selected</Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedImage && (
            <Card>
              <CardHeader>
                <CardTitle>Click to Add Hotspot</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt="Background"
                    className="w-full h-64 object-cover cursor-crosshair"
                    onClick={handleImageClick}
                  />
                  {hotspots.map((hotspot) => (
                    <Button
                      key={hotspot.id}
                      className="absolute w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-lg p-0"
                      style={{
                        left: `${hotspot.x_position}%`,
                        top: `${hotspot.y_position}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(hotspot);
                      }}
                    >
                      <Plus className="w-3 h-3 text-white" />
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Hotspot Form */}
        <div className="space-y-4">
          {(formData.x_position !== undefined || editingHotspot) && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    {editingHotspot ? 'Edit Hotspot' : 'New Hotspot'}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saveHotspotMutation.isPending}>
                      <Save className="w-4 h-4 mr-2" />
                      {saveHotspotMutation.isPending ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="x_position">X Position (%)</Label>
                    <Input
                      id="x_position"
                      type="number"
                      value={formData.x_position || ''}
                      onChange={(e) => handleInputChange('x_position', parseFloat(e.target.value))}
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="y_position">Y Position (%)</Label>
                    <Input
                      id="y_position"
                      type="number"
                      value={formData.y_position || ''}
                      onChange={(e) => handleInputChange('y_position', parseFloat(e.target.value))}
                      step="0.1"
                    />
                  </div>
                </div>

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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    placeholder="Product description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category || ''}
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Laboratory Equipment">Laboratory Equipment</SelectItem>
                        <SelectItem value="Safety Equipment">Safety Equipment</SelectItem>
                        <SelectItem value="Storage Solutions">Storage Solutions</SelectItem>
                        <SelectItem value="Workbenches">Workbenches</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="product_link">Product Link</Label>
                  <Input
                    id="product_link"
                    value={formData.product_link || ''}
                    onChange={(e) => handleInputChange('product_link', e.target.value)}
                    placeholder="/products/product-name"
                  />
                </div>

                <div>
                  <Label>Specifications</Label>
                  <div className="space-y-2">
                    {(Array.isArray(formData.specifications) ? formData.specifications : []).map((spec, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={spec}
                          onChange={(e) => handleSpecificationChange(index, e.target.value)}
                          placeholder="Specification"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeSpecification(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addSpecification}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Specification
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active ?? true}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <div>
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order || ''}
                    onChange={(e) => handleInputChange('display_order', parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Hotspots List */}
          <Card>
            <CardHeader>
              <CardTitle>Existing Hotspots ({hotspots.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {hotspots.map((hotspot) => (
                  <div
                    key={hotspot.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{hotspot.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Position: {hotspot.x_position.toFixed(1)}%, {hotspot.y_position.toFixed(1)}%
                      </div>
                      <div className="flex gap-1 mt-1">
                        <Badge variant={hotspot.is_active ? 'default' : 'secondary'}>
                          {hotspot.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {hotspot.category && (
                          <Badge variant="outline">{hotspot.category}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(hotspot)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(hotspot.id)}
                        disabled={deleteHotspotMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {hotspots.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No hotspots created yet. Click on an image to add one.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
