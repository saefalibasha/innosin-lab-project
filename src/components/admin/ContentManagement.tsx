import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectEditor } from './ProjectEditor';
import { HotspotEditor } from './HotspotEditor';
import { ShopLookContentEditor } from './ShopLookContentEditor';

const ContentManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Content Management</h1>
          <p className="text-muted-foreground">
            Manage before/after projects and shop the look section content
          </p>
        </div>
      </div>

      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="projects">Before/After Projects</TabsTrigger>
          <TabsTrigger value="shop-content">Shop The Look Content</TabsTrigger>
          <TabsTrigger value="hotspots">Hotspot Management</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Management</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectEditor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shop-content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shop The Look Content</CardTitle>
            </CardHeader>
            <CardContent>
              <ShopLookContentEditor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hotspots" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hotspot Management</CardTitle>
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