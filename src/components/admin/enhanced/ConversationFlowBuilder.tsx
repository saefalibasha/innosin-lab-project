
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Loader2,
  Zap,
  ArrowRight,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConversationFlow {
  id: string;
  name: string;
  description: string;
  flow_data: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const ConversationFlowBuilder = () => {
  const [flows, setFlows] = useState<ConversationFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFlow, setEditingFlow] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [flowToDelete, setFlowToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    flow_data: {
      nodes: [],
      connections: [],
      triggers: []
    }
  });

  useEffect(() => {
    fetchFlows();
  }, []);

  const fetchFlows = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('conversation_flows')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setFlows(data || []);
    } catch (error) {
      console.error('Error fetching conversation flows:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation flows",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (flowId?: string) => {
    try {
      const flowData = {
        name: formData.name,
        description: formData.description,
        flow_data: formData.flow_data,
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      if (flowId) {
        const { error } = await supabase
          .from('conversation_flows')
          .update(flowData)
          .eq('id', flowId);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Conversation flow updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('conversation_flows')
          .insert([flowData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Conversation flow created successfully",
        });
      }

      setEditingFlow(null);
      setFormData({
        name: '',
        description: '',
        flow_data: {
          nodes: [],
          connections: [],
          triggers: []
        }
      });
      fetchFlows();
    } catch (error) {
      console.error('Error saving conversation flow:', error);
      toast({
        title: "Error",
        description: "Failed to save conversation flow",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (flow: ConversationFlow) => {
    setEditingFlow(flow.id);
    setFormData({
      name: flow.name,
      description: flow.description || '',
      flow_data: flow.flow_data || {
        nodes: [],
        connections: [],
        triggers: []
      }
    });
  };

  const handleDelete = async () => {
    if (!flowToDelete) return;

    try {
      const { error } = await supabase
        .from('conversation_flows')
        .delete()
        .eq('id', flowToDelete);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Conversation flow deleted successfully",
      });
      
      fetchFlows();
    } catch (error) {
      console.error('Error deleting conversation flow:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation flow",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setFlowToDelete(null);
    }
  };

  const toggleFlowStatus = async (flowId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('conversation_flows')
        .update({ is_active: !currentStatus })
        .eq('id', flowId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Flow ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
      
      fetchFlows();
    } catch (error) {
      console.error('Error toggling flow status:', error);
      toast({
        title: "Error",
        description: "Failed to update flow status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading conversation flows...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Conversation Flows ({flows.length})</span>
            <Button onClick={() => setEditingFlow('new')} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Flow
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Flow Form */}
      {editingFlow && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingFlow === 'new' ? 'Create New Conversation Flow' : 'Edit Conversation Flow'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Flow Name</label>
              <Input
                placeholder="e.g., Product Inquiry Flow"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Describe what this conversation flow is designed to handle..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
              />
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Flow Configuration</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Advanced flow configuration features will be available in the next update. 
                For now, you can create basic flows with name and description.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 bg-background rounded border-2 border-dashed">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-medium">Triggers</p>
                  <p className="text-muted-foreground">Coming Soon</p>
                </div>
                <div className="text-center p-3 bg-background rounded border-2 border-dashed">
                  <ArrowRight className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-medium">Flow Steps</p>
                  <p className="text-muted-foreground">Coming Soon</p>
                </div>
                <div className="text-center p-3 bg-background rounded border-2 border-dashed">
                  <Settings className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-medium">Conditions</p>
                  <p className="text-muted-foreground">Coming Soon</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingFlow(null);
                  setFormData({
                    name: '',
                    description: '',
                    flow_data: {
                      nodes: [],
                      connections: [],
                      triggers: []
                    }
                  });
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={() => handleSave(editingFlow === 'new' ? undefined : editingFlow)}>
                <Save className="h-4 w-4 mr-2" />
                Save Flow
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Flows List */}
      <div className="space-y-4">
        {flows.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No conversation flows found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first conversation flow to guide users through complex interactions
              </p>
              <Button onClick={() => setEditingFlow('new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Flow
              </Button>
            </CardContent>
          </Card>
        ) : (
          flows.map((flow) => (
            <Card key={flow.id} className={`${!flow.is_active ? 'opacity-60' : ''}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{flow.name}</h3>
                      <Badge variant={flow.is_active ? "secondary" : "destructive"}>
                        {flow.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {flow.description && (
                      <p className="text-sm text-muted-foreground">{flow.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFlowStatus(flow.id, flow.is_active)}
                    >
                      {flow.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(flow)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFlowToDelete(flow.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Created: {new Date(flow.created_at).toLocaleDateString()}
                  {flow.updated_at !== flow.created_at && (
                    <span> • Updated: {new Date(flow.updated_at).toLocaleDateString()}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the conversation flow.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ConversationFlowBuilder;
