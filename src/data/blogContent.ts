
export interface BlogPost {
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

export const blogContent = {
  // Page header content
  pageHeader: {
    title: "Laboratory Insights Blog",
    subtitle: "Expert insights, technical guides, case studies, and industry trends in laboratory design, safety, and equipment from the Innosin Lab team."
  },
  
  // Newsletter CTA content
  newsletter: {
    title: "Never Miss an Update",
    description: "Subscribe to our newsletter and get the latest laboratory insights, technical guides, and industry news delivered directly to your inbox every month.",
    subscriberCount: "2,500+",
    placeholder: "Enter your email address",
    buttonText: "Subscribe Now"
  },
  
  // Blog posts data
  posts: [
    {
      id: '1',
      title: 'The Future of Laboratory Safety: Advanced Fume Hood Technologies',
      excerpt: 'Exploring the latest innovations in fume hood design, from smart sensors to energy-efficient VAV systems that are revolutionizing laboratory safety standards.',
      content: `
        <h2>Introduction</h2>
        <p>Laboratory safety has always been a paramount concern in research environments, but recent advances in fume hood technology are setting new standards for protection and efficiency. In this comprehensive guide, we'll explore the cutting-edge innovations that are transforming laboratory safety protocols.</p>
        
        <h2>Smart Sensor Integration</h2>
        <p>Modern fume hoods are now equipped with advanced sensors that can detect airflow patterns, chemical concentrations, and even predict maintenance needs. These intelligent systems provide real-time feedback to laboratory personnel, ensuring optimal safety conditions at all times.</p>
        
        <h2>Energy-Efficient VAV Systems</h2>
        <p>Variable Air Volume (VAV) systems represent a significant leap forward in energy efficiency. By automatically adjusting airflow based on sash position and usage patterns, these systems can reduce energy consumption by up to 50% while maintaining superior safety standards.</p>
        
        <h2>Conclusion</h2>
        <p>The future of laboratory safety lies in the intelligent integration of technology with traditional safety measures. As these innovations continue to evolve, we can expect even greater improvements in both safety and efficiency.</p>
      `,
      author: 'Dr. Sarah Chen',
      publishDate: '2024-01-15',
      readTime: '8 min read',
      category: 'Safety',
      tags: ['Fume Hoods', 'Safety', 'Innovation', 'VAV Systems'],
      featuredImage: '/blog-images/fume-hood-technology/hero.jpg',
      featured: true
    },
    {
      id: '2',
      title: 'Sustainable Laboratory Design: Green Building Practices',
      excerpt: 'How modern laboratories are adopting sustainable practices while maintaining the highest safety and functionality standards.',
      content: `
        <h2>The Green Revolution in Laboratory Design</h2>
        <p>Sustainability and laboratory safety were once considered mutually exclusive goals. However, innovative design approaches are proving that laboratories can be both environmentally responsible and exceptionally safe.</p>
        
        <h2>Key Sustainable Practices</h2>
        <ul>
          <li>Energy-efficient HVAC systems</li>
          <li>Sustainable material selection</li>
          <li>Water conservation technologies</li>
          <li>Waste reduction strategies</li>
        </ul>
        
        <h2>Case Studies</h2>
        <p>Several leading research institutions have successfully implemented green building practices, achieving LEED certification while maintaining world-class research capabilities.</p>
      `,
      author: 'Michael Rodriguez',
      publishDate: '2024-01-10',
      readTime: '6 min read',
      category: 'Sustainability',
      tags: ['Green Building', 'Sustainability', 'Design', 'Energy Efficiency'],
      featuredImage: '/blog-images/sustainable-design/hero.jpg',
      featured: false
    },
    {
      id: '3',
      title: 'Case Study: NUS Chemistry Lab Transformation',
      excerpt: 'A detailed look at our recent project at National University of Singapore, showcasing modern lab design principles.',
      content: `
        <h2>Project Overview</h2>
        <p>The National University of Singapore approached us with a challenge: transform their existing chemistry laboratory into a state-of-the-art research facility while maintaining full operational capacity throughout the renovation.</p>
        
        <h2>Challenges Faced</h2>
        <p>The project presented several unique challenges including space constraints, budget limitations, and the need to maintain continuous operations during the renovation process.</p>
        
        <h2>Innovative Solutions</h2>
        <p>Our team developed a phased approach that allowed for seamless operations while implementing cutting-edge safety and efficiency improvements.</p>
        
        <h2>Results</h2>
        <p>The completed project resulted in a 40% increase in research capacity and a 30% improvement in energy efficiency, while maintaining the highest safety standards.</p>
      `,
      author: 'Jennifer Lim',
      publishDate: '2024-01-05',
      readTime: '12 min read',
      category: 'Case Studies',
      tags: ['Case Study', 'University', 'Chemistry Lab', 'Renovation'],
      featuredImage: '/blog-images/nus-case-study/hero.jpg',
      featured: false
    },
    {
      id: '4',
      title: 'Understanding Laboratory Ventilation Requirements',
      excerpt: 'A comprehensive guide to laboratory ventilation standards, regulations, and best practices for different types of lab environments.',
      content: `
        <h2>Ventilation Fundamentals</h2>
        <p>Proper ventilation is the cornerstone of laboratory safety. Understanding the principles and requirements is essential for creating safe working environments.</p>
        
        <h2>Regulatory Standards</h2>
        <p>Various organizations provide guidelines for laboratory ventilation, including OSHA, ANSI, and local building codes. Compliance with these standards is not just recommended—it's required.</p>
        
        <h2>Best Practices</h2>
        <p>Implementing best practices in ventilation design ensures optimal performance and safety for all laboratory personnel.</p>
      `,
      author: 'Dr. James Wong',
      publishDate: '2023-12-28',
      readTime: '10 min read',
      category: 'Technical',
      tags: ['Ventilation', 'Standards', 'Regulations', 'HVAC'],
      featuredImage: '/blog-images/ventilation-guide/hero.jpg',
      featured: false
    },
    {
      id: '5',
      title: 'Emergency Safety Equipment: Installation and Maintenance',
      excerpt: 'Best practices for installing and maintaining emergency eye wash stations, safety showers, and other critical safety equipment.',
      content: `
        <h2>Critical Safety Equipment</h2>
        <p>Emergency safety equipment can mean the difference between a minor incident and a major injury. Proper installation and maintenance are crucial for ensuring this equipment functions when needed most.</p>
        
        <h2>Installation Guidelines</h2>
        <p>Following manufacturer specifications and regulatory requirements is essential for proper installation of emergency safety equipment.</p>
        
        <h2>Maintenance Protocols</h2>
        <p>Regular maintenance and testing ensure that emergency equipment will function properly when needed. We recommend establishing a comprehensive maintenance schedule.</p>
      `,
      author: 'Lisa Park',
      publishDate: '2023-12-20',
      readTime: '7 min read',
      category: 'Safety',
      tags: ['Emergency Equipment', 'Maintenance', 'Safety Showers', 'Eye Wash'],
      featuredImage: '/blog-images/emergency-equipment/hero.jpg',
      featured: false
    },
    {
      id: '6',
      title: 'Cleanroom Standards and Design Considerations',
      excerpt: 'Understanding ISO cleanroom classifications and the design considerations for different cleanroom applications in research and industry.',
      content: `
        <h2>ISO Cleanroom Classifications</h2>
        <p>ISO 14644 provides the standard for cleanroom classification, defining particle concentration limits for different cleanliness levels.</p>
        
        <h2>Design Considerations</h2>
        <p>Cleanroom design requires careful consideration of airflow patterns, filtration systems, and contamination control measures.</p>
        
        <h2>Applications</h2>
        <p>Different industries require different cleanroom standards, from pharmaceutical manufacturing to semiconductor research.</p>
      `,
      author: 'David Kim',
      publishDate: '2023-12-15',
      readTime: '9 min read',
      category: 'Technical',
      tags: ['Cleanroom', 'ISO Standards', 'Design', 'Contamination Control'],
      featuredImage: '/blog-images/cleanroom-standards/hero.jpg',
      featured: false
    }
  ] as BlogPost[],
  
  // Categories and tags for filtering
  categories: ['all', 'Safety', 'Technical', 'Case Studies', 'Sustainability', 'Design']
};

// Helper function to get all unique tags
export const getAllTags = (): string[] => {
  const allTags = blogContent.posts.flatMap(post => post.tags);
  return ['all', ...Array.from(new Set(allTags))];
};

// Helper function to get featured post
export const getFeaturedPost = (): BlogPost | undefined => {
  return blogContent.posts.find(post => post.featured);
};

// Helper function to get regular posts (non-featured)
export const getRegularPosts = (): BlogPost[] => {
  return blogContent.posts.filter(post => !post.featured);
};
