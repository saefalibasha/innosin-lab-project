
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, User, ArrowRight } from 'lucide-react';
import HeroNavigation from '@/components/HeroNavigation';
import Footer from '@/components/Footer';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  tags: string[];
  image: string;
  readTime: string;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Future of Laboratory Automation: Trends and Innovations',
    excerpt: 'Exploring how automation is revolutionizing laboratory workflows and improving efficiency across research facilities.',
    content: 'Full blog post content would go here...',
    author: 'Dr. Sarah Chen',
    date: '2024-01-15',
    category: 'Technology',
    tags: ['Automation', 'Innovation', 'Efficiency'],
    image: '/blog/lab-automation.jpg',
    readTime: '5 min read'
  },
  {
    id: '2',
    title: 'Sustainable Laboratory Design: Going Green in 2024',
    excerpt: 'How modern laboratories are incorporating sustainable practices and eco-friendly designs to reduce environmental impact.',
    content: 'Full blog post content would go here...',
    author: 'Michael Wong',
    date: '2024-01-10',
    category: 'Sustainability',
    tags: ['Green Design', 'Sustainability', 'Environment'],
    image: '/blog/sustainable-lab.jpg',
    readTime: '7 min read'
  },
  {
    id: '3',
    title: 'Laboratory Safety Standards: Best Practices and Compliance',
    excerpt: 'A comprehensive guide to maintaining the highest safety standards in laboratory environments.',
    content: 'Full blog post content would go here...',
    author: 'Dr. Raj Patel',
    date: '2024-01-05',
    category: 'Safety',
    tags: ['Safety', 'Compliance', 'Best Practices'],
    image: '/blog/lab-safety.jpg',
    readTime: '6 min read'
  },
  {
    id: '4',
    title: 'Digital Transformation in Laboratory Management',
    excerpt: 'How digital tools and LIMS systems are streamlining laboratory operations and data management.',
    content: 'Full blog post content would go here...',
    author: 'Dr. Sarah Chen',
    date: '2023-12-28',
    category: 'Technology',
    tags: ['Digital', 'LIMS', 'Management'],
    image: '/blog/digital-lab.jpg',
    readTime: '8 min read'
  },
  {
    id: '5',
    title: 'Equipment Maintenance: Extending Laboratory Equipment Lifespan',
    excerpt: 'Essential tips and strategies for maintaining laboratory equipment to ensure optimal performance and longevity.',
    content: 'Full blog post content would go here...',
    author: 'Michael Wong',
    date: '2023-12-20',
    category: 'Maintenance',
    tags: ['Maintenance', 'Equipment', 'Optimization'],
    image: '/blog/equipment-maintenance.jpg',
    readTime: '4 min read'
  }
];

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', ...new Set(blogPosts.map(post => post.category))];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <HeroNavigation />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary mb-4">Laboratory Insights Blog</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stay updated with the latest trends, innovations, and best practices in laboratory science and technology.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Featured Post */}
          {filteredPosts.length > 0 && (
            <Card className="mb-12 overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <div className="h-64 md:h-full bg-gray-200 flex items-center justify-center">
                    <img
                      src={filteredPosts[0].image}
                      alt={filteredPosts[0].title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling!.textContent = 'Featured Article';
                      }}
                    />
                    <span className="text-muted-foreground hidden">Featured Article</span>
                  </div>
                </div>
                <div className="md:w-1/2 p-6">
                  <Badge className="mb-2">{filteredPosts[0].category}</Badge>
                  <h2 className="text-2xl font-bold mb-3">{filteredPosts[0].title}</h2>
                  <p className="text-muted-foreground mb-4">{filteredPosts[0].excerpt}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{filteredPosts[0].author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(filteredPosts[0].date)}</span>
                    </div>
                    <span>{filteredPosts[0].readTime}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {filteredPosts[0].tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <Button>
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Blog Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.slice(1).map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling!.textContent = 'Blog Post Image';
                    }}
                  />
                  <span className="text-muted-foreground hidden">Blog Post Image</span>
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                    <span className="text-xs text-muted-foreground">{post.readTime}</span>
                  </div>
                  <CardTitle className="text-lg leading-tight">{post.title}</CardTitle>
                </CardHeader>
                
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(post.date)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {post.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{post.tags.length - 2}
                      </Badge>
                    )}
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    Read Article
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No articles found matching your criteria.</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* Newsletter Subscription */}
          <Card className="mt-16 bg-primary text-primary-foreground">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
              <p className="mb-6 opacity-90">
                Subscribe to our newsletter for the latest laboratory insights and industry updates.
              </p>
              <div className="flex max-w-md mx-auto gap-3">
                <Input
                  placeholder="Enter your email"
                  className="bg-white text-gray-900"
                />
                <Button variant="secondary">
                  Subscribe
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
