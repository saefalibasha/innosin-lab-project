
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Upload, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface ShopLookContent {
  id: string;
  title: string;
  title_highlight: string;
  description: string;
  background_image: string | null;
  background_alt: string;
  is_active: boolean;
  display_order: number;
}

const ShopLookContentEditor = () => {
  const [uploadingImage, setUploadingImage] = useState(false);
  const queryClient = useQueryClient();

  const { data: content, isLoading } = useQuery({
    queryKey: ['shop-look-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_look_content')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  const updateContentMutation = useMutation({
    mutationFn: async (updatedContent: Partial<ShopLookContent>) => {
      if (!content?.id) {
        // Create new content if none exists
        const { data, error } = await supabase
          .from('shop_look_content')
          .insert([updatedContent])
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        // Update existing content
        const { data, error } = await supabase
          .from('shop_look_content')
          .update(updatedContent)
          .eq('id', content.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-look-content'] });
      toast.success('Content updated successfully');
    },
    onError: (error) => {
      console.error('Error updating content:', error);
      toast.error('Failed to update content');
    }
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // Upload to shop-look-images bucket
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `backgrounds/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('shop-look-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('shop-look-images')
        .getPublicUrl(filePath);

      // Update content with new background image
      await updateContentMutation.mutateAsync({
        background_image: publicUrl
      });

      toast.success('Background image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleContentUpdate = (field: keyof ShopLookContent, value: any) => {
    if (!content) return;
    
    updateContentMutation.mutate({
      [field]: value
    });
  };

  const handleSave = () => {
    if (!content) return;
    
    updateContentMutation.mutate({
      title: content.title,
      title_highlight: content.title_highlight,
      description: content.description,
      background_alt: content.background_alt,
      is_active: content.is_active
    });
  };

  if (isLoading) {
    return <div className="p-4">Loading content...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Shop The Look Content Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title Settings */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Main Title</Label>
            <Input
              id="title"
              value={content?.title || ''}
              onChange={(e) => handleContentUpdate('title', e.target.value)}
              placeholder="Shop The Look"
            />
          </div>
          
          <div>
            <Label htmlFor="title-highlight">Title Highlight</Label>
            <Input
              id="title-highlight"
              value={content?.title_highlight || ''}
              onChange={(e) => handleContentUpdate('title_highlight', e.target.value)}
              placeholder="Premium Laboratory Solutions"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={content?.description || ''}
              onChange={(e) => handleContentUpdate('description', e.target.value)}
              placeholder="Discover our complete range..."
              rows={3}
            />
          </div>
        </div>

        {/* Background Image */}
        <div className="space-y-4">
          <Label>Background Image</Label>
          {content?.background_image && (
            <div className="relative">
              <img
                src={content.background_image}
                alt={content.background_alt || 'Background'}
                className="w-full h-48 object-cover rounded-lg border"
              />
              <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Button variant="secondary" size="sm">
                  Change Image
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={uploadingImage}
              onClick={() => document.getElementById('background-upload')?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploadingImage ? 'Uploading...' : 'Upload Background Image'}
            </Button>
            <input
              id="background-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div>
            <Label htmlFor="background-alt">Image Alt Text</Label>
            <Input
              id="background-alt"
              value={content?.background_alt || ''}
              onChange={(e) => handleContentUpdate('background_alt', e.target.value)}
              placeholder="Modern laboratory setup with premium equipment"
            />
          </div>
        </div>

        {/* Settings */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              checked={content?.is_active || false}
              onCheckedChange={(checked) => handleContentUpdate('is_active', checked)}
            />
            <Label>Active</Label>
            {content?.is_active ? (
              <Eye className="w-4 h-4 text-green-600" />
            ) : (
              <EyeOff className="w-4 h-4 text-gray-400" />
            )}
          </div>

          <Button
            onClick={handleSave}
            disabled={updateContentMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            {updateContentMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShopLookContentEditor;
