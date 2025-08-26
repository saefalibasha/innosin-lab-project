
import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Target, Plus, Upload, Eye, EyeOff, Edit, Trash2, Move } from 'lucide-react';
import { toast } from 'sonner';

// Local Json type (so we don't depend on Supabase types)
type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

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
  filename?: string;
  alt?: string;
  created_at: string;
  created_by?: string;
}

const HotspotEditor: React.FC = () => {
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [draggedHotspot, setDraggedHotspot] = useState<string | null>(null);
  const [showHotspots, setShowHotspots] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHotspot, setEditingHotspot] = useState<Partial<Hotspot> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // 1) Fetch hotspots
  const { data: hotspots = [], isLoading: isLoadingHotspots } = useQuery({
    queryKey: ['admin-shop-look-hotspots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_look_hotspots')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return (data ?? []).map((h) => ({
        ...h,
        specifications: Array.isArray(h.specifications) ? h.specifications : []
      })) as Hotspot[];
    }
  });

  // 2) Fetch latest background image from shop_look_images
  useQuery({
    queryKey: ['latest-shop-look-background'],
    queryFn: async () => {
      // For now, we'll use a workaround since the table might not exist yet
      try {
        const { data, error } = await supabase
          .from('shop_look_images')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (error) {
          console.warn('shop_look_images table not found, using fallback');
          return null;
        }
        
        const imageData = data as ShopLookImage | null;
        if (imageData?.url) setBackgroundImage(imageData.url);
        return imageData;
      } catch (err) {
        console.warn('Error fetching shop look images:', err);
        return null;
      }
    }
  });

  // 3) CRUD: save (insert/update) hotspot
  const saveHotspotMutation = useMutation({
    mutationFn: async (hotspot: Partial<Hotspot>) => {
      const { id, specifications, ...rest } = hotspot;
      const payload: any = { ...rest, specifications: (specifications ?? []) as Json };

      if (id) {
        const { error } = await supabase.from('shop_look_hotspots').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        // Minimal required fields for insert
        const toInsert = {
          title: payload.title ?? 'New Product',
          description: payload.description ?? '',
          price: payload.price ?? 'Contact for pricing',
          category: payload.category ?? 'Laboratory Equipment',
          image: payload.image ?? '',
          product_link: payload.product_link ?? '/products',
          specifications: payload.specifications ?? [],
          x_position: payload.x_position ?? 50,
          y_position: payload.y_position ?? 50,
          is_active: payload.is_active ?? true,
          display_order: payload.display_order ?? (hotspots.length + 1)
        };
        const { error } = await supabase.from('shop_look_hotspots').insert(toInsert);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shop-look-hotspots'] });
      setIsDialogOpen(false);
      setEditingHotspot(null);
      toast.success('Hotspot saved');
    },
    onError: (err: any) => toast.error(err.message)
  });

  // 4) Delete hotspot
  const deleteHotspotMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('shop_look_hotspots').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shop-look-hotspots'] });
      toast.success('Hotspot deleted');
    },
    onError: (err: any) => toast.error(err.message)
  });

  // 5) Drag → drop to reposition
  const handleHotspotDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedHotspot || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const hotspot = hotspots.find((h) => h.id === draggedHotspot);
    if (!hotspot) return;

    saveHotspotMutation.mutate({
      ...hotspot,
      x_position: Math.round(x * 100) / 100,
      y_position: Math.round(y * 100) / 100
    });

    setDraggedHotspot(null);
  };

  // 6) Upload background image to Storage bucket, then insert URL into shop_look_images
  const handleImageUpload = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please select a valid image');
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `background-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('shop-look-images')
        .upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: pub } = supabase.storage.from('shop-look-images').getPublicUrl(fileName);
      const publicUrl = pub.publicUrl;

      // Try to insert row into shop_look_images (with fallback for missing table)
      try {
        const insertData = {
          url: publicUrl,
          filename: file.name,
          alt: 'Shop The Look Background'
        };
        
        const { error: dbError } = await supabase
          .from('shop_look_images')
          .insert(insertData);
        
        if (dbError) throw dbError;
      } catch (dbErr) {
        console.warn('Could not save to shop_look_images table:', dbErr);
        // Continue anyway - the image is uploaded to storage
      }

      setBackgroundImage(publicUrl);
      queryClient.invalidateQueries({ queryKey: ['latest-shop-look-background'] });
      toast.success('Background image uploaded');
    } catch (e: any) {
      toast.error('Upload failed: ' + e.message);
    }
  };

  if (isLoadingHotspots) {
    return <div className="text-center py-8">Loading hotspots…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex gap-4">
        <Button onClick={() => setShowHotspots(!showHotspots)} variant="outline">
          {showHotspots ? <EyeOff className="mr-2" /> : <Eye className="mr-2" />}
          {showHotspots ? 'Hide Hotspots' : 'Show Hotspots'}
        </Button>

        <Button onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2" /> Upload Background
        </Button>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
          }}
        />

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2" /> Add Hotspot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Hotspot</DialogTitle>
            </DialogHeader>
            <HotspotForm
              hotspot={editingHotspot}
              onSave={(values) => saveHotspotMutation.mutate(values)}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingHotspot(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Background with draggable hotspots */}
      <Card>
        <CardHeader>
          <CardTitle>Visual Hotspot Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="relative w-full h-[560px] bg-cover bg-center rounded border"
            ref={imageRef}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleHotspotDrop}
            style={{ backgroundImage: `url(${backgroundImage})` }}
          >
            {showHotspots &&
              hotspots.map((h) => (
                <div
                  key={h.id}
                  draggable
                  onDragStart={() => setDraggedHotspot(h.id)}
                  className="absolute group"
                  style={{
                    left: `${h.x_position}%`,
                    top: `${h.y_position}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow">
                    <Target className="w-3.5 h-3.5" />
                  </div>

                  <div className="group-hover:block absolute left-10 top-1/2 -translate-y-1/2 bg-white border rounded shadow-md p-2 w-64 z-10 hidden">
                    <div className="font-semibold">{h.title}</div>
                    <div className="text-sm text-gray-500">{h.description}</div>
                    <div className="mt-2 flex items-center justify-end gap-2">
                      <Badge>{h.category}</Badge>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Hotspot</DialogTitle>
                          </DialogHeader>
                          <HotspotForm
                            hotspot={h}
                            onSave={(values) => saveHotspotMutation.mutate(values)}
                            onCancel={() => {
                              setIsDialogOpen(false);
                              setEditingHotspot(null);
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this hotspot?')) {
                            deleteHotspotMutation.mutate(h.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface HotspotFormProps {
  hotspot?: Partial<Hotspot>;
  onSave: (values: Partial<Hotspot>) => void;
  onCancel: () => void;
}

const HotspotForm: React.FC<HotspotFormProps> = ({ hotspot, onSave, onCancel }) => {
  const [values, setValues] = useState<Partial<Hotspot>>({
    title: hotspot?.title || '',
    description: hotspot?.description || '',
    price: hotspot?.price || '',
    category: hotspot?.category || '',
    image: hotspot?.image || '',
    product_link: hotspot?.product_link || '',
    is_active: hotspot?.is_active ?? true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSwitchChange = (checked: boolean) => {
    setValues({ ...values, is_active: checked });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...values, id: hotspot?.id });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          type="text"
          id="title"
          name="title"
          value={values.title}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={values.description}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="price">Price</Label>
        <Input
          type="text"
          id="price"
          name="price"
          value={values.price}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Input
          type="text"
          id="category"
          name="category"
          value={values.category}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="image">Image URL</Label>
        <Input
          type="text"
          id="image"
          name="image"
          value={values.image}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="product_link">Product Link</Label>
        <Input
          type="text"
          id="product_link"
          name="product_link"
          value={values.product_link}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="is_active">Active</Label>
        <Switch
          id="is_active"
          checked={values.is_active ?? true}
          onCheckedChange={handleSwitchChange}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

export default HotspotEditor;
