import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from '@/components/ui/badge';

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
    <div className="container mx-auto py-10">
      <section className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            Welcome to Lab Ordering Platform
          </h1>
          <p className="text-muted-foreground">
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
              <CardHeader>
                <CardTitle className="text-lg font-semibold leading-tight tracking-tight">
                  {company.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex flex-col items-center">
                <img
                  src={company.logo}
                  alt={`${company.name} Logo`}
                  className="mb-4 w-32 h-32 object-contain rounded-md"
                />
                <CardDescription className="text-sm text-muted-foreground text-center">
                  {company.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
