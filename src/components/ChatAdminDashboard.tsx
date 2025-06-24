
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Users, TrendingUp, Clock, Search, Filter, Download } from 'lucide-react';

interface ChatSession {
  id: string;
  userId?: string;
  email?: string;
  name?: string;
  company?: string;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'waiting' | 'closed' | 'transferred';
  messageCount: number;
  lastMessage: string;
  assignedAgent?: string;
  satisfaction?: number;
  tags: string[];
}

interface ChatAnalytics {
  totalSessions: number;
  activeSessions: number;
  avgResponseTime: number;
  satisfactionScore: number;
  commonQueries: { query: string; count: number }[];
  hourlyDistribution: { hour: number; count: number }[];
}

const ChatAdminDashboard = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [analytics, setAnalytics] = useState<ChatAnalytics | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);

  useEffect(() => {
    // Mock data - replace with actual API calls
    const mockSessions: ChatSession[] = [
      {
        id: 'session_1',
        email: 'john.doe@example.com',
        name: 'John Doe',
        company: 'Tech Corp',
        startTime: new Date(Date.now() - 1000 * 60 * 30),
        status: 'active',
        messageCount: 12,
        lastMessage: 'Can you provide more details about the fume cupboards?',
        assignedAgent: 'Sarah Wilson',
        tags: ['products', 'fume-cupboards']
      },
      {
        id: 'session_2',
        email: 'jane.smith@lab.com',
        name: 'Jane Smith',
        company: 'Research Lab Inc',
        startTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
        endTime: new Date(Date.now() - 1000 * 60 * 30),
        status: 'closed',
        messageCount: 8,
        lastMessage: 'Thank you for the quote!',
        satisfaction: 5,
        tags: ['quote', 'pricing']
      }
    ];

    const mockAnalytics: ChatAnalytics = {
      totalSessions: 147,
      activeSessions: 3,
      avgResponseTime: 45,
      satisfactionScore: 4.2,
      commonQueries: [
        { query: 'Product information', count: 45 },
        { query: 'Pricing inquiry', count: 32 },
        { query: 'Technical support', count: 28 },
        { query: 'Installation', count: 19 }
      ],
      hourlyDistribution: Array.from({length: 24}, (_, i) => ({
        hour: i,
        count: Math.floor(Math.random() * 10) + 1
      }))
    };

    setSessions(mockSessions);
    setAnalytics(mockAnalytics);
  }, []);

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = !searchTerm || 
      session.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'waiting': return 'bg-yellow-500';
      case 'transferred': return 'bg-blue-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const handleTakeOver = (sessionId: string) => {
    setSessions(sessions.map(session => 
      session.id === sessionId 
        ? { ...session, assignedAgent: 'You', status: 'active' as const }
        : session
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Chat Admin Dashboard</h1>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-2xl font-bold">{analytics.totalSessions}</p>
                </div>
                <MessageCircle className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Now</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.activeSessions}</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Response</p>
                  <p className="text-2xl font-bold">{analytics.avgResponseTime}s</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Satisfaction</p>
                  <p className="text-2xl font-bold">{analytics.satisfactionScore}/5</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="sessions" className="w-full">
        <TabsList>
          <TabsTrigger value="sessions">Live Sessions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="hubspot">HubSpot Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          {/* Filters */}
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="waiting">Waiting</option>
              <option value="transferred">Transferred</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Sessions List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredSessions.map((session) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{session.name || 'Anonymous'}</CardTitle>
                      <p className="text-sm text-muted-foreground">{session.email}</p>
                      {session.company && (
                        <p className="text-sm text-muted-foreground">{session.company}</p>
                      )}
                    </div>
                    <Badge className={`${getStatusColor(session.status)} text-white`}>
                      {session.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <strong>Last message:</strong> {session.lastMessage}
                  </div>
                  
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Messages: {session.messageCount}</span>
                    <span>Started: {session.startTime.toLocaleTimeString()}</span>
                  </div>
                  
                  {session.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {session.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => setSelectedSession(session)}
                      variant="outline"
                    >
                      View Chat
                    </Button>
                    {session.status === 'waiting' && (
                      <Button 
                        size="sm"
                        onClick={() => handleTakeOver(session.id)}
                      >
                        Take Over
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Common Queries</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.commonQueries.map((query, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <span>{query.query}</span>
                    <Badge variant="secondary">{query.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Chat Volume by Hour</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics?.hourlyDistribution
                    .filter(item => item.count > 0)
                    .slice(0, 10)
                    .map((item) => (
                    <div key={item.hour} className="flex justify-between items-center">
                      <span>{item.hour}:00</span>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="bg-sea h-2 rounded"
                          style={{width: `${(item.count / 10) * 100}px`}}
                        />
                        <span className="text-sm">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hubspot">
          <Card>
            <CardHeader>
              <CardTitle>HubSpot Integration Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">HubSpot API Key</label>
                <Input type="password" placeholder="Enter your HubSpot API key" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Default Pipeline</label>
                <select className="w-full p-2 border rounded-md">
                  <option>Sales Pipeline</option>
                  <option>Support Pipeline</option>
                  <option>Marketing Pipeline</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="auto-create-contacts" />
                <label htmlFor="auto-create-contacts" className="text-sm">
                  Automatically create contacts from chat sessions
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="sync-conversations" />
                <label htmlFor="sync-conversations" className="text-sm">
                  Sync conversation history to HubSpot timeline
                </label>
              </div>
              <Button>Save Integration Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatAdminDashboard;
