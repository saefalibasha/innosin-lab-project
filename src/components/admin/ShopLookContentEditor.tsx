
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import StreamlinedFileUpload from '@/components/ui/StreamlinedFileUpload';

interface ShopLookContent {
  id: string;
  title: string;
  title_highlight: string;
  description: string;
  background_image: string;
  background_alt: string;
  is_active: boolean;
}

export const ShopLookContentEditor = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ShopLookContent>>({});
  const queryClient = useQueryClient();

  // Fetch content
  const { data: content, isLoading } = useQuery({
    queryKey: ['admin-shop-look-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_look_content')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      
      // If no content exists, return default values
      if (!data) {
        return {
          id: '',
          title: 'Shop',
          title_highlight: 'The Look',
          description: 'Explore our featured laboratory setup and discover the premium equipment that makes it exceptional.',
          background_image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=1920&q=80',
          background_alt: 'Modern Laboratory Setup',
          is_active: true
        };
      }
      return data;
    }
  });

  // Save content mutation
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
      queryClient.invalidateQueries({ queryKey: ['admin-shop-look-content'] });
      queryClient.invalidateQueries({ queryKey: ['shop-look-content'] });
      setIsEditing(false);
      setFormData({});
      toast.success('Content saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save content: ' + error.message);
    }
  });

  const handleEdit = () => {
    setFormData(content || {});
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({});
    setIsEditing(false);
  };

  const handleSave = () => {
    saveContentMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof ShopLookContent, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUploaded = (url: string) => {
    handleInputChange('background_image', url);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading content...</div>;
  }

  const displayData = isEditing ? formData : content;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Shop The Look Section Content</h3>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saveContentMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {saveContentMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Content
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Section Configuration</CardTitle>
            <Badge variant={displayData?.is_active ? 'default' : 'secondary'}>
              {displayData?.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Main Title</Label>
              {isEditing ? (
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Shop"
                />
              ) : (
                <div className="mt-1 p-2 bg-gray-50 rounded border">
                  {displayData?.title || 'Shop'}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="title_highlight">Highlighted Text</Label>
              {isEditing ? (
                <Input
                  id="title_highlight"
                  value={formData.title_highlight || ''}
                  onChange={(e) => handleInputChange('title_highlight', e.target.value)}
                  placeholder="The Look"
                />
              ) : (
                <div className="mt-1 p-2 bg-gray-50 rounded border text-sea font-medium">
                  {displayData?.title_highlight || 'The Look'}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            {isEditing ? (
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                placeholder="Explore our featured laboratory setup and discover the premium equipment that makes it exceptional."
              />
            ) : (
              <div className="mt-1 p-2 bg-gray-50 rounded border">
                {displayData?.description || 'Explore our featured laboratory setup and discover the premium equipment that makes it exceptional.'}
              </div>
            )}
          </div>

          {/* Background Image Upload/URL */}
          <div className="space-y-4">
            <Label>Background Image</Label>
            
            {isEditing ? (
              <div className="space-y-4">
                <StreamlinedFileUpload
                  onFileUploaded={handleFileUploaded}
                  acceptedTypes="image/*"
                  maxSizeMB={10}
                  currentImage={formData.background_image}
                />
                
                <div>
                  <Label htmlFor="background_image_url">Or enter image URL directly</Label>
                  <Input
                    id="background_image_url"
                    value={formData.background_image || ''}
                    onChange={(e) => handleInputChange('background_image', e.target.value)}
                    placeholder="/shop-the-look/modern-lab-setup.jpg"
                  />
                </div>
                
                <div>
                  <Label htmlFor="background_alt">Alt Text</Label>
                  <Input
                    id="background_alt"
                    value={formData.background_alt || ''}
                    onChange={(e) => handleInputChange('background_alt', e.target.value)}
                    placeholder="Modern Laboratory Setup"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  URL: {displayData?.background_image || '/shop-the-look/modern-lab-setup.jpg'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Alt: {displayData?.background_alt || 'Modern Laboratory Setup'}
                </div>
              </div>
            )}
          </div>

          {/* Background Image Preview */}
          <div>
            <Label>Background Image Preview</Label>
            <div className="mt-2 border rounded-lg overflow-hidden">
              <img
                src={displayData?.background_image || '/shop-the-look/modern-lab-setup.jpg'}
                alt={displayData?.background_alt || 'Modern Laboratory Setup'}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </div>
          </div>

          {/* Active Status */}
          {isEditing && (
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active ?? true}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          )}

          {/* Preview Section */}
          <div className="border-t pt-6">
            <Label>Live Preview</Label>
            <div className="mt-2 p-6 border rounded-lg bg-gradient-to-b from-white to-gray-50">
              <div className="text-center">
                <h2 className="text-3xl font-serif font-bold text-primary mb-4 tracking-tight">
                  {displayData?.title || 'Shop'} <span className="text-sea">{displayData?.title_highlight || 'The Look'}</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto font-light">
                  {displayData?.description || 'Explore our featured laboratory setup and discover the premium equipment that makes it exceptional.'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
