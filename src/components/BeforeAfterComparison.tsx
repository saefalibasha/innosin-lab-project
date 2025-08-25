import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface Project {
  id: string;
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
  const containerBounds = useRef<DOMRect | null>(null);
  const animationFrame = useRef<number>();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['before-after-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('before_after_projects')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;

      return data.map(project => ({
        id: project.id,
        title: project.title,
        location: project.location || '',
        beforeImage: project.before_image || '',
        afterImage: project.after_image || '',
        description: project.description || '',
        completionDate: project.completion_date || '',
        projectType: project.project_type || ''
      }));
    }
  });

  const updateSliderPosition = useCallback((clientX: number) => {
    if (!containerBounds.current) return;
    const rect = containerBounds.current;
    const x = clientX - rect.left;
    const percentage = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const throttledUpdate = useCallback((clientX: number) => {
    if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    animationFrame.current = requestAnimationFrame(() => {
      updateSliderPosition(clientX);
    });
  }, [updateSliderPosition]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    containerBounds.current = containerRef.current?.getBoundingClientRect() || null;
    updateSliderPosition(e.clientX);
  }, [updateSliderPosition]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    throttledUpdate(e.clientX);
  }, [isDragging, throttledUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    containerBounds.current = null;
    if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    containerBounds.current = containerRef.current?.getBoundingClientRect() || null;
    const touch = e.touches[0];
    updateSliderPosition(touch.clientX);
  }, [updateSliderPosition]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    throttledUpdate(touch.clientX);
  }, [isDragging, throttledUpdate]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    containerBounds.current = null;
    if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card className="overflow-hidden shadow-2xl border-0 bg-white rounded-3xl">
          <CardContent className="p-12 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!projects.length) {
    return null;
  }

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
            <div className="lg:col-span-2 relative">
              <div
                ref={containerRef}
                className="relative w-full h-96 lg:h-[600px] overflow-hidden select-none cursor-col-resize"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              >
                <img
                  src={project.beforeImage}
                  alt="Before transformation"
                  className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                  draggable={false}
                />
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                    transition: isDragging ? 'none' : 'clip-path 0.08s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <img
                    src={project.afterImage}
                    alt="After transformation"
                    className="w-full h-full object-cover pointer-events-none object-center"
                    draggable={false}
                  />
                </div>
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl pointer-events-none z-10"
                  style={{
                    left: `${sliderPosition}%`,
                    transition: isDragging ? 'none' : 'left 0.08s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-gray-100 pointer-events-none ${
                    isDragging ? 'scale-110' : 'hover:scale-105'
                  } transition-all duration-200 ease-out`}>
                    <div className="w-6 h-6 border-l-2 border-r-2 border-gray-600"></div>
                  </div>
                </div>
                {sliderPosition >= 30 && (
                  <div className="absolute top-6 left-6 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg pointer-events-none transition-opacity duration-300">
                    BEFORE
                  </div>
                )}
                {sliderPosition <= 70 && (
                  <div className="absolute top-6 right-6 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg pointer-events-none transition-opacity duration-300">
                    AFTER
                  </div>
                )}
              </div>
            </div>
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
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-600">Browse Projects</h4>
                  <span className="text-xs text-gray-500">{currentProject + 1} of {projects.length}</span>
                </div>
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

