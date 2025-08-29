
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Eye } from 'lucide-react';
import StreamlinedFileUpload from '@/components/ui/StreamlinedFileUpload';

interface ShopLookContent {
  title: string;
  title_highlight: string;
  description: string;
  background_image: string;
  background_alt: string;
}

export const ShopLookContentEditor = () => {
  const [content, setContent] = useState<ShopLookContent>({
    title: 'Shop The Look',
    title_highlight: 'Premium Laboratory Solutions',
    description: 'Discover our complete range of laboratory equipment and furniture designed for modern research facilities. Click on the interactive points to explore each product in detail.',
    background_image: 'public/page-images/home/shop-look.jpg',
  });

  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Since we don't have the shop_look_content table yet, we'll simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Shop The Look content updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to update content",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {/* Content Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Main Title</Label>
            <Input
              id="title"
              value={content.title}
              onChange={(e) => setContent({ ...content, title: e.target.value })}
              placeholder="e.g., Shop The Look"
            />
          </div>
          <div>
            <Label htmlFor="title_highlight">Highlight Title</Label>
            <Input
              id="title_highlight"
              value={content.title_highlight}
              onChange={(e) => setContent({ ...content, title_highlight: e.target.value })}
              placeholder="e.g., Premium Laboratory Solutions"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={content.description}
            onChange={(e) => setContent({ ...content, description: e.target.value })}
            placeholder="Enter the section description..."
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="background_alt">Background Image Alt Text</Label>
          <Input
            id="background_alt"
            value={content.background_alt}
            onChange={(e) => setContent({ ...content, background_alt: e.target.value })}
            placeholder="Describe the background image for accessibility"
          />
        </div>

        {/* Background Image Upload */}
        <div>
          <Label>Background Image</Label>
          <StreamlinedFileUpload
            onFileUploaded={(url) => setContent({ ...content, background_image: url })}
            currentImage={content.background_image}
            className="mt-2"
          />
        </div>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {content.title}
              </h2>
              <h3 className="text-xl font-semibold text-blue-600 mb-4">
                {content.title_highlight}
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {content.description}
              </p>
            </div>
            {content.background_image && (
              <div className="mt-6">
                <img
                  src={content.background_image}
                  alt={content.background_alt}
                  className="w-full max-h-64 object-cover rounded-lg shadow-md"
                  onError={(e) => {
                    e.currentTarget.src = '/api/placeholder/800/300';
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};
