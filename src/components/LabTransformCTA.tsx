
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const LabTransformCTA = () => {
  return (
    <section className="section bg-gradient-to-br from-sea/10 via-background to-sea/5 relative overflow-hidden">
      <div className="container-custom text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-6 tracking-tight animate-fade-in">
          Ready to Transform Your <span className="text-sea">Laboratory?</span>
        </h2>
        <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto font-light leading-relaxed animate-fade-in animate-delay-200">
          Let's collaborate to create a laboratory solution that exceeds your expectations 
          and elevates your research capabilities to new heights.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center animate-scale-in animate-delay-500">
          <Button asChild variant="default" size="lg" className="transition-all duration-300 hover:scale-105">
            <Link to="/contact">
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="transition-all duration-300 hover:scale-105">
            <Link to="/floor-planner">
              Try Floor Planner
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LabTransformCTA;
