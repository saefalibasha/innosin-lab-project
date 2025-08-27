import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface Project {
  id: string;
  title: string;
  location: string;
  before_image?: string;
  after_image?: string;
  description?: string;
  completion_date?: string;
  project_type?: string;
  // normalized fields used in the UI below:
  beforeImage: string;
  afterImage: string;
  completionDate: string;
  projectType: string;
}

const MIN_CLIP = 2;   // tighten the bounds so it doesn't feel sticky
const MAX_CLIP = 98;

const BeforeAfterComparison = () => {
  const [currentProject, setCurrentProject] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);   // percent
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const boundsRef = useRef<DOMRect | null>(null);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['before-after-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('before_after_projects')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      return (data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        location: p.location || '',
        beforeImage: p.before_image || '',
        afterImage: p.after_image || '',
        description: p.description || '',
        completionDate: p.completion_date || '',
        projectType: p.project_type || '',
      })) as Project[];
    },
  });

  const setPositionFromClientX = useCallback((clientX: number) => {
    if (!boundsRef.current) return;
    const rect = boundsRef.current;
    const x = clientX - rect.left;
    // convert to percent and clamp
    const pct = Math.max(MIN_CLIP, Math.min(MAX_CLIP, (x / rect.width) * 100));
    setSliderPosition(pct);
  }, []);

  // Pointer handlers — super responsive on mouse AND touch
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    boundsRef.current = containerRef.current?.getBoundingClientRect() || null;
    setIsDragging(true);
    // capture future pointer events to this element (prevents losing the drag)
    (e.currentTarget as HTMLDivElement).setPointerCapture?.(e.pointerId);
    setPositionFromClientX(e.clientX);
  }, [setPositionFromClientX]);

  const onWindowPointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging) return;
    // no throttling – update every move for speed
    setPositionFromClientX(e.clientX);
  }, [isDragging, setPositionFromClientX]);

  const onWindowPointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    boundsRef.current = null;
  }, [isDragging]);

  useEffect(() => {
    if (!isDragging) return;
    // Use passive: false so we can prevent default on touch if needed
    window.addEventListener('pointermove', onWindowPointerMove, { passive: false });
    window.addEventListener('pointerup', onWindowPointerUp, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onWindowPointerUp);
    };
  }, [isDragging, onWindowPointerMove, onWindowPointerUp]);

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

  if (!projects.length) return null;

  const nextProject = () => {
    setCurrentProject((p) => (p + 1) % projects.length);
    setSliderPosition(50);
  };

  const prevProject = () => {
    setCurrentProject((p) => (p - 1 + projects.length) % projects.length);
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
            {/* BEFORE/AFTER area */}
            <div className="lg:col-span-2 relative">
              <div
                ref={containerRef}
                className="relative w-full h-96 lg:h-[600px] overflow-hidden select-none cursor-col-resize touch-none"
                onPointerDown={onPointerDown}
              >
                {/* BEFORE */}
                <img
                  src={project.beforeImage}
                  alt="Before transformation"
                  className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                  draggable={false}
                />

                {/* AFTER (clipped) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                    // no transition while dragging, tiny snap when released
                    transition: isDragging ? 'none' : 'clip-path 40ms ease-out',
                  }}
                >
                  <img
                    src={project.afterImage}
                    alt="After transformation"
                    className="w-full h-full object-cover object-center pointer-events-none"
                    draggable={false}
                  />
                </div>

                {/* Divider + Handle */}
                <div
                  className="absolute top-0 bottom-0 w-[3px] bg-white shadow-2xl pointer-events-none z-10"
                  style={{
                    left: `${sliderPosition}%`,
                    transition: isDragging ? 'none' : 'left 40ms ease-out',
                  }}
                >
                  {/* Increase hit feel visually */}
                  <div
                    className={[
                      'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                      'w-14 h-14 bg-white rounded-full shadow-xl border-4 border-gray-100',
                      'flex items-center justify-center',
                      'transition-transform duration-100 ease-out',
                      isDragging ? 'scale-110' : 'group-hover:scale-105',
                    ].join(' ')}
                  >
                    <div className="w-7 h-7 border-l-2 border-r-2 border-gray-700" />
                  </div>
                </div>

                {/* Labels (hide when near the opposite side) */}
                {sliderPosition >= 28 && (
                  <div className="absolute top-6 left-6 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg pointer-events-none">
                    BEFORE
                  </div>
                )}
                {sliderPosition <= 72 && (
                  <div className="absolute top-6 right-6 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg pointer-events-none">
                    AFTER
                  </div>
                )}
              </div>
            </div>

            {/* Right panel */}
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
                  Completed:{' '}
                  {project.completionDate
                    ? new Date(project.completionDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '—'}
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed mb-8 font-light">
                {project.description}
              </p>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-600">Browse Projects</h4>
                  <span className="text-xs text-gray-500">
                    {currentProject + 1} of {projects.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-3">
                    {projects.map((_, index) => (
                      <button
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${
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
                      className="bg-white hover:bg-gray-50 border border-gray-300 rounded-full w-8 h-8 p-0 transition-all duration-200 hover:scale-110"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextProject}
                      className="bg-white hover:bg-gray-50 border border-gray-300 rounded-full w-8 h-8 p-0 transition-all duration-200 hover:scale-110"
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
