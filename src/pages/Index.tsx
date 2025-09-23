import React from 'react';
import { Helmet } from 'react-helmet-async';
import VideoHero from '@/components/VideoHero';
import ShopTheLook from '@/components/ShopTheLook';
import BeforeAfterComparison from '@/components/BeforeAfterComparison';
import CompanyTimeline from '@/components/CompanyTimeline';
import LabTransformCTA from '@/components/LabTransformCTA';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Innosin Lab - Premium Laboratory Furniture & Equipment Solutions | Malaysia</title>
        <meta name="description" content="Leading provider of innovative laboratory furniture, equipment, and custom design solutions in Malaysia. Specializing in high-quality lab cabinets, workbenches, and complete laboratory setups for research institutions since 1986." />
        <meta name="keywords" content="laboratory furniture, lab equipment, laboratory design, lab cabinets, scientific furniture, lab workbenches, laboratory solutions, research equipment, lab safety furniture, laboratory installation" />
        <link rel="canonical" href="https://innosinlab.com/home" />
      </Helmet>

      <main className="min-h-screen">
        {/* Hero Section */}
        <VideoHero />
        
        {/* Shop The Look Section */}
        <ShopTheLook />
        
        {/* Before/After Laboratory Transformations */}
        <BeforeAfterComparison />
        
        {/* Company Timeline */}
        <CompanyTimeline />
        
        {/* Call to Action Section */}
        <LabTransformCTA />
      </main>
    </>
  );
};

export default Index;