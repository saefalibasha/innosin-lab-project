import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const projects: Project[] = [
    {
      id: 1,
      title: 'NTU Exxon Mobil',
      location: 'Nanyang Technological University',
      beforeImage: '/before-after-projects/university-lab-before.jpg',
      afterImage: '/before-after-projects/university-lab-after.jpg',
      description: 'We completed addition and alteration works at the ExxonMobil laboratory, Academic Building North, Nanyang Technological University. The scope included the design, fabrication, and installation of modular laboratory furniture systems with 20mm thick graphite epoxy Hychem worktops, powder-coated steel frames, integrated service fixtures, custom storage solutions, and specialized enclosures. The upgrade ensures enhanced durability, chemical resistance, and full compliance with laboratory safety standards.',
      completionDate: '2025-06-26',
      projectType: 'University Laboratory'
    },
    {
      id: 2,
      title: 'NTU Exxon Mobil',
      location: 'Nanyang Technological University',
      beforeImage: '/before-after-projects/hospital-pathology-before.jpg',
      afterImage: '/before-after-projects/hospital-pathology-after.jpg',
      description: 'We completed addition and alteration works at the ExxonMobil laboratory, Academic Building North, Nanyang Technological University. The scope included the design, fabrication, and installation of modular laboratory furniture systems with 20mm thick graphite epoxy Hychem worktops, powder-coated steel frames, integrated service fixtures, custom storage solutions, and specialized enclosures. The upgrade ensures enhanced durability, chemical resistance, and full compliance with laboratory safety standards.',
      completionDate: '2025-06-26',
      projectType: 'Medical Facility'
    },
    {
      id: 3,
      title: 'Biotech Research Facility',
      location: 'Biopolis, Singapore',
      beforeImage: '/before-after-projects/biotech-research-before.jpg',
      afterImage: '/before-after-projects/biotech-research-after.jpg',
      description: 'State-of-the-art biotech research facility with cleanroom standards, advanced equipment, and precision environmental controls.',
      completionDate: '2023-11-20',
      projectType: 'Research Institute'
    }
  ];

  const updateSliderPosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateSliderPosition(e.clientX);
  }, [updateSliderPosition]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    updateSliderPosition(e.clientX);
  }, [isDragging, updateSliderPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const touch = e.touches[0];
    updateSliderPosition(touch.clientX);
  }, [updateSliderPosition]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    updateSliderPosition(touch.clientX);
  }, [isDragging, updateSliderPosition]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const nextProject = () => {
    setCurrentProject((prev) => (prev + 1) % projects.length);
    setSliderPosition(50);
  };

  const prevProject = () => {
    setCurrentProject((prev) => (prev - 1 + projects.length) % projects.length);
    setSliderPosition(50);
  };

  const switchToProject = (index: number) => {
    setCurrentProject(index);
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
                className={`relative w-full h-96 lg:h-[600px] overflow-hidden select-none cursor-col-resize`}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              >
                {/* After Image (background - shows when dragging right) */}
                <img
                  src={project.afterImage}
                  alt="After transformation"
                  className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                  draggable={false}
                />
                
                {/* Before Image (clipped from right - shows when dragging left) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ 
                    clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                    transition: isDragging ? 'none' : 'clip-path 0.1s ease-out'
                  }}
                >
                  <img
                    src={project.beforeImage}
                    alt="Before transformation"
                    className={`w-full h-full object-cover pointer-events-none ${
                      currentProject === 1 ? 'object-[25%_70%]' : 'object-center'
                    }`}
                    draggable={false}
                  />
                </div>

                {/* Slider Line */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl pointer-events-none z-10"
                  style={{ 
                    left: `${sliderPosition}%`,
                    transition: isDragging ? 'none' : 'left 0.1s ease-out'
                  }}
                >
                  <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-gray-100 pointer-events-none ${
                    isDragging ? 'scale-110' : ''
                  } transition-transform duration-150`}>
                    <div className="w-6 h-6 border-l-2 border-r-2 border-gray-600"></div>
                  </div>
                </div>

                {/* Labels show what you'll see if you drag towards that side */}
                {currentProject === 1 ? (
                  <>
                    {sliderPosition >= 50 && (
                      <div className="absolute top-6 left-6 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg pointer-events-none transition-opacity duration-300">
                        BEFORE
                      </div>
                    )}
                    {sliderPosition < 50 && (
                      <div className="absolute top-6 right-6 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg pointer-events-none transition-opacity duration-300">
                        AFTER
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {sliderPosition >= 50 && (
                      <div className="absolute top-6 left-6 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg pointer-events-none transition-opacity duration-300">
                        AFTER
                      </div>
                    )}
                    {sliderPosition < 50 && (
                      <div className="absolute top-6 right-6 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg pointer-events-none transition-opacity duration-300">
                        BEFORE
                      </div>
                    )}
                  </>
                )}
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

              {/* Project Navigation - Repositioned outside interaction area */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-600">Browse Projects</h4>
                  <span className="text-xs text-gray-500">{currentProject + 1} of {projects.length}</span>
                </div>
                
                {/* Project Indicators with Navigation */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-3">
                    {projects.map((_, index) => (
                      <button
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentProject 
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 scale-125' 
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        onClick={() => switchToProject(index)}
                      />
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevProject}
                      className="bg-white hover:bg-gray-50 border border-gray-300 rounded-full w-8 h-8 p-0 transition-all duration-300 hover:scale-110"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextProject}
                      className="bg-white hover:bg-gray-50 border border-gray-300 rounded-full w-8 h-8 p-0 transition-all duration-300 hover:scale-110"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 space-y-1 bg-gray-100 p-4 rounded-xl">
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Drag the slider to compare before and after
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Click dots or arrows to switch projects
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
