
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Save, 
  Play, 
  MessageSquare, 
  ArrowRight, 
  Settings,
  Trash2,
  Copy,
  Download,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';

interface FlowNode {
  id: string;
  type: 'trigger' | 'response' | 'condition' | 'action';
  title: string;
  content: string;
  position: { x: number; y: number };
  connections: string[];
  conditions?: { field: string; operator: string; value: string }[];
  actions?: { type: string; parameters: any }[];
}

interface ConversationFlow {
  id: string;
  name: string;
  description?: string;
  nodes: FlowNode[];
  isActive: boolean;
}

const ConversationFlowBuilder = () => {
  const [flows, setFlows] = useState<ConversationFlow[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<ConversationFlow | null>(null);
  const [isCreateFlowOpen, setIsCreateFlowOpen] = useState(false);
  const [draggedNode, setDraggedNode] = useState<FlowNode | null>(null);

  const nodeTypes = [
    { type: 'trigger', label: 'Trigger', icon: Play, color: 'bg-green-500' },
    { type: 'response', label: 'Response', icon: MessageSquare, color: 'bg-blue-500' },
    { type: 'condition', label: 'Condition', icon: Settings, color: 'bg-yellow-500' },
    { type: 'action', label: 'Action', icon: ArrowRight, color: 'bg-purple-500' }
  ];

  const createNewFlow = (name: string, description?: string) => {
    const newFlow: ConversationFlow = {
      id: Date.now().toString(),
      name,
      description,
      nodes: [],
      isActive: true
    };
    
    setFlows(prev => [...prev, newFlow]);
    setSelectedFlow(newFlow);
    setIsCreateFlowOpen(false);
    toast.success('Conversation flow created');
  };

  const addNode = (type: FlowNode['type']) => {
    if (!selectedFlow) return;

    const newNode: FlowNode = {
      id: Date.now().toString(),
      type,
      title: `New ${type}`,
      content: '',
      position: { x: Math.random() * 400, y: Math.random() * 300 },
      connections: []
    };

    const updatedFlow = {
      ...selectedFlow,
      nodes: [...selectedFlow.nodes, newNode]
    };

    setSelectedFlow(updatedFlow);
    setFlows(prev => prev.map(f => f.id === selectedFlow.id ? updatedFlow : f));
  };

  const updateNode = (nodeId: string, updates: Partial<FlowNode>) => {
    if (!selectedFlow) return;

    const updatedFlow = {
      ...selectedFlow,
      nodes: selectedFlow.nodes.map(node => 
        node.id === nodeId ? { ...node, ...updates } : node
      )
    };

    setSelectedFlow(updatedFlow);
    setFlows(prev => prev.map(f => f.id === selectedFlow.id ? updatedFlow : f));
  };

  const deleteNode = (nodeId: string) => {
    if (!selectedFlow) return;

    const updatedFlow = {
      ...selectedFlow,
      nodes: selectedFlow.nodes.filter(node => node.id !== nodeId)
    };

    setSelectedFlow(updatedFlow);
    setFlows(prev => prev.map(f => f.id === selectedFlow.id ? updatedFlow : f));
  };

  const connectNodes = (fromId: string, toId: string) => {
    if (!selectedFlow) return;

    const updatedFlow = {
      ...selectedFlow,
      nodes: selectedFlow.nodes.map(node => 
        node.id === fromId 
          ? { ...node, connections: [...node.connections, toId] }
          : node
      )
    };

    setSelectedFlow(updatedFlow);
    setFlows(prev => prev.map(f => f.id === selectedFlow.id ? updatedFlow : f));
  };

  const saveFlow = async () => {
    if (!selectedFlow) return;

    try {
      // In a real implementation, this would save to the database
      toast.success('Conversation flow saved');
    } catch (error) {
      toast.error('Failed to save flow');
    }
  };

  const testFlow = async () => {
    if (!selectedFlow) return;

    try {
      // In a real implementation, this would test the flow
      toast.success('Flow test completed');
    } catch (error) {
      toast.error('Flow test failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Flow Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Conversation Flow Builder</span>
            <div className="flex space-x-2">
              <Dialog open={isCreateFlowOpen} onOpenChange={setIsCreateFlowOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Flow
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Conversation Flow</DialogTitle>
                  </DialogHeader>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target as HTMLFormElement);
                      const name = formData.get('name') as string;
                      const description = formData.get('description') as string;
                      createNewFlow(name, description);
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-2">Flow Name</label>
                      <Input name="name" placeholder="e.g., Product Inquiry Flow" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <Textarea name="description" placeholder="Describe the conversation flow..." />
                    </div>
                    <Button type="submit" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Flow
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              
              {selectedFlow && (
                <>
                  <Button variant="outline" onClick={saveFlow}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={testFlow}>
                    <Play className="w-4 h-4 mr-2" />
                    Test
                  </Button>
                </>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Flow Selection */}
          <div className="flex space-x-4 mb-6">
            {flows.map((flow) => (
              <Card 
                key={flow.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedFlow?.id === flow.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedFlow(flow)}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{flow.name}</h3>
                      <Badge variant={flow.isActive ? "default" : "secondary"}>
                        {flow.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {flow.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {flow.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {flow.nodes.length} nodes
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedFlow ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Node Palette */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Components</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {nodeTypes.map((nodeType) => {
                  const Icon = nodeType.icon;
                  return (
                    <Button
                      key={nodeType.type}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => addNode(nodeType.type as FlowNode['type'])}
                    >
                      <div className={`w-3 h-3 rounded-full ${nodeType.color} mr-2`} />
                      <Icon className="w-4 h-4 mr-2" />
                      {nodeType.label}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Flow Canvas */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedFlow.name}</span>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="relative w-full h-96 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
                style={{ minHeight: '500px' }}
              >
                {selectedFlow.nodes.map((node) => {
                  const nodeType = nodeTypes.find(nt => nt.type === node.type);
                  const Icon = nodeType?.icon || MessageSquare;
                  
                  return (
                    <div
                      key={node.id}
                      className="absolute bg-white border rounded-lg shadow-sm p-3 cursor-move"
                      style={{
                        left: node.position.x,
                        top: node.position.y,
                        minWidth: '150px'
                      }}
                      draggable
                      onDragStart={() => setDraggedNode(node)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${nodeType?.color}`} />
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{node.title}</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => deleteNode(node.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      {node.content && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {node.content}
                        </p>
                      )}
                      
                      <div className="flex justify-between mt-2">
                        <div className="w-2 h-2 bg-gray-300 rounded-full cursor-pointer hover:bg-blue-500" />
                        <div className="w-2 h-2 bg-gray-300 rounded-full cursor-pointer hover:bg-blue-500" />
                      </div>
                    </div>
                  );
                })}
                
                {selectedFlow.nodes.length === 0 && (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                      <p>Add components from the palette to build your conversation flow</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Create or select a conversation flow to start building</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConversationFlowBuilder;
