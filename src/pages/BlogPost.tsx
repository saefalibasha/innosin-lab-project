
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching blog post:', error);
      } else {
        setPost(data);
      }
      setLoading(false);
    };
    
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sea"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto py-12 px-4">
          <Link to="/blog">
            <Button variant="outline" className="mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Article not found</h1>
            <p className="text-gray-600">The blog post you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Link to="/blog">
          <Button variant="outline" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </Link>

        <article>
          <header className="mb-8">
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <Badge className="bg-sea text-white">{post.category}</Badge>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {post.publish_date ? new Date(post.publish_date).toLocaleDateString() : 'Draft'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.read_time} min read
              </span>
            </div>

            <h1 className="text-4xl font-bold text-sea mb-4">{post.title}</h1>

            {post.excerpt && (
              <p className="text-xl text-gray-700 mb-6">{post.excerpt}</p>
            )}

            <div className="flex items-center gap-2 mb-6">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">By {post.author}</span>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs border-sea text-sea">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </header>

          {post.featured_image && (
            <div className="mb-8">
              <img 
                src={post.featured_image} 
                alt={post.title} 
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          )}

          <div 
            className="prose prose-lg max-w-none prose-sea" 
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} 
          />
        </article>
      </div>
    </div>
  );
}
