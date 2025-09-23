import React from 'react';
import { Helmet } from 'react-helmet-async';
import VideoHero from '@/components/VideoHero';
import ShopTheLook from '@/components/ShopTheLook';
import BeforeAfterComparison from '@/components/BeforeAfterComparison';
import CompanyTimeline from '@/components/CompanyTimeline';
import LabTransformCTA from '@/components/LabTransformCTA';

const Index = () => {
  console.log('Index component rendering...');
  
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
        <div className="min-h-screen bg-primary/5 flex items-center justify-center">
          <VideoHero />
        </div>
        
        {/* Shop The Look Section */}
        <div className="min-h-screen bg-background">
          <ShopTheLook />
        </div>
        
        {/* Before/After Laboratory Transformations */}
        <div className="min-h-screen bg-muted/20">
          <BeforeAfterComparison />
        </div>
        
        {/* Company Timeline */}
        <div className="min-h-screen bg-background">
          <CompanyTimeline />
        </div>
        
        {/* Call to Action Section */}
        <div className="py-24 bg-gradient-to-br from-primary/5 to-sea/5">
          <LabTransformCTA />
        </div>
      </main>
    </>
  );
};

export default Index;