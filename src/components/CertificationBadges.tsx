
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Shield, Leaf, Users } from 'lucide-react';

interface Certification {
  name: string;
  description: string;
  year: string;
  icon: React.ReactNode;
  category: 'quality' | 'safety' | 'environmental' | 'industry';
}

const CertificationBadges = () => {
  const certifications: Certification[] = [
    {
      name: 'ISO 9001:2015',
      description: 'Quality Management Systems',
      year: '2012',
      icon: <Award className="w-6 h-6" />,
      category: 'quality'
    },
    {
      name: 'ISO 14001:2015',
      description: 'Environmental Management',
      year: '2018',
      icon: <Leaf className="w-6 h-6" />,
      category: 'environmental'
    },
    {
      name: 'OSHA Compliance',
      description: 'Occupational Safety Standards',
      year: '2015',
      icon: <Shield className="w-6 h-6" />,
      category: 'safety'
    },
    {
      name: 'SEFA Certified',
      description: 'Scientific Equipment & Furniture Association',
      year: '2020',
      icon: <Users className="w-6 h-6" />,
      category: 'industry'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'quality': return 'border-blue-500 bg-blue-50';
      case 'safety': return 'border-red-500 bg-red-50';
      case 'environmental': return 'border-green-500 bg-green-50';
      case 'industry': return 'border-purple-500 bg-purple-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Certifications & Standards</h2>
        <p className="text-xl text-gray-600">Our commitment to excellence and compliance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {certifications.map((cert, index) => (
          <Card key={index} className={`border-2 transition-all hover:shadow-lg hover:scale-105 ${getCategoryColor(cert.category)}`}>
            <CardContent className="p-6 text-center">
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-white rounded-full shadow-md">
                  {cert.icon}
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{cert.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{cert.description}</p>
              <Badge variant="outline" className="text-xs">
                Since {cert.year}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 bg-gray-50 rounded-lg p-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Quality Assurance</h3>
          <p className="text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Our certifications demonstrate our unwavering commitment to quality, safety, and environmental responsibility. 
            Every product we manufacture undergoes rigorous testing and quality control processes to ensure compliance 
            with international standards and exceed customer expectations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CertificationBadges;
