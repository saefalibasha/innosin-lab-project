
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface BeforeAfterProject {
  id: string;
  title: string;
  description: string;
  location: string;
  project_type: string;
  completion_date: string;
  before_image: string;
  after_image: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const BeforeAfterProjectManagement = () => {
  const [editingProject, setEditingProject] = useState<BeforeAfterProject | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<BeforeAfterProject>>({});
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['before-after-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('before_after_projects')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as BeforeAfterProject[];
    }
  });

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: Partial<BeforeAfterProject>) => {
      const { data, error } = await supabase
        .from('before_after_projects')
        .insert([projectData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['before-after-projects'] });
      toast.success('Project created successfully');
      handleCancel();
    },
    onError: (error) => {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, ...projectData }: Partial<BeforeAfterProject> & { id: string }) => {
      const { data, error } = await supabase
        .from('before_after_projects')
        .update(projectData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['before-after-projects'] });
      toast.success('Project updated successfully');
      handleCancel();
    },
    onError: (error) => {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
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
      toast.success('Project deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  });

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      title: '',
      description: '',
      location: '',
      project_type: '',
      completion_date: '',
      before_image: '',
      after_image: '',
      is_active: true,
      display_order: projects.length
    });
  };

  const handleEdit = (project: BeforeAfterProject) => {
    setEditingProject(project);
    setFormData(project);
  };

  const handleSave = () => {
    if (isCreating) {
      createProjectMutation.mutate(formData);
    } else if (editingProject) {
      updateProjectMutation.mutate({ ...formData, id: editingProject.id });
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingProject(null);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProjectMutation.mutate(id);
    }
  };

  const handleInputChange = (field: keyof BeforeAfterProject, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading projects...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Before & After Projects
            </CardTitle>
            {!isCreating && !editingProject && (
              <Button onClick={handleCreate} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Project
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {(isCreating || editingProject) && (
            <div className="space-y-4 p-4 border rounded-lg mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {isCreating ? 'Create New Project' : 'Edit Project'}
                </h3>
                <div className="flex gap-2">
                  <Button onClick={handleSave} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter project title"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Project location"
                  />
                </div>
                <div>
                  <Label htmlFor="project_type">Project Type</Label>
                  <Input
                    id="project_type"
                    value={formData.project_type || ''}
                    onChange={(e) => handleInputChange('project_type', e.target.value)}
                    placeholder="e.g., Laboratory Renovation"
                  />
                </div>
                <div>
                  <Label htmlFor="completion_date">Completion Date</Label>
                  <Input
                    id="completion_date"
                    type="date"
                    value={formData.completion_date || ''}
                    onChange={(e) => handleInputChange('completion_date', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the project transformation"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="before_image">Before Image URL</Label>
                  <Input
                    id="before_image"
                    value={formData.before_image || ''}
                    onChange={(e) => handleInputChange('before_image', e.target.value)}
                    placeholder="URL to before image"
                  />
                </div>
                <div>
                  <Label htmlFor="after_image">After Image URL</Label>
                  <Input
                    id="after_image"
                    value={formData.after_image || ''}
                    onChange={(e) => handleInputChange('after_image', e.target.value)}
                    placeholder="URL to after image"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active || false}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  />
                  <Label>Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order || 0}
                    onChange={(e) => handleInputChange('display_order', parseInt(e.target.value))}
                    className="w-20"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {projects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No projects found. Create your first before & after project.
              </div>
            ) : (
              projects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{project.title}</h3>
                        <Badge variant={project.is_active ? "default" : "secondary"}>
                          {project.is_active ? (
                            <><Eye className="w-3 h-3 mr-1" /> Active</>
                          ) : (
                            <><EyeOff className="w-3 h-3 mr-1" /> Inactive</>
                          )}
                        </Badge>
                        {project.project_type && (
                          <Badge variant="outline">{project.project_type}</Badge>
                        )}
                      </div>
                      
                      {project.description && (
                        <p className="text-muted-foreground mb-2">{project.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {project.location && <span>📍 {project.location}</span>}
                        {project.completion_date && (
                          <span>📅 {new Date(project.completion_date).toLocaleDateString()}</span>
                        )}
                        <span>Order: {project.display_order}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(project)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(project.id)}
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {(project.before_image || project.after_image) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {project.before_image && (
                        <div>
                          <Label className="text-sm font-medium">Before</Label>
                          <img
                            src={project.before_image}
                            alt="Before"
                            className="w-full h-32 object-cover rounded border mt-1"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        </div>
                      )}
                      {project.after_image && (
                        <div>
                          <Label className="text-sm font-medium">After</Label>
                          <img
                            src={project.after_image}
                            alt="After"
                            className="w-full h-32 object-cover rounded border mt-1"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BeforeAfterProjectManagement;
