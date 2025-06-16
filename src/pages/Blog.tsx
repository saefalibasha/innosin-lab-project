
import React from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowRight } from 'lucide-react';

const Blog = () => {
  const blogPosts = [
    {
      id: '1',
      title: 'The Future of 3D Product Visualization',
      excerpt: 'Discover how 3D technology is revolutionizing the way customers interact with products online, creating immersive experiences that bridge the gap between digital and physical shopping.',
      author: 'Sarah Johnson',
      date: '2024-01-15',
      readTime: '5 min read',
      category: 'Technology',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=240&fit=crop'
    },
    {
      id: '2',
      title: 'Design Principles for Modern 3D Models',
      excerpt: 'Learn about the key design principles that make 3D models both visually appealing and functionally effective for e-commerce applications.',
      author: 'Michael Chen',
      date: '2024-01-10',
      readTime: '7 min read',
      category: 'Design',
      image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=240&fit=crop'
    },
    {
      id: '3',
      title: 'Customer Success: How 3D Increased Sales by 40%',
      excerpt: 'Real case study showing how implementing 3D product viewers led to significant improvements in conversion rates and customer satisfaction.',
      author: 'Emily Rodriguez',
      date: '2024-01-05',
      readTime: '6 min read',
      category: 'Case Study',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=240&fit=crop'
    },
    {
      id: '4',
      title: 'Getting Started with Web-Based 3D',
      excerpt: 'A comprehensive guide for businesses looking to implement 3D visualization on their websites, including best practices and technical considerations.',
      author: 'David Kim',
      date: '2023-12-28',
      readTime: '8 min read',
      category: 'Tutorial',
      image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=240&fit=crop'
    },
    {
      id: '5',
      title: 'The Psychology of Interactive Product Experiences',
      excerpt: 'Understanding how interactive 3D experiences influence customer behavior and decision-making in the digital marketplace.',
      author: 'Lisa Park',
      date: '2023-12-20',
      readTime: '5 min read',
      category: 'Psychology',
      image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=240&fit=crop'
    },
    {
      id: '6',
      title: 'Optimizing 3D Models for Web Performance',
      excerpt: 'Technical tips and strategies for creating 3D models that load quickly and perform smoothly across all devices and browsers.',
      author: 'Alex Chen',
      date: '2023-12-15',
      readTime: '9 min read',
      category: 'Development',
      image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=240&fit=crop'
    }
  ];

  const categories = ['All', 'Technology', 'Design', 'Case Study', 'Tutorial', 'Psychology', 'Development'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Blog</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Insights, tutorials, and stories about 3D technology, design, and the future of digital product experiences.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === 'All' ? 'default' : 'outline'}
              size="sm"
              className="mb-2"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Featured Post */}
        <div className="mb-16">
          <Card className="overflow-hidden shadow-xl">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src={blogPosts[0].image}
                  alt={blogPosts[0].title}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-8">
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    {blogPosts[0].category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(blogPosts[0].date).toLocaleDateString()}
                  </span>
                  <span>{blogPosts[0].readTime}</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {blogPosts[0].title}
                </h2>
                <p className="text-gray-600 mb-6 line-clamp-3">
                  {blogPosts[0].excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{blogPosts[0].author}</span>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Read More <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.slice(1).map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="aspect-video overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.date).toLocaleDateString()}
                  </span>
                </div>
                <CardTitle className="text-lg leading-tight">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600">{post.author}</span>
                  </div>
                  <span className="text-xs text-gray-500">{post.readTime}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Read Article
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-20">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
              <p className="mb-6 opacity-90">
                Subscribe to our newsletter for the latest insights on 3D technology and design trends.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-lg text-gray-900"
                />
                <Button variant="secondary" className="whitespace-nowrap">
                  Subscribe
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Blog;
