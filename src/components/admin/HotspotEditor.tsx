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
import { Plus, Edit, Trash2, Target, MousePointer, Move, Eye, EyeOff, Upload, Image, Save, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Json } from '@supabase/supabase-js';
import StreamlinedFileUpload from '@/components/ui/StreamlinedFileUpload';

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

export const HotspotEditor = () => {
  const [editingHotspot, setEditingHotspot] = useState<Hotspot | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPositioning, setIsPositioning] = useState(false);
  const [draggedHotspot, setDraggedHotspot] = useState<string | null>(null);
  const [showHotspots, setShowHotspots] = useState(true);
  const [formData, setFormData] = useState<Partial<ShopLookContent>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string>('');
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
      return data.map(h => ({
        ...h,
        specifications: Array.isArray(h.specifications)
          ? h.specifications
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
      setFormData(content);
    }
  }, [content]);

  const handleInputChange = (field: keyof ShopLookContent, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUploaded = (url: string) => {
    handleInputChange('background_image', url);
  };

  const saveContentMutation = useMutation({
    mutationFn: async (contentData: Partial<ShopLookContent>) => {
      if (content?.id) {
        const { error } = await supabase
          .from('shop_look_content')
          .update(contentData)
          .eq('id', content.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('shop_look_content')
          .insert(contentData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-look-content'] });
      toast.success('Content saved successfully');
      setIsEditing(false);
    },
    onError: (error) => toast.error('Failed to save content: ' + error.message)
  });

  const handleSaveContent = () => {
    saveContentMutation.mutate(formData);
  };

  return (
    <div className="space-y-10">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Shop The Look Content</CardTitle>
          {isEditing ? (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <RotateCcw className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button onClick={handleSaveContent} disabled={saveContentMutation.isPending}>
                <Save className="w-4 h-4 mr-2" /> Save
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" /> Edit
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input value={formData.title || ''} onChange={(e) => handleInputChange('title', e.target.value)} />
                </div>
                <div>
                  <Label>Highlight</Label>
                  <Input value={formData.title_highlight || ''} onChange={(e) => handleInputChange('title_highlight', e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={formData.description || ''} onChange={(e) => handleInputChange('description', e.target.value)} />
              </div>
              <div>
                <Label>Background Image</Label>
                <StreamlinedFileUpload onFileUploaded={handleFileUploaded} acceptedTypes="image/*" maxSizeMB={10} currentImage={formData.background_image} />
              </div>
              <div>
                <Label>Alt Text</Label>
                <Input value={formData.background_alt || ''} onChange={(e) => handleInputChange('background_alt', e.target.value)} />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="is_active" checked={formData.is_active ?? true} onCheckedChange={(checked) => handleInputChange('is_active', checked)} />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold">{content?.title} <span className="text-primary">{content?.title_highlight}</span></h2>
              <p className="text-muted-foreground">{content?.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hotspot Editor remains unchanged visually */}
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
        <Button variant="default" onClick={() => {
          setIsPositioning(true);
          toast.info('Click on the image to place hotspot');
        }}>
          <Plus className="w-4 h-4 mr-2" /> Add Hotspot
        </Button>

        <Button variant="ghost" onClick={() => setShowHotspots(!showHotspots)}>
          {showHotspots ? <><EyeOff className="w-4 h-4 mr-2" /> Hide Hotspots</> : <><Eye className="w-4 h-4 mr-2" /> Show Hotspots</>}
        </Button>
      </div>
    </div>
  );
};
