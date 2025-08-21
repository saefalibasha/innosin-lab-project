
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { homePageContent } from '@/data/homePageContent';

const LabTransformCTA = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-white via-gray-50/30 to-sea/5 relative overflow-hidden transition-all duration-700 ease-in-out">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6 tracking-tight">
            {homePageContent.labTransformCTA.title} <span className="text-sea">{homePageContent.labTransformCTA.titleHighlight}</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            {homePageContent.labTransformCTA.description}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in">
          <Button asChild variant="default" size="lg" className="transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <Link to="/contact">
              {homePageContent.labTransformCTA.getStartedButton} <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="transition-all duration-300 hover:scale-105 hover:shadow-lg border-2">
            <Link to="/floor-planner">
              {homePageContent.labTransformCTA.floorPlannerButton}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LabTransformCTA;
