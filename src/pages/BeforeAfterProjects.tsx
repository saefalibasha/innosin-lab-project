import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import BeforeAfterComparison from '@/components/BeforeAfterComparison'; // ✅ FIXED
import { Loader2, AlertCircle } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string | null;
  before_image: string | null;
  after_image: string | null;
  location: string | null;
  completion_date: string | null;
  project_type: string | null;
  display_order: number | null;
}

export const BeforeAfterProjects: React.FC = () => {
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['before-after-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('before_after_projects')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Project[];
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg text-destructive">Error loading projects</p>
          <p className="text-sm text-muted-foreground mt-2">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
        </div>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-8">Before & After Projects</h1>
            <p className="text-xl text-muted-foreground">No projects available at the moment.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Before & After Projects
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover the transformational power of our laboratory solutions. 
            See how we've helped transform workspaces into modern, efficient laboratories.
          </p>
        </div>

        <div className="space-y-24">
          {projects.map((project, index) => (
            <div key={project.id} className="space-y-8">
              {/* Project Header */}
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-foreground">
                  {project.title}
                </h2>
                {project.description && (
                  <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
                    {project.description}
                  </p>
                )}
                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                  {project.location && (
                    <span className="flex items-center gap-1">
                      📍 {project.location}
                    </span>
                  )}
                  {project.completion_date && (
                    <span className="flex items-center gap-1">
                      📅 {new Date(project.completion_date).toLocaleDateString()}
                    </span>
                  )}
                  {project.project_type && (
                    <span className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
                      {project.project_type}
                    </span>
                  )}
                </div>
              </div>

              {/* Before/After Comparison */}
              {project.before_image && project.after_image ? (
                <div className="max-w-6xl mx-auto">
                  <BeforeAfterComparison
                    beforeImage={project.before_image}
                    afterImage={project.after_image}
                    beforeLabel="Before"
                    afterLabel="After"
                  />
                </div>
              ) : (
                <div className="max-w-6xl mx-auto bg-muted rounded-lg p-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Images for this project are currently unavailable
                  </p>
                </div>
              )}

              {/* Separator for multiple projects */}
              {index < projects.length - 1 && (
                <div className="flex items-center justify-center pt-12">
                  <div className="w-24 h-px bg-border"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
