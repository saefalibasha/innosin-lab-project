import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Target, Upload, Eye, EyeOff, RotateCcw, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import StreamlinedFileUpload from '@/components/ui/StreamlinedFileUpload';

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

interface ShopLookContent {
  id: string;
  title: string;
  title_highlight: string;
  description: string;
  background_image: string;
  background_alt: string;
  is_active: boolean;
}

const HotspotEditor = () => {
  const [editingHotspot, setEditingHotspot] = useState<Hotspot | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPositioning, setIsPositioning] = useState(false);
  const [draggedHotspot, setDraggedHotspot] = useState<string | null>(null);
  const [showHotspots, setShowHotspots] = useState(true);
  const [formData, setFormData] = useState<Partial<ShopLookContent>>({});
  const imageRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: hotspots = [] } = useQuery({
    queryKey: ['admin-shop-look-hotspots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_look_hotspots')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data.map(h => ({
        ...h,
        specifications: Array.isArray(h.specifications) ? h.specifications : []
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
    },
    onSuccess: (data) => {
      if (data) setFormData(data);
    }
  });

  const saveHotspotMutation = useMutation({
    mutationFn: async (hotspot: Partial<Hotspot>) => {
      const { id, specifications, ...rest } = hotspot;
      const payload = { ...rest, specifications: specifications as Json };
      const { error } = id
        ? await supabase.from('shop_look_hotspots').update(payload).eq('id', id)
        : await supabase.from('shop_look_hotspots').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shop-look-hotspots'] });
      setIsDialogOpen(false);
      setEditingHotspot(null);
      toast.success('Hotspot saved successfully');
    },
    onError: (error) => toast.error('Failed to save hotspot: ' + error.message)
  });

  const saveContentMutation = useMutation({
    mutationFn: async (data: Partial<ShopLookContent>) => {
      if (content?.id) {
        const { error } = await supabase.from('shop_look_content').update(data).eq('id', content.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('shop_look_content').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-look-content'] });
      toast.success('Content saved');
    }
  });

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPositioning || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const newHotspot: Hotspot = {
      id: '', x_position: x, y_position: y,
      title: 'New', description: '', price: '',
      category: '', image: '', product_link: '',
      specifications: [], is_active: true, display_order: hotspots.length + 1
    };
    setEditingHotspot(newHotspot);
    setIsPositioning(false);
    setIsDialogOpen(true);
  };

  const handleHotspotDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleHotspotDrop = (e: React.DragEvent) => e.preventDefault();
  const handleHotspotDragStart = (e: React.DragEvent, id: string) => {
    setDraggedHotspot(id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleEdit = (hotspot: Hotspot) => {
    setEditingHotspot(hotspot);
    setIsDialogOpen(true);
  };

  const handleInputChange = (field: keyof ShopLookContent, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUploaded = (url: string) => {
    handleInputChange('background_image', url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Shop the Look Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Title"
            value={formData.title || ''}
            onChange={(e) => handleInputChange('title', e.target.value)}
          />
          <Input
            placeholder="Highlight"
            value={formData.title_highlight || ''}
            onChange={(e) => handleInputChange('title_highlight', e.target.value)}
          />
          <Textarea
            placeholder="Description"
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />
          <StreamlinedFileUpload
            acceptedTypes="image/*"
            maxSizeMB={10}
            currentImage={formData.background_image}
            onFileUploaded={handleFileUploaded}
          />
          <Button onClick={() => saveContentMutation.mutate(formData)}>Save Content</Button>
        </CardContent>
      </Card>

      <div className="relative w-full h-[500px] border rounded-md overflow-hidden bg-cover bg-center"
        ref={imageRef}
        onClick={handleImageClick}
        onDragOver={handleHotspotDragOver}
        onDrop={handleHotspotDrop}
        style={{ backgroundImage: `url(${formData.background_image})` }}
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
              transform: 'translate(-50%, -50%)'
            }}
            title={h.title}
          >
            <Target className="w-3 h-3 text-white" />
          </div>
        ))}
      </div>

      <Button variant="default" onClick={() => setIsPositioning(true)}>
        <Plus className="w-4 h-4 mr-2" /> Add Hotspot
      </Button>
    </div>
  );
};

export default HotspotEditor;
