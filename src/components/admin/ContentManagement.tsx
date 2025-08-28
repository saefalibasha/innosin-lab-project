
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BlogPostManagement from './BlogPostManagement';
import BeforeAfterProjectManagement from './BeforeAfterProjectManagement';
import ShopLookContentEditor from './shop-look/ShopLookContentEditor';
import HotspotEditor from './shop-look/HotspotEditor';
import { 
  FileText, 
  Image, 
  Eye, 
  Target,
  Camera,
  Settings
} from 'lucide-react';

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState('blog');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Management</h2>
          <p className="text-muted-foreground">
            Manage blog posts, projects, and interactive content
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="blog" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Blog Posts
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="shop-content" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Shop Content
          </TabsTrigger>
          <TabsTrigger value="shop-hotspots" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Hotspots
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blog" className="space-y-6">
          <BlogPostManagement />
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <BeforeAfterProjectManagement />
        </TabsContent>

        <TabsContent value="shop-content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Shop The Look - Content Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Configure the main content, title, description, and background image for the Shop The Look section. 
                Upload a background image here to make it available for hotspot editing.
              </p>
              <ShopLookContentEditor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shop-hotspots" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Shop The Look - Interactive Hotspots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Add interactive product hotspots to your background image. Click on the image to place hotspots, 
                then select products from your catalog to automatically populate the hotspot information.
              </p>
              <HotspotEditor />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentManagement;
