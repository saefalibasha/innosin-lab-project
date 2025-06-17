
import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react';

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
      description: 'Complete transformation of outdated chemistry lab with new fume hoods, safety equipment, and modern lab benches creating a state-of-the-art research environment.',
      completionDate: '2024-01-15',
      projectType: 'University Laboratory'
    },
    {
      id: 2,
      title: 'SGH Pathology Laboratory',
      location: 'Singapore General Hospital',
      beforeImage: 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=800&h=500&fit=crop',
      afterImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=500&fit=crop',
      description: 'Modern pathology lab setup with biosafety cabinets, specialized storage solutions, and advanced diagnostic equipment infrastructure.',
      completionDate: '2023-12-10',
      projectType: 'Medical Facility'
    },
    {
      id: 3,
      title: 'Biotech Research Facility',
      location: 'Biopolis, Singapore',
      beforeImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=500&fit=crop',
      afterImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=500&fit=crop',
      description: 'State-of-the-art biotech research facility with cleanroom standards, advanced equipment, and precision environmental controls.',
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
    setSliderPosition(50);
  };

  const prevProject = () => {
    setCurrentProject((prev) => (prev - 1 + projects.length) % projects.length);
    setSliderPosition(50);
  };

  const project = projects[currentProject];

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="overflow-hidden shadow-2xl border-0 bg-white rounded-3xl">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Image Comparison */}
            <div className="lg:col-span-2 relative">
              <div
                ref={containerRef}
                className="relative w-full h-96 lg:h-[600px] overflow-hidden cursor-col-resize"
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
                  className="absolute inset-0 overflow-hidden transition-all duration-300"
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
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl cursor-col-resize transition-all duration-300"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-gray-100 hover:scale-110 transition-transform duration-300">
                    <div className="w-6 h-6 border-l-2 border-r-2 border-gray-600"></div>
                  </div>
                </div>

                {/* Enhanced Labels */}
                <div className="absolute top-6 left-6 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  BEFORE
                </div>
                <div className="absolute top-6 right-6 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  AFTER
                </div>

                {/* Navigation Arrows */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevProject}
                  className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white border-0 shadow-xl rounded-full w-12 h-12 p-0 transition-all duration-300 hover:scale-110"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextProject}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white border-0 shadow-xl rounded-full w-12 h-12 p-0 transition-all duration-300 hover:scale-110"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Project Details */}
            <div className="p-10 bg-gradient-to-br from-gray-50 to-white">
              <div className="mb-6">
                <span className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-medium px-3 py-1 rounded-full mb-4 shadow-sm">
                  {project.projectType}
                </span>
                <h3 className="text-2xl font-light text-gray-900 mb-3 leading-tight">
                  {project.title}
                </h3>
                
                <div className="flex items-center text-gray-600 text-sm mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  {project.location}
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Completed: {new Date(project.completionDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed mb-8 font-light">
                {project.description}
              </p>

              {/* Project Indicators */}
              <div className="flex space-x-3 mb-6">
                {projects.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentProject 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 scale-125' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    onClick={() => {
                      setCurrentProject(index);
                      setSliderPosition(50);
                    }}
                  />
                ))}
              </div>

              <div className="text-xs text-gray-500 space-y-1 bg-gray-100 p-4 rounded-xl">
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Drag the slider to compare before and after
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Use arrow buttons to view more projects
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BeforeAfterComparison;
