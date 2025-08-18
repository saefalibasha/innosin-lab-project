
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import HeaderBrand from '@/components/HeaderBrand';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderBrand />
      
      <div className="pt-20 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Blog Post: {slug}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Blog post content for "{slug}" is coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlogPost;
