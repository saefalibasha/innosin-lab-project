// src/pages/Index.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';
import { Reveal, StaggerList } from '@/components/anim';
import VideoHero from '@/components/VideoHero';
import ShopTheLook from '@/components/ShopTheLook';
import BeforeAfterComparison from '@/components/BeforeAfterComparison';
import NewsletterSubscription from '@/components/NewsletterSubscription';
import LabTransformCTA from '@/components/LabTransformCTA';

type Company = {
  name: string;
  logo: string;
  link: string;
  country: string;
};

const Index = () => {
  const navigate = useNavigate();

  const companyData: Company[] = [
    {
      name: 'Broen-Lab',
      logo: '/brand-logos/broen-lab-logo.png',
      link: '/products?company=Broen-Lab',
      country: 'Denmark',
    },
    {
      name: 'Hamilton Laboratory Solutions',
      logo: '/brand-logos/hamilton-laboratory-logo.png',
      link: '/products?company=Hamilton Laboratory Solutions',
      country: 'USA',
    },
    {
      name: 'Oriental Giken Inc.',
      logo: '/brand-logos/oriental-giken-logo.png',
      link: '/products?company=Oriental Giken Inc.',
      country: 'Japan',
    },
    {
      name: 'Innosin Lab',
      logo: '/brand-logos/innosin-lab-logo.png',
      link: '/products?company=Innosin Lab',
      country: 'Malaysia',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Video Hero */}
      <VideoHero />

      {/* Featured Companies */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6 tracking-tight">
                Featured Laboratory Partners
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Explore our featured laboratory equipment and solutions from
                industry-leading manufacturers.
              </p>
            </div>
          </Reveal>

          <StaggerList
            items={companyData}
            renderItem={(company) => (
              <Card
                key={company.name}
                onClick={() => navigate(company.link)}
                className="group cursor-pointer rounded-2xl border-0 bg-white shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
              >
                <CardContent className="flex h-64 flex-col items-center justify-center p-6">
                  {/* Bigger logo */}
                  <img
                    src={company.logo}
                    alt={`${company.name} Logo`}
                    className="h-40 w-40 object-contain transition-transform duration-300 group-hover:scale-110"
                  />

                  {/* Tight gap + always single line */}
                  <div className="mt-3 whitespace-nowrap text-center text-xs md:text-sm text-gray-700">
                    Country of Origin: {company.country}
                  </div>
                </CardContent>
              </Card>
            )}
            className="mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
          />
        </div>
      </section>

      {/* Shop The Look */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-24">
        <div className="container mx-auto px-4">
          <ShopTheLook />
        </div>
      </section>

      {/* Laboratory Transformations */}
      <section className="relative overflow-hidden bg-white py-28">
        <div className="absolute inset-0 bg-gradient-to-r from-sea/5 to-transparent" />
        <div className="container relative z-10 mx-auto px-4">
          <Reveal>
            <div className="mb-20 text-center">
              <h2 className="mb-6 text-4xl font-bold tracking-tight text-primary md:text-5xl">
                Laboratory <span className="text-sea">Transformations</span>
              </h2>
              <p className="mx-auto max-w-3xl text-xl leading-relaxed text-muted-foreground">
                See how we've transformed laboratories across Singapore with
                cutting-edge equipment, innovative design solutions, and
                professional installation services.
              </p>
            </div>
          </Reveal>

          <BeforeAfterComparison />
        </div>
      </section>

      {/* CTA */}
      <LabTransformCTA />

      {/* Newsletter */}
      <section className="bg-gradient-to-br from-sea/5 to-gray-50 py-20">
        <div className="container mx-auto px-4">
          <NewsletterSubscription />
        </div>
      </section>
    </div>
  );
};

export default Index;
