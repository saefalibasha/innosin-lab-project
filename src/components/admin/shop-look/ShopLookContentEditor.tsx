
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Save, Loader2, Image, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

const ShopLookContentEditor: React.FC = () => {
  const [content, setContent] = useState<ShopLookContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('shop_look_content')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching content:', error);
        toast({
          title: "Error",
          description: "Failed to load content",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setContent(data);
      } else {
        // Create default content if none exists
        setContent({
          id: '',
          title: 'Shop The Look',
          title_highlight: 'Premium Laboratory Solutions',
          description: 'Discover our complete range of laboratory equipment and furniture designed for modern research facilities.',
          background_image: null,
          background_alt: 'Modern laboratory setup with premium equipment',
          is_active: true,
          display_order: 0,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check authentication
    if (!user || !isAdmin) {
      toast({
        title: "Authentication Required",
        description: "Please log in as an admin to upload images",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `shop-look-bg-${Date.now()}.${fileExt}`;
      
      console.log('Uploading file:', fileName, 'Size:', file.size, 'Type:', file.type);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('shop-look-images')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(uploadError.message);
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('shop-look-images')
        .getPublicUrl(fileName);

      if (content) {
        setContent({ ...content, background_image: urlData.publicUrl });
        toast({
          title: "Success",
          description: "Background image uploaded successfully",
        });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed", 
        description: error.message || "Failed to upload image. Please check your permissions.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!content) return;

    // Check authentication
    if (!user || !isAdmin) {
      toast({
        title: "Authentication Required",
        description: "Please log in as an admin to save changes",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const contentData = {
        title: content.title,
        title_highlight: content.title_highlight,
        description: content.description,
        background_image: content.background_image,
        background_alt: content.background_alt,
        is_active: content.is_active,
        display_order: content.display_order,
      };

      if (content.id) {
        // Update existing content
        const { error } = await supabase
          .from('shop_look_content')
          .update(contentData)
          .eq('id', content.id);

        if (error) throw error;
      } else {
        // Insert new content
        const { data, error } = await supabase
          .from('shop_look_content')
          .insert([contentData])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setContent({ ...content, id: data.id });
        }
      }

      toast({
        title: "Success",
        description: "Content saved successfully",
      });
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save content",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading content...</span>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Admin authentication required to manage Shop The Look content.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Shop The Look Content Settings</CardTitle>
          <CardDescription>
            Manage the content and background image for the Shop The Look section
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Main Title</Label>
              <Input
                id="title"
                value={content?.title || ''}
                onChange={(e) => content && setContent({ ...content, title: e.target.value })}
                placeholder="Shop The Look"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title_highlight">Title Highlight</Label>
              <Input
                id="title_highlight"
                value={content?.title_highlight || ''}
                onChange={(e) => content && setContent({ ...content, title_highlight: e.target.value })}
                placeholder="Premium Laboratory Solutions"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={content?.description || ''}
              onChange={(e) => content && setContent({ ...content, description: e.target.value })}
              placeholder="Describe the Shop The Look section"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <Label>Background Image</Label>
            {content?.background_image && (
              <div className="relative">
                <img
                  src={content.background_image}
                  alt={content.background_alt}
                  className="w-full h-48 object-cover rounded-md border"
                />
              </div>
            )}
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                disabled={uploading}
                onClick={() => document.getElementById('background-upload')?.click()}
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {uploading ? 'Uploading...' : 'Upload Background'}
              </Button>
              <input
                id="background-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <span className="text-sm text-muted-foreground">
                Recommended: 1920x1080px or larger
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="background_alt">Background Alt Text</Label>
            <Input
              id="background_alt"
              value={content?.background_alt || ''}
              onChange={(e) => content && setContent({ ...content, background_alt: e.target.value })}
              placeholder="Describe the background image for accessibility"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopLookContentEditor;
