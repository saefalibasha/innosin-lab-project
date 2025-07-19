
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Brain, 
  Play, 
  Pause, 
  RotateCcw, 
  TrendingUp, 
  Database, 
  Cpu, 
  Activity,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface TrainingSession {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  version: number;
  created_by: string | null;
  description: string | null;
  performance_metrics: any;
  completed_at: string | null;
}

const AITrainingCenter = () => {
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTrainingSessions();
  }, []);

  const loadTrainingSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('training_sessions')
        .select('id, name, status, created_at, updated_at, version, created_by, description, performance_metrics, completed_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTrainingSessions(data || []);
    } catch (error) {
      console.error('Error loading training sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load training sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startTraining = async () => {
    try {
      const { error } = await supabase
        .from('training_sessions')
        .insert({
          name: `Training Session ${new Date().toISOString()}`,
          status: 'pending'
        });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Training session started successfully",
      });
      
      loadTrainingSessions();
    } catch (error) {
      console.error('Error starting training:', error);
      toast({
        title: "Error",
        description: "Failed to start training session",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Brain className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      running: 'secondary',
      failed: 'destructive',
      pending: 'outline'
    } as const;

    const variant = variants[status as keyof typeof variants] || 'outline';

    return (
      <Badge variant={variant}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Training Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Active Models</span>
                </div>
                <div className="text-2xl font-bold text-purple-900">3</div>
                <div className="text-xs text-purple-700">Currently running</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-200 flex items-center justify-center">
                <Cpu className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Database className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Training Data</span>
                </div>
                <div className="text-2xl font-bold text-green-900">1.2K</div>
                <div className="text-xs text-green-700">Samples ready</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-200 flex items-center justify-center">
                <Database className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Accuracy</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">94.7%</div>
                <div className="text-xs text-blue-700">Current model</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Training Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button onClick={startTraining} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Start New Training
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Pause className="h-4 w-4" />
              Pause Training
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset Model
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Training Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Training Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trainingSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No training sessions found. Start your first training session above.
              </div>
            ) : (
              trainingSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(session.status)}
                    <div>
                      <div className="font-medium">{session.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Started: {new Date(session.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(session.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AITrainingCenter;
