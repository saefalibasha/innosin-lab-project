
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HotspotEditor } from '@/components/admin/HotspotEditor';
import { ShopLookContentEditor } from '@/components/admin/ShopLookContentEditor';

const ContentManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Content Management</h2>
        <p className="text-muted-foreground">
          Manage your website content, shop the look sections, and interactive elements.
        </p>
      </div>

      <Tabs defaultValue="shop-look" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="shop-look">Shop The Look</TabsTrigger>
          <TabsTrigger value="hotspots">Interactive Hotspots</TabsTrigger>
        </TabsList>

        <TabsContent value="shop-look" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Shop The Look Content
                <Badge variant="secondary">Active</Badge>
              </CardTitle>
              <CardDescription>
                Configure the main content for your Shop The Look section including title, description, and background images.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ShopLookContentEditor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hotspots" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Interactive Hotspots
                <Badge variant="secondary">Management</Badge>
              </CardTitle>
              <CardDescription>
                Add and manage interactive hotspots on your Shop The Look images to highlight specific products.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HotspotEditor />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentManagement;
