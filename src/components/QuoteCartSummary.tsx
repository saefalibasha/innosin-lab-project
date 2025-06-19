
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';

interface QuoteCartSummaryProps {
  itemCount: number;
}

const QuoteCartSummary: React.FC<QuoteCartSummaryProps> = ({ itemCount }) => {
  if (itemCount === 0) return null;

  return (
    <AnimatedSection animation="slide-in-right" delay={0}>
      <div className="fixed bottom-6 right-6 glass-card text-foreground p-4 rounded-lg shadow-lg animate-float z-40">
        <div className="flex items-center space-x-3">
          <ShoppingCart className="w-5 h-5 text-sea" />
          <span>{itemCount} items in quote</span>
          <Button size="sm" variant="secondary" asChild>
            <a href="/rfq-cart">View Cart</a>
          </Button>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default QuoteCartSummary;
