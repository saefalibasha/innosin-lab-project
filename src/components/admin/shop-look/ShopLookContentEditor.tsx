
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Upload, Save, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ShopLookContent {
  id?: string;
  title: string;
  title_highlight: string;
  description: string;
  background_image: string | null;
  background_alt: string;
  is_active: boolean;
  display_order?: number;
}

const ShopLookContentEditor = () => {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: content, isLoading, error } = useQuery({
    queryKey: ['shop-look-content'],
    queryFn: async () => {
      console.log('Fetching shop look content...');
      const { data, error } = await supabase
        .from('shop_look_content')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching content:', error);
        throw error;
      }
      console.log('Fetched content:', data);
      return data;
    }
  });

  const updateContentMutation = useMutation({
    mutationFn: async (updatedContent: Partial<ShopLookContent>) => {
      console.log('Updating content with:', updatedContent);
      
      if (!content?.id) {
        // Create new content if none exists
        const dataToInsert = {
          title: updatedContent.title || 'Shop The Look',
          title_highlight: updatedContent.title_highlight || 'Premium Laboratory Solutions',
          description: updatedContent.description || 'Discover our complete range of laboratory equipment and furniture designed for modern research facilities.',
          background_image: updatedContent.background_image || null,
          background_alt: updatedContent.background_alt || 'Modern laboratory setup with premium equipment',
          is_active: updatedContent.is_active ?? true,
          display_order: updatedContent.display_order ?? 0
        };
        
        const { data, error } = await supabase
          .from('shop_look_content')
          .insert(dataToInsert)
          .select()
          .single();
        
        if (error) {
          console.error('Error creating content:', error);
          throw error;
        }
        console.log('Created content:', data);
        return data;
      } else {
        // Update existing content
        const { data, error } = await supabase
          .from('shop_look_content')
          .update(updatedContent)
          .eq('id', content.id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating content:', error);
          throw error;
        }
        console.log('Updated content:', data);
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-look-content'] });
      toast.success('Content updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating content:', error);
      toast.error(`Failed to update content: ${error.message}`);
    }
  });

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file (JPG, PNG, GIF, WebP)';
    }
    
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }
    
    return null;
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setUploadingImage(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      console.log('Starting image upload:', { name: file.name, size: file.size, type: file.type });
      
      // Generate clean filename with timestamp
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `shop-look-bg-${Date.now()}.${fileExt}`;
      const filePath = `backgrounds/${fileName}`;

      setUploadProgress(25);

      // Check if bucket exists and user has access
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        console.error('Error listing buckets:', bucketError);
        throw new Error(`Storage access error: ${bucketError.message}`);
      }

      const shopLookBucket = buckets?.find(bucket => bucket.name === 'shop-look-images');
      if (!shopLookBucket) {
        throw new Error('Storage bucket "shop-look-images" not found. Please contact administrator.');
      }

      console.log('Found bucket:', shopLookBucket);
      setUploadProgress(40);

      // Upload to Supabase Storage with proper options
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('shop-look-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        
        // Provide more specific error messages
        if (uploadError.message?.includes('policy')) {
          throw new Error('Permission denied. Please ensure you are logged in as an admin and have upload permissions.');
        } else if (uploadError.message?.includes('size')) {
          throw new Error('File size too large. Please use an image under 10MB.');
        } else if (uploadError.message?.includes('duplicate')) {
          throw new Error('File already exists. Please rename your file or try again.');
        } else {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }
      }

      console.log('Upload successful:', uploadData);
      setUploadProgress(70);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('shop-look-images')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      console.log('Public URL generated:', publicUrl);

      if (!publicUrl) {
        throw new Error('Failed to generate public URL for uploaded image');
      }

      setUploadProgress(85);

      // Update content with new background image
      await updateContentMutation.mutateAsync({
        background_image: publicUrl
      });

      setUploadProgress(100);
      toast.success('Background image uploaded successfully');
      
      // Reset file input
      event.target.value = '';
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message);
      
      // Show user-friendly error message
      toast.error(error.message || 'Upload failed. Please try again.');
    } finally {
      setUploadingImage(false);
      setTimeout(() => {
        setUploadProgress(0);
        setUploadError(null);
      }, 3000);
    }
  };

  const handleContentUpdate = (field: keyof ShopLookContent, value: any) => {
    updateContentMutation.mutate({
      [field]: value
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Loading content...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="border border-destructive rounded-lg p-4">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Error loading content</span>
            </div>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
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
              value={content?.title || 'Shop The Look'}
              onChange={(e) => handleContentUpdate('title', e.target.value)}
              placeholder="Shop The Look"
            />
          </div>
          
          <div>
            <Label htmlFor="title-highlight">Title Highlight</Label>
            <Input
              id="title-highlight"
              value={content?.title_highlight || 'Premium Laboratory Solutions'}
              onChange={(e) => handleContentUpdate('title_highlight', e.target.value)}
              placeholder="Premium Laboratory Solutions"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={content?.description || 'Discover our complete range of laboratory equipment and furniture designed for modern research facilities.'}
              onChange={(e) => handleContentUpdate('description', e.target.value)}
              placeholder="Discover our complete range..."
              rows={3}
            />
          </div>
        </div>

        {/* Background Image */}
        <div className="space-y-4">
          <Label>Background Image</Label>
          
          {/* Current Image Preview */}
          {content?.background_image && (
            <div className="relative">
              <img
                src={content.background_image}
                alt={content.background_alt || 'Background'}
                className="w-full h-48 object-cover rounded-lg border"
                onError={(e) => {
                  console.error('Failed to load image:', content.background_image);
                  e.currentTarget.src = '/api/placeholder/800/300';
                }}
              />
              <div className="absolute top-2 right-2">
                <div className="flex items-center gap-1 bg-black/50 text-white px-2 py-1 rounded text-xs">
                  <CheckCircle className="w-3 h-3" />
                  Current
                </div>
              </div>
            </div>
          )}
          
          {/* Upload Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={uploadingImage}
                onClick={() => document.getElementById('background-upload')?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {uploadingImage ? 'Uploading...' : 'Upload New Background'}
              </Button>
              
              <input
                id="background-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              <div className="text-xs text-muted-foreground">
                Max 10MB • JPG, PNG, GIF, WebP
              </div>
            </div>

            {/* Upload Progress */}
            {uploadingImage && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading image...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Upload Error */}
            {uploadError && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="background-alt">Image Alt Text</Label>
            <Input
              id="background-alt"
              value={content?.background_alt || 'Modern laboratory setup with premium equipment'}
              onChange={(e) => handleContentUpdate('background_alt', e.target.value)}
              placeholder="Describe the image for accessibility"
            />
          </div>
        </div>

        {/* Settings */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Switch
              checked={content?.is_active !== false}
              onCheckedChange={(checked) => handleContentUpdate('is_active', checked)}
            />
            <Label>Active</Label>
            {content?.is_active !== false ? (
              <Eye className="w-4 h-4 text-green-600" />
            ) : (
              <EyeOff className="w-4 h-4 text-gray-400" />
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            {updateContentMutation.isPending ? 'Saving...' : 'Auto-saved'}
          </div>
        </div>

        {/* Instructions for testing */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Testing the Interactive Hotspot Editor:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Upload a background image above (this will be your interactive background)</li>
            <li>2. Once uploaded, navigate to the Hotspot Editor tab</li>
            <li>3. Click anywhere on the uploaded image to create interactive hotspots</li>
            <li>4. Fill in product details for each hotspot</li>
          </ol>
          <p className="text-xs text-blue-600 mt-2">
            💡 For best results, use a high-resolution laboratory setup image (1200x800px or larger)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShopLookContentEditor;
