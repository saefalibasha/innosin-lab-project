import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Upload, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Project {
  id: string;
  title: string;
  location: string;
  before_image: string;
  after_image: string;
  description: string;
  completion_date: string;
  project_type: string;
  is_active: boolean;
  display_order: number;
}

export const ProjectEditor = () => {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch projects
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['admin-before-after-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('before_after_projects')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Create/Update project mutation
  const saveProjectMutation = useMutation({
    mutationFn: async (project: any) => {
      if (project.id) {
        const { error } = await supabase
          .from('before_after_projects')
          .update(project)
          .eq('id', project.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('before_after_projects')
          .insert(project);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-before-after-projects'] });
      queryClient.invalidateQueries({ queryKey: ['before-after-projects'] });
      setIsDialogOpen(false);
      setEditingProject(null);
      toast.success('Project saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save project: ' + error.message);
    }
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('before_after_projects')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-before-after-projects'] });
      queryClient.invalidateQueries({ queryKey: ['before-after-projects'] });
      toast.success('Project deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete project: ' + error.message);
    }
  });

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingProject({
      id: '',
      title: '',
      location: '',
      before_image: '',
      after_image: '',
      description: '',
      completion_date: '',
      project_type: '',
      is_active: true,
      display_order: projects.length + 1
    });
    setIsDialogOpen(true);
  };

  const handleSave = (formData: FormData) => {
    const projectData = {
      id: editingProject?.id || undefined,
      title: formData.get('title') as string,
      location: formData.get('location') as string,
      before_image: formData.get('before_image') as string,
      after_image: formData.get('after_image') as string,
      description: formData.get('description') as string,
      completion_date: formData.get('completion_date') as string,
      project_type: formData.get('project_type') as string,
      is_active: formData.get('is_active') === 'on',
      display_order: parseInt(formData.get('display_order') as string)
    };

    saveProjectMutation.mutate(projectData);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading projects...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Manage Before/After Projects</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProject?.id ? 'Edit Project' : 'Add New Project'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(new FormData(e.currentTarget)); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={editingProject?.title}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    defaultValue={editingProject?.location}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="before_image">Before Image URL</Label>
                  <Input
                    id="before_image"
                    name="before_image"
                    defaultValue={editingProject?.before_image}
                    placeholder="/path/to/before-image.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="after_image">After Image URL</Label>
                  <Input
                    id="after_image"
                    name="after_image"
                    defaultValue={editingProject?.after_image}
                    placeholder="/path/to/after-image.jpg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="project_type">Project Type</Label>
                  <Input
                    id="project_type"
                    name="project_type"
                    defaultValue={editingProject?.project_type}
                    placeholder="University Laboratory"
                  />
                </div>
                <div>
                  <Label htmlFor="completion_date">Completion Date</Label>
                  <Input
                    id="completion_date"
                    name="completion_date"
                    type="date"
                    defaultValue={editingProject?.completion_date}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingProject?.description}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    name="display_order"
                    type="number"
                    defaultValue={editingProject?.display_order}
                    min="1"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    name="is_active"
                    defaultChecked={editingProject?.is_active}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saveProjectMutation.isPending}>
                  {saveProjectMutation.isPending ? 'Saving...' : 'Save Project'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {projects.map((project) => (
          <Card key={project.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{project.location}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant={project.is_active ? 'default' : 'secondary'}>
                      {project.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">{project.project_type}</Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(project)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteProjectMutation.mutate(project.id)}
                    disabled={deleteProjectMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium">Before Image:</p>
                  {project.before_image && (
                    <img
                      src={project.before_image}
                      alt="Before"
                      className="w-full h-24 object-cover rounded mt-1"
                    />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">After Image:</p>
                  {project.after_image && (
                    <img
                      src={project.after_image}
                      alt="After"
                      className="w-full h-24 object-cover rounded mt-1"
                    />
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};