import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Reveal, StaggerList } from '@/components/anim';
import VideoHero from '@/components/VideoHero';
import ShopTheLook from '@/components/ShopTheLook';
import BeforeAfterComparison from '@/components/BeforeAfterComparison';
import NewsletterSubscription from '@/components/NewsletterSubscription';
import LabTransformCTA from '@/components/LabTransformCTA';

const Index = () => {
  const navigate = useNavigate();

  const companyData = [
    { name: 'Broen-Lab', logo: '/brand-logos/broen-lab-logo.png', origin: 'Denmark', link: '/products?company=Broen-Lab' },
    { name: 'Hamilton Laboratory Solutions', logo: '/brand-logos/hamilton-laboratory-logo.png', origin: 'USA', link: '/products?company=Hamilton Laboratory Solutions' },
    { name: 'Oriental Giken Inc.', logo: '/brand-logos/oriental-giken-logo.png', origin: 'Japan', link: '/products?company=Oriental Giken Inc.' },
    { name: 'Innosin Lab', logo: '/brand-logos/innosin-lab-logo.png', origin: 'Malaysia', link: '/products?company=Innosin Lab' }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content only; header & footer are provided by SiteLayout */}
      <main className="flex-grow pt-16">
        {/* Video Hero Section */}
        <VideoHero />

        {/* Featured Companies Section */}
        <section className="py-20 bg-white transition-all duration-700 ease-in-out">
          <div className="container mx-auto px-4">
            <Reveal>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6 tracking-tight">
                  Featured Laboratory Partners
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Explore our featured laboratory equipment and solutions from industry-leading manufacturers.
                </p>
              </div>
            </Reveal>

            <StaggerList
              items={companyData}
              renderItem={(company) => (
                <Card
                  className="group bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-2 rounded-2xl overflow-hidden"
                  onClick={() => navigate(company.link)}
                >
                  <CardContent className="p-6 flex flex-col items-center justify-center space-y-3 h-60">
                    <img
                      src={company.logo}
                      alt={`${company.name} Logo`}
                      className="w-32 h-32 object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                    <Badge variant="secondary" className="text-xs px-3 py-1 bg-gray-100 text-gray-800">
                      Country of Origin: {company.origin}
                    </Badge>
                  </CardContent>
                </Card>
              )}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto"
            />
          </div>
        </section>

        {/* Shop The Look Section */}
        <section className="py-24 bg-gradient-to-br from-gray-50 to-white transition-all duration-700 ease-in-out">
          <div className="container mx-auto px-4">
            <ShopTheLook />
          </div>
        </section>

        {/* Laboratory Transformations Section */}
        <section className="py-28 bg-white relative overflow-hidden transition-all duration-700 ease-in-out">
          <div className="absolute inset-0 bg-gradient-to-r from-sea/5 to-transparent"></div>
          <div className="container mx-auto px-4 relative z-10">
            <Reveal>
              <div className="text-center mb-20">
                <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6 tracking-tight">
                  Laboratory <span className="text-sea">Transformations</span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  See how we've transformed laboratories across Singapore with cutting-edge equipment, 
                  innovative design solutions, and professional installation services.
                </p>
              </div>
            </Reveal>
            <BeforeAfterComparison />
          </div>
        </section>

        {/* Lab Transform CTA Section */}
        <LabTransformCTA />

        {/* Newsletter Subscription Section */}
        <section className="py-20 bg-gradient-to-br from-sea/5 to-gray-50 transition-all duration-700 ease-in-out">
          <div className="container mx-auto px-4">
            <NewsletterSubscription />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
