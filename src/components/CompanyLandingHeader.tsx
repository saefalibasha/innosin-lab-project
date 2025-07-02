import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCompanyTheme } from './CompanyThemeProvider';
import AnimatedSection from './AnimatedSection';

interface CompanyLandingHeaderProps {
  productsCount: number;
}

const CompanyLandingHeader: React.FC<CompanyLandingHeaderProps> = ({ productsCount }) => {
  const { activeTheme } = useCompanyTheme();

  if (!activeTheme) return null;

  return (
    <div className="company-themed bg-gradient-to-br from-background to-secondary/30 py-16 mb-12">
      <div className="container-custom">
        <AnimatedSection animation="fade-in" delay={100}>
          <div className="flex items-center gap-4 mb-6">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </AnimatedSection>

        <div className="text-center max-w-4xl mx-auto">
          <AnimatedSection animation="scale-in" delay={200}>
            <div className="flex justify-center mb-6">
              <img 
                src={activeTheme.logo}
                alt={`${activeTheme.name} Logo`}
                className="h-24 w-auto object-contain"
                style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
              />
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fade-in" delay={300}>
            <h1 className="text-5xl font-serif font-bold mb-6 company-themed:text-[hsl(var(--company-primary))] text-primary">
              {activeTheme.name}
            </h1>
          </AnimatedSection>

          <AnimatedSection animation="fade-in" delay={400}>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {activeTheme.description}
            </p>
          </AnimatedSection>

          <AnimatedSection animation="fade-in" delay={500}>
            <Badge 
              variant="outline" 
              className="text-lg px-6 py-3 company-themed:border-[hsl(var(--company-accent))] company-themed:text-[hsl(var(--company-accent))] border-sea text-sea"
            >
              {productsCount} Products Available
            </Badge>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};

export default CompanyLandingHeader;