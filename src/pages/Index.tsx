
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from '@/components/ui/badge';
import VideoHero from '@/components/VideoHero';
import ShopTheLook from '@/components/ShopTheLook';
import BeforeAfterComparison from '@/components/BeforeAfterComparison';
import NewsletterSubscription from '@/components/NewsletterSubscription';
import LabTransformCTA from '@/components/LabTransformCTA';

const Index = () => {
  const navigate = useNavigate();

  const companyData = [
    {
      name: 'Broen-Lab',
      description: 'Advanced fume hoods and ventilation systems designed for chemical safety and efficiency',
      logo: '/brand-logos/broen-lab-logo.png',
      link: '/products?company=Broen-Lab'
    },
    {
      name: 'Hamilton Laboratory Solutions',
      description: 'Premium laboratory furniture and benches with chemical-resistant surfaces',
      logo: '/brand-logos/hamilton-laboratory-logo.png',
      link: '/products?company=Hamilton Laboratory Solutions'
    },
    {
      name: 'Oriental Giken Inc.',
      description: 'Emergency safety equipment including eye wash stations and safety showers',
      logo: '/brand-logos/oriental-giken-logo.png',
      link: '/products?company=Oriental Giken Inc.'
    },
    {
      name: 'Innosin Lab',
      description: 'Comprehensive storage solutions and laboratory equipment for modern research facilities',
      logo: '/brand-logos/innosin-lab-logo.png',
      link: '/products?company=Innosin Lab'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Video Hero Section */}
      <VideoHero />

      {/* Featured Companies Section - Modernized */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
              Featured Laboratory Partners
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore our featured laboratory equipment and solutions from industry-leading manufacturers.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {companyData.map((company, index) => (
              <Card
                key={index}
                className="group bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-2 rounded-2xl overflow-hidden"
                onClick={() => navigate(company.link)}
              >
                <CardContent className="p-8 flex flex-col items-center justify-center h-48">
                  <img
                    src={company.logo}
                    alt={`${company.name} Logo`}
                    className="w-28 h-28 object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Shop The Look Section - Enhanced */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <ShopTheLook />
        </div>
      </section>

      {/* Laboratory Transformations Section - Modernized */}
      <section className="py-28 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-sea/5 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold text-primary mb-8 tracking-tight">
              Laboratory <span className="text-sea">Transformations</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              See how we've transformed laboratories across Singapore with cutting-edge equipment, 
              innovative design solutions, and professional installation services.
            </p>
          </div>
          <BeforeAfterComparison />
        </div>
      </section>

      {/* Lab Transform CTA Section */}
      <LabTransformCTA />

      {/* Newsletter Subscription Section */}
      <NewsletterSubscription />
    </div>
  );
};

export default Index;
