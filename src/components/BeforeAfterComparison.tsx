import React from 'react';
import BeforeAfterSlider from './BeforeAfterSlider';

const BeforeAfterComparison = () => {
  return (
    <div className="space-y-12">
      {/* University Chemistry Lab Transformation */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-serif font-semibold text-primary mb-4">
          University Chemistry Lab Transformation
        </h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          From outdated equipment to cutting-edge research facility
        </p>
      </div>
      
      <BeforeAfterSlider
        // BEFORE IMAGE - Replace with: public/before-after/university-chemistry-before.jpg
        // Current: Placeholder image, should show outdated laboratory setup
        beforeImage="https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop"
        // AFTER IMAGE - Replace with: public/before-after/university-chemistry-after.jpg  
        // Current: Placeholder image, should show modern laboratory transformation
        afterImage="https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&h=600&fit=crop"
        beforeLabel="Before: Outdated Equipment"
        afterLabel="After: Modern Research Facility"
      />
      
      {/* Research Institute Upgrade */}
      <div className="text-center mb-8 mt-16">
        <h3 className="text-2xl font-serif font-semibold text-primary mb-4">
          Research Institute Upgrade
        </h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Complete facility modernization with advanced safety systems
        </p>
      </div>
      
      <BeforeAfterSlider
        // BEFORE IMAGE - Replace with: public/before-after/research-institute-before.jpg
        // Current: Placeholder image, should show outdated research facility
        beforeImage="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop"
        // AFTER IMAGE - Replace with: public/before-after/research-institute-after.jpg
        // Current: Placeholder image, should show upgraded research facility
        afterImage="https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&h=600&fit=crop"
        beforeLabel="Before: Basic Setup"
        afterLabel="After: Advanced Safety Systems"
      />
    </div>
  );
};

export default BeforeAfterComparison;
