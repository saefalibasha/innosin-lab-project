
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import StreamlinedFileUpload from '@/components/ui/StreamlinedFileUpload';

interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  project_type: string;
  before_image: string;
  after_image: string;
  completion_date: string;
  display_order: number;
  is_active: boolean;
}

interface ProjectForm {
  title: string;
  description: string;
  location: string;
  project_type: string;
  before_image: string;
  after_image: string;
  completion_date: string;
  display_order: number;
  is_active: boolean;
}

const ProjectEditor = () => {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<ProjectForm>({
    title: '',
    description: '',
    location: '',
    project_type: '',
    before_image: '',
    after_image: '',
    completion_date: '',
    display_order: 0,
    is_active: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['before-after-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('before_after_projects')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data as Project[];
    }
  });

  const createProjectMutation = useMutation({
    mutationFn: async (project: Omit<Project, 'id'>) => {
      const { data, error } = await supabase
        .from('before_after_projects')
        .insert([project])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['before-after-projects'] });
      setIsCreating(false);
      resetForm();
      toast({ title: "Success", description: "Project created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to create project", variant: "destructive" });
      console.error('Create project error:', error);
    }
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, ...project }: Project) => {
      const { data, error } = await supabase
        .from('before_after_projects')
        .update(project)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['before-after-projects'] });
      setEditingProject(null);
      resetForm();
      toast({ title: "Success", description: "Project updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to update project", variant: "destructive" });
      console.error('Update project error:', error);
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('before_after_projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['before-after-projects'] });
      toast({ title: "Success", description: "Project deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to delete project", variant: "destructive" });
      console.error('Delete project error:', error);
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      project_type: '',
      before_image: '',
      after_image: '',
      completion_date: '',
      display_order: 0,
      is_active: true
    });
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description || '',
      location: project.location || '',
      project_type: project.project_type || '',
      before_image: project.before_image || '',
      after_image: project.after_image || '',
      completion_date: project.completion_date || '',
      display_order: project.display_order,
      is_active: project.is_active
    });
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }

    if (editingProject) {
      updateProjectMutation.mutate({ ...editingProject, ...formData });
    } else {
      createProjectMutation.mutate(formData);
    }
  };

  const handleCancel = () => {
    setEditingProject(null);
    setIsCreating(false);
    resetForm();
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading projects...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Before & After Projects</h3>
        <Button
          onClick={() => setIsCreating(true)}
          disabled={isCreating || editingProject}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Project
        </Button>
      </div>

      {(isCreating || editingProject) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Project title"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Project location"
                />
              </div>
              <div>
                <Label htmlFor="project_type">Project Type</Label>
                <Input
                  id="project_type"
                  value={formData.project_type}
                  onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                  placeholder="e.g., Laboratory Renovation"
                />
              </div>
              <div>
                <Label htmlFor="completion_date">Completion Date</Label>
                <Input
                  id="completion_date"
                  type="date"
                  value={formData.completion_date}
                  onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Project description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Before Image</Label>
                <StreamlinedFileUpload
                  onFileUploaded={(url) => setFormData({ ...formData, before_image: url })}
                  currentImage={formData.before_image}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>After Image</Label>
                <StreamlinedFileUpload
                  onFileUploaded={(url) => setFormData({ ...formData, after_image: url })}
                  currentImage={formData.after_image}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{project.title}</h4>
                    <Badge variant={project.is_active ? "default" : "secondary"}>
                      {project.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {project.description}
                    </p>
                  )}
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {project.location && <span>Location: {project.location}</span>}
                    {project.project_type && <span>Type: {project.project_type}</span>}
                    {project.completion_date && <span>Completed: {project.completion_date}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(project)}
                    disabled={isCreating || editingProject}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteProjectMutation.mutate(project.id)}
                    disabled={deleteProjectMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProjectEditor;
