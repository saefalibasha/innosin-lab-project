
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  MessageSquare, 
  Users, 
  Clock, 
  Target,
  Activity,
  CheckCircle,
  AlertTriangle,
  Brain
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const AnalyticsDashboard = () => {
  // Mock data - in real implementation, this would come from your analytics service
  const performanceData = [
    { name: 'Mon', accuracy: 85, response_time: 250 },
    { name: 'Tue', accuracy: 88, response_time: 220 },
    { name: 'Wed', accuracy: 92, response_time: 180 },
    { name: 'Thu', accuracy: 89, response_time: 200 },
    { name: 'Fri', accuracy: 94, response_time: 160 },
    { name: 'Sat', accuracy: 91, response_time: 170 },
    { name: 'Sun', accuracy: 93, response_time: 165 }
  ];

  const intentData = [
    { name: 'Product Inquiry', value: 35, count: 145 },
    { name: 'Support Request', value: 28, count: 118 },
    { name: 'Pricing Question', value: 18, count: 76 },
    { name: 'Technical Issue', value: 12, count: 52 },
    { name: 'General Info', value: 7, count: 29 }
  ];

  const knowledgeGaps = [
    { query: 'Installation requirements for tall cabinets', frequency: 23, confidence: 0.4 },
    { query: 'Maintenance schedule recommendations', frequency: 18, confidence: 0.5 },
    { query: 'Compatibility with existing systems', frequency: 15, confidence: 0.3 },
    { query: 'Warranty coverage details', frequency: 12, confidence: 0.6 },
    { query: 'Custom modification options', frequency: 9, confidence: 0.2 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Chatbot Accuracy</p>
                <p className="text-2xl font-bold">91.2%</p>
                <p className="text-xs text-green-600">+2.3% from last week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">185ms</p>
                <p className="text-xs text-green-600">-15ms improvement</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Conversations</p>
                <p className="text-2xl font-bold">1,847</p>
                <p className="text-xs text-blue-600">+156 this week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Resolution Rate</p>
                <p className="text-2xl font-bold">87.4%</p>
                <p className="text-xs text-green-600">+1.8% improvement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="intents">Intent Analysis</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Gaps</TabsTrigger>
          <TabsTrigger value="training">Training Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Accuracy & Response Time Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line yAxisId="left" type="monotone" dataKey="accuracy" stroke="#8884d8" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="response_time" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Accuracy Rate</span>
                    <span className="text-sm text-muted-foreground">91.2%</span>
                  </div>
                  <Progress value={91.2} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">User Satisfaction</span>
                    <span className="text-sm text-muted-foreground">4.6/5.0</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Knowledge Coverage</span>
                    <span className="text-sm text-muted-foreground">78.5%</span>
                  </div>
                  <Progress value={78.5} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Escalation Rate</span>
                    <span className="text-sm text-muted-foreground">12.6%</span>
                  </div>
                  <Progress value={12.6} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="intents" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Intent Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={intentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {intentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Intents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {intentData.map((intent, index) => (
                    <div key={intent.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{intent.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{intent.count} queries</Badge>
                        <span className="text-sm text-muted-foreground">{intent.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <span>Knowledge Gaps Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {knowledgeGaps.map((gap, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{gap.query}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="destructive">High Priority</Badge>
                        <span className="text-sm text-muted-foreground">
                          {gap.frequency} queries
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Confidence Level</span>
                        <span>{(gap.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={gap.confidence * 100} className="h-2" />
                    </div>
                    
                    <div className="flex justify-end mt-3 space-x-2">
                      <Badge variant="outline" className="text-xs">
                        Create Knowledge Entry
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Add Training Data
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Training Session Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium">Product Knowledge v2.1</p>
                        <p className="text-sm text-muted-foreground">Active since 3 days ago</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">94.2%</p>
                      <p className="text-xs text-muted-foreground">Accuracy</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Activity className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Support Flows v1.8</p>
                        <p className="text-sm text-muted-foreground">Active since 1 week ago</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">87.6%</p>
                      <p className="text-xs text-muted-foreground">Accuracy</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="font-medium">Technical Specs v1.2</p>
                        <p className="text-sm text-muted-foreground">Needs improvement</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-yellow-600">73.4%</p>
                      <p className="text-xs text-muted-foreground">Accuracy</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Training Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-start space-x-3">
                      <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Add More Product Examples</p>
                        <p className="text-sm text-muted-foreground">
                          The bot struggles with specific product model questions. Add 15-20 more training examples.
                        </p>
                        <Badge variant="outline" className="mt-2 text-xs">High Impact</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Brain className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Improve Technical Response Flow</p>
                        <p className="text-sm text-muted-foreground">
                          Create conversation flows for multi-step technical troubleshooting.
                        </p>
                        <Badge variant="outline" className="mt-2 text-xs">Medium Impact</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Target className="w-5 h-5 text-purple-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Update Pricing Information</p>
                        <p className="text-sm text-muted-foreground">
                          Recent pricing changes aren't reflected in training data.
                        </p>
                        <Badge variant="outline" className="mt-2 text-xs">Quick Fix</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
