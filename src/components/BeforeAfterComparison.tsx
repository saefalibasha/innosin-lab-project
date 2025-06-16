
import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  location: string;
  beforeImage: string;
  afterImage: string;
  description: string;
  completionDate: string;
  projectType: string;
}

const BeforeAfterComparison = () => {
  const [currentProject, setCurrentProject] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const projects: Project[] = [
    {
      id: 1,
      title: 'NUS Chemistry Laboratory Renovation',
      location: 'National University of Singapore',
      beforeImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=500&fit=crop',
      afterImage: 'https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=800&h=500&fit=crop',
      description: 'Complete transformation of outdated chemistry lab with new fume hoods, safety equipment, and modern lab benches.',
      completionDate: '2024-01-15',
      projectType: 'University Lab'
    },
    {
      id: 2,
      title: 'SGH Pathology Laboratory',
      location: 'Singapore General Hospital',
      beforeImage: 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=800&h=500&fit=crop',
      afterImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=500&fit=crop',
      description: 'Modern pathology lab setup with biosafety cabinets and specialized storage solutions.',
      completionDate: '2023-12-10',
      projectType: 'Hospital Lab'
    },
    {
      id: 3,
      title: 'Biotech Research Facility',
      location: 'Biopolis, Singapore',
      beforeImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=500&fit=crop',
      afterImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=500&fit=crop',
      description: 'State-of-the-art biotech research facility with cleanroom standards and advanced equipment.',
      completionDate: '2023-11-20',
      projectType: 'Research Institute'
    }
  ];

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const nextProject = () => {
    setCurrentProject((prev) => (prev + 1) % projects.length);
    setSliderPosition(50); // Reset slider position
  };

  const prevProject = () => {
    setCurrentProject((prev) => (prev - 1 + projects.length) % projects.length);
    setSliderPosition(50); // Reset slider position
  };

  const project = projects[currentProject];

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="overflow-hidden shadow-2xl">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Image Comparison */}
            <div className="lg:col-span-2 relative">
              <div
                ref={containerRef}
                className="relative w-full h-96 lg:h-[500px] overflow-hidden cursor-col-resize"
                onMouseMove={handleMouseMove}
              >
                {/* After Image (background) */}
                <img
                  src={project.afterImage}
                  alt="After transformation"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Before Image (clipped) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <img
                    src={project.beforeImage}
                    alt="Before transformation"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Slider Line */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-col-resize"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <div className="w-4 h-4 border-l-2 border-r-2 border-gray-400"></div>
                  </div>
                </div>

                {/* Labels */}
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold">
                  BEFORE
                </div>
                <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold">
                  AFTER
                </div>

                {/* Navigation Arrows */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevProject}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextProject}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Project Details */}
            <div className="p-8 bg-gray-50">
              <div className="mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded mb-2">
                  {project.projectType}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {project.title}
                </h3>
                <p className="text-gray-600 text-sm mb-1">{project.location}</p>
                <p className="text-gray-500 text-xs">
                  Completed: {new Date(project.completionDate).toLocaleDateString()}
                </p>
              </div>

              <p className="text-gray-700 text-sm leading-relaxed mb-6">
                {project.description}
              </p>

              {/* Project Indicators */}
              <div className="flex space-x-2 mb-4">
                {projects.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentProject ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    onClick={() => {
                      setCurrentProject(index);
                      setSliderPosition(50);
                    }}
                  />
                ))}
              </div>

              <div className="text-xs text-gray-500">
                <p className="mb-1">💡 Drag the slider to compare before and after</p>
                <p>Use arrow buttons to view more projects</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BeforeAfterComparison;
