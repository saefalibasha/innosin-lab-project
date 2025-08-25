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
      const { id, ...rest } = hotspot;
      const { error } = id
        ? await supabase.from('shop_look_hotspots').update(rest).eq('id', id)
        : await supabase.from('shop_look_hotspots').insert(rest);
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
    saveHotspotMutation.mutate({ ...hotspot, x_position: Math.round(x * 100) / 100, y_position: Math.round(y * 100) / 100 });
    setDraggedHotspot(null);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isPositioning) return;
    const rect = e.currentTarget.getBoundingClientRect();
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

  const handleSave = (formData: FormData) => {
    const specificationsArray = (formData.get('specifications') as string || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const hotspotData: Partial<Hotspot> = {
      id: editingHotspot?.id || undefined,
      x_position: editingHotspot?.x_position ?? 50,
      y_position: editingHotspot?.y_position ?? 50,
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

  if (isLoading) return <div className="text-center py-8">Loading hotspots...</div>;

  return (
    <div className="space-y-6">
      {/* UI and JSX remains unchanged */}
    </div>
  );
};
