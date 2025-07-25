
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { BlogPostList } from './BlogPostList';
import { BlogPostEditor } from './BlogPostEditor';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const BlogManagement = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: blogPosts, isLoading, refetch } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const handleCreateNew = () => {
    setEditingPost(null);
    setIsEditing(true);
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setIsEditing(true);
  };

  const handleSave = async () => {
    await refetch();
    setIsEditing(false);
    setEditingPost(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingPost(null);
  };

  const filteredPosts = blogPosts?.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isEditing) {
    return (
      <BlogPostEditor
        post={editingPost}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Blog Posts</CardTitle>
            <Button onClick={handleCreateNew} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Post
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search blog posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading blog posts...</div>
          ) : (
            <BlogPostList
              posts={filteredPosts}
              onEdit={handleEdit}
              onRefresh={refetch}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
