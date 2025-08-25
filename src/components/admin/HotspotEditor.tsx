import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Target, MousePointer, Move, Eye, EyeOff, Upload, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Json } from '@supabase/supabase-js';

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
  const imageRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

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
          ? hotspot.specifications
          : ['Premium Quality', 'Professional Grade', 'Industry Standard']
      })) as Hotspot[];
    }
  });

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

  useEffect(() => {
    if (content?.background_image) {
      setBackgroundImage(content.background_image);
    } else {
      setBackgroundImage('https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=1920&q=80');
    }
  }, [content]);

  const saveHotspotMutation = useMutation({
    mutationFn: async (hotspot: Partial<Hotspot>) => {
      const { id, specifications, ...rest } = hotspot;
      const formattedSpec = specifications as Json;
      const payload = { ...rest, specifications: formattedSpec };

      const { error } = id
        ? await supabase.from('shop_look_hotspots').update(payload).eq('id', id)
        : await supabase.from('shop_look_hotspots').insert(payload);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shop-look-hotspots'] });
      queryClient.invalidateQueries({ queryKey: ['shop-look-hotspots'] });
      setIsDialogOpen(false);
      setEditingHotspot(null);
      toast.success('Hotspot saved successfully');
    },
    onError: (error) => toast.error('Failed to save hotspot: ' + error.message)
  });

  const deleteHotspotMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('shop_look_hotspots').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shop-look-hotspots'] });
      queryClient.invalidateQueries({ queryKey: ['shop-look-hotspots'] });
      toast.success('Hotspot deleted successfully');
    },
    onError: (error) => toast.error('Failed to delete hotspot: ' + error.message)
  });

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `shop-look-background-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('shop-look-images').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('shop-look-images').getPublicUrl(fileName);
      const { error: updateError } = await supabase.from('shop_look_content').upsert({
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
    if (file) handleImageUpload(file);
  };

  const handleEdit = (hotspot: Hotspot) => {
    setEditingHotspot(hotspot);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setIsPositioning(true);
    toast.info('Click on the image where you want to place the hotspot');
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
    saveHotspotMutation.mutate({ ...hotspot, x_position: Math.round(x * 100) / 100, y_position: Math.round(y * 100) / 100 });
    setDraggedHotspot(null);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPositioning || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const newHotspot: Hotspot = {
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
  };

  if (isLoading) return <div className="text-center py-8">Loading hotspots...</div>;

  return (
    <div className="space-y-6">
      <div
        className="relative w-full h-[500px] border rounded-md overflow-hidden bg-cover bg-center"
        ref={imageRef}
        onClick={handleImageClick}
        onDragOver={handleHotspotDragOver}
        onDrop={handleHotspotDrop}
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {showHotspots && hotspots.map(h => (
          <div
            key={h.id}
            className="absolute w-6 h-6 bg-primary rounded-full cursor-pointer flex items-center justify-center"
            draggable
            onDragStart={(e) => handleHotspotDragStart(e, h.id)}
            onClick={() => handleEdit(h)}
            style={{
              left: `${h.x_position}%`,
              top: `${h.y_position}%`,
              transform: 'translate(-50%, -50%)',
            }}
            title={h.title}
          >
            <Target className="w-3 h-3 text-white" />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Button variant="default" onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add Hotspot
        </Button>

        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Background
        </Button>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <Button
          variant="ghost"
          onClick={() => setShowHotspots(!showHotspots)}
        >
          {showHotspots ? (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              Hide Hotspots
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Show Hotspots
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
