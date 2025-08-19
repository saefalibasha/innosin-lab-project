import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectEditor } from './ProjectEditor';
import { HotspotEditor } from './HotspotEditor';
import { BlogManagement } from './BlogManagement';

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
          <TabsTrigger value="hotspots">Shop The Look Management</TabsTrigger>
          <TabsTrigger value="blog">Blog Management</TabsTrigger>
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

        <TabsContent value="hotspots" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shop The Look Management</CardTitle>
            </CardHeader>
            <CardContent>
              <HotspotEditor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blog" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Blog Management</CardTitle>
            </CardHeader>
            <CardContent>
              <BlogManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentManagement;