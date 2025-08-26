
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import BeforeAfterComparison from '@/components/ui/BeforeAfterComparison';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';

interface BeforeAfterProject {
  id: string;
  title: string;
  description: string;
  before_image: string;
  after_image: string;
  location: string;
  completion_date: string;
  project_type: string;
  is_active: boolean;
  display_order: number;
}

const BeforeAfterProjects = () => {
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['before-after-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('before_after_projects')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as BeforeAfterProject[];
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          <p>Error loading projects. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">Before & After Projects</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover the transformational power of our laboratory solutions through real project showcases
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No projects available at this time.</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{project.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {project.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {project.location}
                        </div>
                      )}
                      {project.completion_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(project.completion_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-muted-foreground">{project.description}</p>
                    )}
                  </div>
                  {project.project_type && (
                    <Badge variant="secondary">{project.project_type}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-96 w-full">
                  <BeforeAfterComparison
                    beforeImage={project.before_image}
                    afterImage={project.after_image}
                    beforeLabel="Before"
                    afterLabel="After"
                    className="h-full"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BeforeAfterProjects;
