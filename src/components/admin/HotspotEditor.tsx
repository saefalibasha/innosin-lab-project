// Fixed HotspotEditor.tsx

import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Target, Plus, Upload, Eye, EyeOff } from 'lucide-react';

// Manually define Json type if Supabase types don't export it
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
  const [editingHotspot, setEditingHotspot] = useState<Hotspot | null>(null);
  const [showHotspots, setShowHotspots] = useState(true);
  const imageRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: hotspots = [], isLoading } = useQuery({
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
    }
  }, [content]);

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
    saveHotspotMutation.mutate({ ...hotspot, x_position: x, y_position: y });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div
        className="relative w-full h-96 bg-cover bg-center border rounded"
        ref={imageRef}
        style={{ backgroundImage: `url(${backgroundImage})` }}
        onDragOver={e => e.preventDefault()}
        onDrop={handleHotspotDrop}
      >
        {showHotspots && hotspots.map(h => (
          <div
            key={h.id}
            draggable
            onDragStart={() => setDraggedHotspot(h.id)}
            className="absolute w-5 h-5 rounded-full bg-primary cursor-pointer"
            style={{ left: `${h.x_position}%`, top: `${h.y_position}%`, transform: 'translate(-50%, -50%)' }}
            title={h.title}
          >
            <Target className="text-white w-3 h-3" />
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-4">
        <Button onClick={() => setShowHotspots(!showHotspots)}>
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
            if (file) toast.info(`File selected: ${file.name}`);
          }}
        />
      </div>
    </div>
  );
};
