
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const BlogPostManagement = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Blog Posts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Blog post management functionality will be implemented here.
        </p>
      </CardContent>
    </Card>
  );
};

export default BlogPostManagement;
