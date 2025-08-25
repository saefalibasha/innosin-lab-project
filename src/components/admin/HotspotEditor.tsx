import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload, Target, Eye, EyeOff } from 'lucide-react';

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

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
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [draggedHotspot, setDraggedHotspot] = useState<string | null>(null);
  const [showHotspots, setShowHotspots] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch hotspots
  const { data: hotspots = [], isLoading: isLoadingHotspots } = useQuery({
    queryKey: ['admin-shop-look-hotspots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_look_hotspots')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data.map(h => ({
        ...h,
        specifications: Array.isArray(h.specifications) ? h.specifications : []
      })) as Hotspot[];
    }
  });

  // Fetch latest background image
  const { isLoading: isLoadingBackground } = useQuery({
    queryKey: ['latest-shop-look-background'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_look_images')
        .select('*')
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data?.url) {
        setBackgroundImage(data.url);
      }
      return data;
    }
  });

  // Save hotspot position
  const saveHotspotMutation = useMutation({
    mutationFn: async (hotspot: Hotspot) => {
      const { id, ...rest } = hotspot;
      const payload = { ...rest, specifications: hotspot.specifications as Json };

      const { error } = id
        ? await supabase.from('shop_look_hotspots').update(payload).eq('id', id)
        : await supabase.from('shop_look_hotspots').insert(payload);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shop-look-hotspots'] });
      toast.success('Hotspot saved');
    },
    onError: err => toast.error(err.message)
  });

  const handleHotspotDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedHotspot || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const hotspot = hotspots.find(h => h.id === draggedHotspot);
    if (!hotspot) return;

    saveHotspotMutation.mutate({
      ...hotspot,
      x_position: Math.round(x * 100) / 100,
      y_position: Math.round(y * 100) / 100
    });

    setDraggedHotspot(null);
  };

  const handleImageUpload = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please select a valid image');
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `background-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase
        .storage
        .from('shop-look-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('shop-look-images').getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      // Save URL to shop_look_images table
      const { error: dbError } = await supabase
        .from('shop_look_images')
        .insert({
          url: publicUrl,
          alt: 'Uploaded background image',
          filename: file.name
        });

      if (dbError) throw dbError;

      setBackgroundImage(publicUrl);
      queryClient.invalidateQueries({ queryKey: ['latest-shop-look-background'] });
      toast.success('Background image uploaded successfully');
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message);
    }
  };

  if (isLoadingHotspots || isLoadingBackground) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Background display with hotspots */}
      <div
        className="relative w-full h-[500px] bg-cover bg-center border rounded"
        ref={imageRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleHotspotDrop}
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {showHotspots &&
          hotspots.map(h => (
            <div
              key={h.id}
              draggable
              onDragStart={() => setDraggedHotspot(h.id)}
              className="absolute w-6 h-6 rounded-full bg-primary cursor-pointer"
              style={{
                left: `${h.x_position}%`,
                top: `${h.y_position}%`,
                transform: 'translate(-50%, -50%)'
              }}
              title={h.title}
            >
              <Target className="text-white w-3 h-3" />
            </div>
          ))}
      </div>

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
      </div>
    </div>
  );
};
