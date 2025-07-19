
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Play, 
  Save, 
  Upload, 
  Download, 
  Settings, 
  BarChart3, 
  Brain, 
  MessageSquare,
  Zap,
  Target,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TrainingSession {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'archived';
  version: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  performance_metrics: any;
}

interface TrainingEntry {
  id: string;
  session_id: string;
  intent: string;
  example_inputs: string[];
  response_template: string;
  category?: string;
  priority: number;
  is_active: boolean;
  performance_score: number;
  usage_count: number;
  confidence_threshold: number;
  created_at: string;
}

interface ConversationFlow {
  id: string;
  name: string;
  description?: string;
  flow_data: any;
  is_active: boolean;
  created_at: string;
}

const EnhancedTrainingManager = () => {
  const [activeTab, setActiveTab] = useState('sessions');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const [isCreateEntryOpen, setIsCreateEntryOpen] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  
  const queryClient = useQueryClient();

  // Fetch training sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['training-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data as TrainingSession[];
    }
  });

  // Fetch training entries for selected session
  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ['training-entries', selectedSession],
    queryFn: async () => {
      if (!selectedSession) return [];
      const { data, error } = await supabase
        .from('training_data_entries')
        .select('*')
        .eq('session_id', selectedSession)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as TrainingEntry[];
    },
    enabled: !!selectedSession
  });

  // Fetch conversation flows
  const { data: flows = [] } = useQuery({
    queryKey: ['conversation-flows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversation_flows')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ConversationFlow[];
    }
  });

  // Create training session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: { name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('training_sessions')
        .insert([sessionData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['training-sessions'] });
      setSelectedSession(data.id);
      setIsCreateSessionOpen(false);
      toast.success('Training session created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create session: ' + error.message);
    }
  });

  // Create training entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (entryData: {
      session_id: string;
      intent: string;
      example_inputs: string[];
      response_template: string;
      category?: string;
    }) => {
      const { data, error } = await supabase
        .from('training_data_entries')
        .insert([entryData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-entries'] });
      setIsCreateEntryOpen(false);
      toast.success('Training entry created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create entry: ' + error.message);
    }
  });

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    
    createSessionMutation.mutate({ name, description });
  };

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return;
    
    const formData = new FormData(e.target as HTMLFormElement);
    const intent = formData.get('intent') as string;
    const example_inputs = (formData.get('example_inputs') as string).split('\n').filter(s => s.trim());
    const response_template = formData.get('response_template') as string;
    const category = formData.get('category') as string;
    
    createEntryMutation.mutate({
      session_id: selectedSession,
      intent,
      example_inputs,
      response_template,
      category: category || undefined
    });
  };

  const handleTestBot = async () => {
    if (!testInput.trim()) return;
    
    try {
      // Mock testing functionality - in real implementation, this would call your AI service
      setTestResult({
        input: testInput,
        intent: 'product_inquiry',
        confidence: 0.85,
        response: 'Based on your question about mobile cabinets, I can help you find the right solution...',
        processing_time: 245
      });
      toast.success('Test completed');
    } catch (error) {
      toast.error('Test failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Training Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold">
                  {sessions.filter(s => s.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Training Entries</p>
                <p className="text-2xl font-bold">{entries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Performance</p>
                <p className="text-2xl font-bold">
                  {entries.length > 0 
                    ? ((entries.reduce((sum, e) => sum + e.performance_score, 0) / entries.length) * 100).toFixed(1)
                    : 0
                  }%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Conversation Flows</p>
                <p className="text-2xl font-bold">{flows.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sessions">Training Sessions</TabsTrigger>
          <TabsTrigger value="entries">Training Data</TabsTrigger>
          <TabsTrigger value="flows">Conversation Flows</TabsTrigger>
          <TabsTrigger value="testing">Live Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Training Sessions</span>
                <Dialog open={isCreateSessionOpen} onOpenChange={setIsCreateSessionOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      New Session
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Training Session</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSession} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Session Name</label>
                        <Input name="name" placeholder="e.g., Product Knowledge v1.0" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <Textarea name="description" placeholder="Describe the purpose of this training session..." />
                      </div>
                      <Button type="submit" className="w-full" disabled={createSessionMutation.isPending}>
                        {createSessionMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        Create Session
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessions.map((session) => (
                  <Card 
                    key={session.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedSession === session.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedSession(session.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{session.name}</h3>
                          <Badge variant={
                            session.status === 'active' ? 'default' : 
                            session.status === 'draft' ? 'secondary' : 'destructive'
                          }>
                            {session.status}
                          </Badge>
                        </div>
                        
                        {session.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {session.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>v{session.version}</span>
                          <span>{new Date(session.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entries" className="space-y-4">
          {selectedSession ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Training Entries</span>
                  <Dialog open={isCreateEntryOpen} onOpenChange={setIsCreateEntryOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Entry
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create Training Entry</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateEntry} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Intent</label>
                          <Input name="intent" placeholder="e.g., product_inquiry" required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Example Inputs (one per line)</label>
                          <Textarea 
                            name="example_inputs" 
                            placeholder="What mobile cabinets do you have?&#10;Show me your cabinet options&#10;I need storage solutions"
                            rows={4}
                            required 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Response Template</label>
                          <Textarea 
                            name="response_template" 
                            placeholder="I can help you find the perfect mobile cabinet solution..."
                            rows={3}
                            required 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Category (optional)</label>
                          <Input name="category" placeholder="e.g., products, support" />
                        </div>
                        <Button type="submit" className="w-full" disabled={createEntryMutation.isPending}>
                          {createEntryMutation.isPending ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4 mr-2" />
                          )}
                          Create Entry
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {entries.map((entry) => (
                    <Card key={entry.id}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{entry.intent}</Badge>
                              {entry.category && (
                                <Badge variant="secondary">{entry.category}</Badge>
                              )}
                              <Badge variant={entry.is_active ? "default" : "destructive"}>
                                {entry.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <span>Score: {(entry.performance_score * 100).toFixed(1)}%</span>
                              <span>Used: {entry.usage_count}</span>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium mb-1">Example Inputs:</p>
                            <div className="flex flex-wrap gap-2">
                              {entry.example_inputs.slice(0, 3).map((input, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {input.length > 30 ? input.substring(0, 30) + '...' : input}
                                </Badge>
                              ))}
                              {entry.example_inputs.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{entry.example_inputs.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium mb-1">Response:</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {entry.response_template}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Select a training session to view entries</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="flows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Conversation Flows</span>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Flow
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {flows.map((flow) => (
                  <Card key={flow.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{flow.name}</h3>
                          <Badge variant={flow.is_active ? "default" : "secondary"}>
                            {flow.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        
                        {flow.description && (
                          <p className="text-sm text-muted-foreground">
                            {flow.description}
                          </p>
                        )}
                        
                        <div className="text-xs text-muted-foreground">
                          Created: {new Date(flow.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Bot Testing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="Type a message to test the chatbot..."
                    onKeyPress={(e) => e.key === 'Enter' && handleTestBot()}
                  />
                </div>
                <Button onClick={handleTestBot} disabled={!testInput.trim()}>
                  <Play className="w-4 h-4 mr-2" />
                  Test
                </Button>
              </div>

              {testResult && (
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <p className="text-sm font-medium">Input:</p>
                      <p className="text-sm text-muted-foreground">{testResult.input}</p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-sm font-medium">Intent:</p>
                        <Badge variant="outline">{testResult.intent}</Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Confidence:</p>
                        <Badge variant={testResult.confidence > 0.8 ? "default" : "secondary"}>
                          {(testResult.confidence * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Processing Time:</p>
                        <span className="text-sm text-muted-foreground">{testResult.processing_time}ms</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Response:</p>
                      <p className="text-sm text-muted-foreground">{testResult.response}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedTrainingManager;
