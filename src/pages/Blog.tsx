
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowRight, Search, Filter, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Reveal, StaggerList } from '@/components/anim';

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');

  const { data: blogPosts, isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('publish_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Get unique categories and tags from the posts
  const categories = ['all', ...new Set(blogPosts?.map(post => post.category).filter(Boolean) || [])];
  const allTags = ['all', ...new Set(blogPosts?.flatMap(post => post.tags || []) || [])];

  const filteredPosts = blogPosts?.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesTag = selectedTag === 'all' || (post.tags && post.tags.includes(selectedTag));
    
    return matchesSearch && matchesCategory && matchesTag;
  }) || [];

  const featuredPost = filteredPosts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Reveal>
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-black mb-4">Laboratory Insights Blog</h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Expert insights, technical guides, case studies, and industry trends in laboratory design, safety, and equipment from the Innosin Lab team.
            </p>
          </div>
        </Reveal>

        {/* Search and Filters */}
        <Card className="mb-12 border-gray-200">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="border-gray-300">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Tags" />
                </SelectTrigger>
                <SelectContent>
                  {allTags.map(tag => (
                    <SelectItem key={tag} value={tag}>
                      {tag === 'all' ? 'All Tags' : tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center">
                <Badge variant="secondary" className="text-sm bg-gray-100 text-gray-800">
                  {filteredPosts.length} articles found
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading blog posts...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto mb-4" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No blog posts found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Featured Article */}
        {featuredPost && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-black mb-6">Featured Article</h2>
            <Card className="overflow-hidden shadow-xl border-gray-200">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img
                    src={featuredPost.featured_image || 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&h=400&fit=crop'}
                    alt={featuredPost.title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <Badge className="bg-black text-white">
                      {featuredPost.category}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {featuredPost.publish_date ? new Date(featuredPost.publish_date).toLocaleDateString() : 'Draft'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {featuredPost.read_time} min read
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-black mb-4">
                    {featuredPost.title}
                  </h3>
                  
                  <p className="text-gray-700 mb-6 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {featuredPost.tags?.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs border-gray-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{featuredPost.author}</span>
                    </div>
                    <Button className="bg-black hover:bg-gray-800 text-white">
                      Read Article <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Articles Grid */}
        {regularPosts.length > 0 && (
          <StaggerList
            items={regularPosts}
            renderItem={(post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-gray-200">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.featured_image || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=400&fit=crop'}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {post.category}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.publish_date ? new Date(post.publish_date).toLocaleDateString() : 'Draft'}
                    </span>
                  </div>
                  
                  <CardTitle className="text-lg leading-tight hover:text-black transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags?.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-3 h-3" />
                      <span className="text-xs">{post.author}</span>
                    </div>
                    <span className="text-xs text-gray-500">{post.read_time} min read</span>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full mt-4 hover:bg-black hover:border-black">
                    Read Full Article
                  </Button>
                </CardContent>
              </Card>
            )}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          />
        )}

        {/* Newsletter Subscription CTA */}
        <div className="mt-20">
          <Card className="bg-black text-white border-black">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Never Miss an Update</h3>
              <p className="mb-6 text-gray-300 max-w-2xl mx-auto">
                Subscribe to our newsletter and get the latest laboratory insights, technical guides, and industry news delivered directly to your inbox every month.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 bg-white text-black border-white"
                />
                <Button variant="secondary" className="whitespace-nowrap bg-white text-black hover:bg-gray-200">
                  Subscribe Now
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Join 2,500+ laboratory professionals who trust our insights
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Blog;
