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
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Trash2, Target, MousePointer, Move, Eye, EyeOff, Upload, Image } from 'lucide-react';
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
  const [draggedHotspot, setDraggedHotspot] = useState<string | null>(null);
  const [showHotspots, setShowHotspots] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      
      return data.map(hotspot => ({
        ...hotspot,
        specifications: Array.isArray(hotspot.specifications) 
          ? hotspot.specifications as string[]
          : ['Premium Quality', 'Professional Grade', 'Industry Standard']
      })) as Hotspot[];
    }
  });

  // Fetch shop look content for background image
  const { data: content } = useQuery({
    queryKey: ['shop-look-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_look_content')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  // Set background image when content changes
  React.useEffect(() => {
    if (content?.background_image) {
      setBackgroundImage(content.background_image);
    } else {
      setBackgroundImage('https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=1920&q=80');
    }
  }, [content]);

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
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `shop-look-background-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('shop-look-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('shop-look-images')
        .getPublicUrl(fileName);

      // Update the shop look content with new background image
      const { error: updateError } = await supabase
        .from('shop_look_content')
        .upsert({
          id: content?.id || crypto.randomUUID(),
          background_image: publicUrl,
          background_alt: 'Shop The Look Background',
          title: content?.title || 'Shop',
          title_highlight: content?.title_highlight || 'The Look',
          description: content?.description || 'Explore our featured laboratory setup.',
          is_active: true
        });

      if (updateError) throw updateError;

      setBackgroundImage(publicUrl);
      queryClient.invalidateQueries({ queryKey: ['shop-look-content'] });
      toast.success('Background image updated successfully');
    } catch (error: any) {
      toast.error('Failed to upload image: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

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
    setIsPositioning(true);
    toast.info('Click on the image where you want to place the hotspot');
  };

  const handleEditPosition = (hotspot: Hotspot) => {
    setEditingHotspot(hotspot);
    setIsPositioning(true);
    toast.info('Click on the image to reposition this hotspot');
  };

  const handleHotspotDragStart = (e: React.DragEvent, hotspotId: string) => {
    setDraggedHotspot(hotspotId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleHotspotDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleHotspotDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!draggedHotspot || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const hotspot = hotspots.find(h => h.id === draggedHotspot);
    if (!hotspot) return;
    
    const updatedHotspot = {
      ...hotspot,
      x_position: Math.round(x * 100) / 100,
      y_position: Math.round(y * 100) / 100
    };
    
    saveHotspotMutation.mutate(updatedHotspot);
    setDraggedHotspot(null);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isPositioning) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Create new hotspot at clicked position
    const newHotspot = {
      id: '',
      x_position: Math.round(x * 100) / 100,
      y_position: Math.round(y * 100) / 100,
      title: 'New Product',
      description: 'Enter product description',
      price: 'Contact for pricing',
      category: 'Laboratory Equipment',
      image: '',
      product_link: '/products',
      specifications: ['Premium Quality', 'Professional Grade', 'Industry Standard'],
      is_active: true,
      display_order: hotspots.length + 1
    };
    
    setEditingHotspot(newHotspot);
    setIsPositioning(false);
    setIsDialogOpen(true);
    toast.success('Click on the image to position the hotspot, then fill in product details.');
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
      {/* Controls */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Shop The Look Management</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Upload className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Image className="w-4 h-4 mr-2" />
            )}
            {isUploading ? 'Uploading...' : 'Change Background'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHotspots(!showHotspots)}
          >
            {showHotspots ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showHotspots ? 'Hide' : 'Show'} Hotspots
          </Button>
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
                      src={backgroundImage}
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
      </div>

      {/* Main Visual Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Visual Hotspot Editor
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {isPositioning 
              ? "Click anywhere on the image to place a new hotspot" 
              : "Drag hotspots to reposition them, or click 'Add Hotspot' to create new ones"
            }
          </p>
        </CardHeader>
        <CardContent>
          <div 
            className="relative border rounded-lg overflow-hidden"
            onDragOver={handleHotspotDragOver}
            onDrop={handleHotspotDrop}
          >
            <img
              ref={imageRef}
              src={backgroundImage}
              alt="Shop The Look Background"
              className={`w-full h-[600px] object-cover ${isPositioning ? 'cursor-crosshair' : ''}`}
              onClick={handleImageClick}
            />
            
            {/* Overlay for positioning mode */}
            {isPositioning && (
              <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center pointer-events-none">
                <div className="bg-white/95 px-6 py-4 rounded-lg shadow-lg">
                  <MousePointer className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-lg font-medium">Click to place hotspot</p>
                  <p className="text-sm text-muted-foreground">Choose where to position your product</p>
                </div>
              </div>
            )}
            
            {/* Existing Hotspots */}
            {showHotspots && hotspots.map((hotspot) => (
              <div
                key={hotspot.id}
                className="absolute group cursor-move"
                style={{
                  left: `${hotspot.x_position}%`,
                  top: `${hotspot.y_position}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                draggable
                onDragStart={(e) => handleHotspotDragStart(e, hotspot.id)}
              >
                <div className="w-8 h-8 bg-white border-4 border-blue-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-200 animate-pulse hover:animate-none">
                  <Plus className="w-4 h-4 text-blue-500" />
                </div>
                
                {/* Hotspot Info Popup */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-lg border p-3 min-w-[200px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                  <h4 className="font-medium text-sm">{hotspot.title}</h4>
                  <p className="text-xs text-muted-foreground">{hotspot.category}</p>
                  <p className="text-xs text-blue-600 font-medium">{hotspot.price}</p>
                  <div className="flex gap-1 mt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-6 px-2 text-xs"
                      onClick={() => handleEdit(hotspot)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                      onClick={() => deleteHotspotMutation.mutate(hotspot.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hotspot List */}
      <div className="grid gap-4">
        <h4 className="text-md font-semibold">Hotspot List ({hotspots.length})</h4>
        {hotspots.map((hotspot) => (
          <Card key={hotspot.id} className={`transition-all ${!hotspot.is_active ? 'opacity-60' : ''}`}>
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
                    <Badge variant="outline">Order: {hotspot.display_order}</Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleEditPosition(hotspot)}>
                    <Move className="w-4 h-4" />
                  </Button>
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
                  {hotspot.specifications.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {hotspot.specifications.slice(0, 3).map((spec, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {hotspot.specifications.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{hotspot.specifications.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
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
        
        {hotspots.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No hotspots yet</h3>
              <p className="text-muted-foreground mb-4">
                Click "Add Hotspot" to start adding interactive product markers to your image.
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Hotspot
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};