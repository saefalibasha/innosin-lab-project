import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowRight, Search, Filter, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  readTime: string;
  category: string;
  tags: string[];
  featuredImage: string;
  featured: boolean;
}

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');

  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'The Future of Laboratory Safety: Advanced Fume Hood Technologies',
      excerpt: 'Exploring the latest innovations in fume hood design, from smart sensors to energy-efficient VAV systems that are revolutionizing laboratory safety standards.',
      content: '',
      author: 'Dr. Sarah Chen',
      publishDate: '2024-01-15',
      readTime: '8 min read',
      category: 'Safety',
      tags: ['Fume Hoods', 'Safety', 'Innovation', 'VAV Systems'],
      featuredImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&h=400&fit=crop',
      featured: true
    },
    {
      id: '2',
      title: 'Sustainable Laboratory Design: Green Building Practices',
      excerpt: 'How modern laboratories are adopting sustainable practices while maintaining the highest safety and functionality standards.',
      content: '',
      author: 'Michael Rodriguez',
      publishDate: '2024-01-10',
      readTime: '6 min read',
      category: 'Sustainability',
      tags: ['Green Building', 'Sustainability', 'Design', 'Energy Efficiency'],
      featuredImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=400&fit=crop',
      featured: false
    },
    {
      id: '3',
      title: 'Case Study: NUS Chemistry Lab Transformation',
      excerpt: 'A detailed look at our recent project at National University of Singapore, showcasing modern lab design principles.',
      content: '',
      author: 'Jennifer Lim',
      publishDate: '2024-01-05',
      readTime: '12 min read',
      category: 'Case Studies',
      tags: ['Case Study', 'University', 'Chemistry Lab', 'Renovation'],
      featuredImage: 'https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=600&h=400&fit=crop',
      featured: false
    },
    {
      id: '4',
      title: 'Understanding Laboratory Ventilation Requirements',
      excerpt: 'A comprehensive guide to laboratory ventilation standards, regulations, and best practices for different types of lab environments.',
      content: '',
      author: 'Dr. James Wong',
      publishDate: '2023-12-28',
      readTime: '10 min read',
      category: 'Technical',
      tags: ['Ventilation', 'Standards', 'Regulations', 'HVAC'],
      featuredImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&h=400&fit=crop',
      featured: false
    },
    {
      id: '5',
      title: 'Emergency Safety Equipment: Installation and Maintenance',
      excerpt: 'Best practices for installing and maintaining emergency eye wash stations, safety showers, and other critical safety equipment.',
      content: '',
      author: 'Lisa Park',
      publishDate: '2023-12-20',
      readTime: '7 min read',
      category: 'Safety',
      tags: ['Emergency Equipment', 'Maintenance', 'Safety Showers', 'Eye Wash'],
      featuredImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop',
      featured: false
    },
    {
      id: '6',
      title: 'Cleanroom Standards and Design Considerations',
      excerpt: 'Understanding ISO cleanroom classifications and the design considerations for different cleanroom applications in research and industry.',
      content: '',
      author: 'David Kim',
      publishDate: '2023-12-15',
      readTime: '9 min read',
      category: 'Technical',
      tags: ['Cleanroom', 'ISO Standards', 'Design', 'Contamination Control'],
      featuredImage: 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=600&h=400&fit=crop',
      featured: false
    }
  ];

  const categories = ['all', 'Safety', 'Technical', 'Case Studies', 'Sustainability', 'Design'];
  const allTags = ['all', ...Array.from(new Set(blogPosts.flatMap(post => post.tags)))];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesTag = selectedTag === 'all' || post.tags.includes(selectedTag);
    
    return matchesSearch && matchesCategory && matchesTag;
  });

  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-black mb-4">Laboratory Insights Blog</h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Expert insights, technical guides, case studies, and industry trends in laboratory design, 
            safety, and equipment from the Innosin Lab team.
          </p>
        </div>

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

        {/* Featured Article */}
        {featuredPost && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-black mb-6">Featured Article</h2>
            <Card className="overflow-hidden shadow-xl border-gray-200">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img
                    src={featuredPost.featuredImage}
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
                      {new Date(featuredPost.publishDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {featuredPost.readTime}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-black mb-4">
                    {featuredPost.title}
                  </h3>
                  
                  <p className="text-gray-700 mb-6 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {featuredPost.tags.slice(0, 3).map(tag => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-gray-200">
              <div className="aspect-video overflow-hidden">
                <img
                  src={post.featuredImage}
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
                    {new Date(post.publishDate).toLocaleDateString()}
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
                  {post.tags.slice(0, 2).map(tag => (
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
                  <span className="text-xs text-gray-500">{post.readTime}</span>
                </div>
                
                <Button variant="outline" size="sm" className="w-full mt-4 hover:bg-black hover:border-black">
                  Read Full Article
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Subscription CTA */}
        <div className="mt-20">
          <Card className="bg-black text-white border-black">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Never Miss an Update</h3>
              <p className="mb-6 text-gray-300 max-w-2xl mx-auto">
                Subscribe to our newsletter and get the latest laboratory insights, technical guides, 
                and industry news delivered directly to your inbox every month.
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
      
      <Footer />
    </div>
  );
};

export default Blog;
