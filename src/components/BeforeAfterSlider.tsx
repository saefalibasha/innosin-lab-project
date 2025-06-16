
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BeforeAfterSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const projects = [
    {
      id: 1,
      title: 'University Chemistry Lab',
      before: '/placeholder.svg',
      after: '/placeholder.svg',
      description: 'Complete renovation of chemistry laboratory with new fume hoods and safety systems'
    },
    {
      id: 2,
      title: 'Research Institute Cleanroom',
      before: '/placeholder.svg',
      after: '/placeholder.svg',
      description: 'Installation of specialized cleanroom equipment and controlled environment systems'
    },
    {
      id: 3,
      title: 'Hospital Laboratory',
      before: '/placeholder.svg',
      after: '/placeholder.svg',
      description: 'Medical laboratory setup with biosafety cabinets and sterile work environments'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % projects.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + projects.length) % projects.length);
  };

  const currentProject = projects[currentSlide];

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Before Image */}
            <div className="relative">
              <img 
                src={currentProject.before} 
                alt="Before transformation"
                className="w-full h-64 md:h-80 object-cover"
              />
              <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold">
                BEFORE
              </div>
            </div>
            
            {/* After Image */}
            <div className="relative">
              <img 
                src={currentProject.after} 
                alt="After transformation"
                className="w-full h-64 md:h-80 object-cover"
              />
              <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold">
                AFTER
              </div>
            </div>
          </div>
          
          {/* Project Info */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-black mb-2">{currentProject.title}</h3>
            <p className="text-gray-600 mb-4">{currentProject.description}</p>
            
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {projects.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentSlide ? 'bg-black' : 'bg-gray-300'
                    }`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={prevSlide}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={nextSlide}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BeforeAfterSlider;
