
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

      {/* Featured Companies Section */}
      <div className="container mx-auto py-10">
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">
              Featured Laboratory Partners
            </h2>
            <p className="text-base text-muted-foreground">
              Explore our featured laboratory equipment and solutions.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {companyData.map((company, index) => (
              <Card
                key={index}
                className="bg-card text-card-foreground shadow-md hover:shadow-lg transition-shadow duration-300"
                onClick={() => navigate(company.link)}
                style={{ cursor: 'pointer' }}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <img
                    src={company.logo}
                    alt={`${company.name} Logo`}
                    className="w-32 h-32 object-contain rounded-md"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>

      {/* Shop The Look Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <ShopTheLook />
        </div>
      </section>

      {/* Before/After Comparison Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4 tracking-tight">
              Laboratory <span className="text-sea">Transformations</span>
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              See how we've transformed laboratories across Singapore with cutting-edge equipment and professional design.
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
