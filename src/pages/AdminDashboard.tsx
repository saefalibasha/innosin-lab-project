
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Users, MessageSquare, BarChart3, FileText, Settings, TrendingUp, Activity, ExternalLink } from 'lucide-react';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import { EnhancedAssetManager } from '@/components/admin/enhanced-asset-manager/EnhancedAssetManager';
import AdminRoleManager from '@/components/AdminRoleManager';
import PDFUploadManager from '@/components/PDFUploadManager';
import KnowledgeBaseManager from '@/components/KnowledgeBaseManager';
import ChatbotTraining from '@/components/ChatbotTraining';
import { useEnhancedDashboardStats } from '@/hooks/useEnhancedDashboardStats';
import { SystemHealthCard } from '@/components/admin/SystemHealthCard';
import { ChatLogsViewer } from '@/components/admin/ChatLogsViewer';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const stats = useEnhancedDashboardStats(refreshTrigger);

  const handleDataChange = useCallback(() => {
    // Force refresh of dashboard stats
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your laboratory equipment catalog and system settings</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">Products & Assets</TabsTrigger>
              <TabsTrigger value="chat">Chat & Inquiries</TabsTrigger>
              <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
              <TabsTrigger value="training">Training</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="space-y-6">
                {/* Enhanced Statistics Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.isLoading ? (
                          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                        ) : (
                          stats.totalProducts
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Active laboratory equipment</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.isLoading ? (
                          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                        ) : (
                          stats.activeChatSessions
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Currently active sessions</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Sessions Today</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.isLoading ? (
                          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                        ) : (
                          stats.chatSessionsToday
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">New conversations today</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">HubSpot Synced</CardTitle>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.isLoading ? (
                          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                        ) : (
                          stats.hubspotSyncedSessions
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Sessions synced to HubSpot</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Secondary Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Sessions This Month</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.isLoading ? (
                          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                        ) : (
                          stats.chatSessionsThisMonth
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Total monthly conversations</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.isLoading ? (
                          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                        ) : (
                          stats.totalChatMessages
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">All chat messages</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Avg. Satisfaction</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.isLoading ? (
                          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                        ) : (
                          stats.chatMetrics.averageSatisfaction > 0 
                            ? `${stats.chatMetrics.averageSatisfaction}⭐` 
                            : 'N/A'
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Customer satisfaction rating</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Knowledge Base</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.isLoading ? (
                          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                        ) : (
                          stats.knowledgeBaseEntries
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Active entries</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Management Cards Row - Now with 2 columns instead of 3 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SystemHealthCard />
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => setActiveTab('products')}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Manage Products
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => setActiveTab('knowledge')}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Add Knowledge
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => setActiveTab('chat')}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        View Chat Logs
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Metrics Card - Now full width */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Performance Metrics</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex justify-between text-sm">
                        <span>Response Time</span>
                        <span className="text-green-600">{stats.chatMetrics.responseTime}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Session Completion</span>
                        <span className="text-green-600">
                          {stats.chatMetrics.totalSessions > 0 
                            ? `${Math.round((stats.chatMetrics.completedSessions / stats.chatMetrics.totalSessions) * 100)}%`
                            : '0%'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>HubSpot Sync Rate</span>
                        <span className="text-green-600">
                          {stats.chatSessionsThisMonth > 0
                            ? `${Math.round((stats.hubspotSyncedSessions / stats.chatSessionsThisMonth) * 100)}%`
                            : '0%'
                          }
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="products">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Products & Asset Management</h2>
                    <p className="text-gray-600">Manage your product catalog, 3D models, and images</p>
                  </div>
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <EnhancedAssetManager />
              </div>
            </TabsContent>

            <TabsContent value="chat">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Chat Sessions & Inquiries</h2>
                    <p className="text-gray-600">View and manage all website inquiries, chat sessions, and customer interactions</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                
                {/* Chat Metrics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{stats.chatSessionsThisMonth}</div>
                      <p className="text-sm text-muted-foreground">Total Sessions</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{stats.activeChatSessions}</div>
                      <p className="text-sm text-muted-foreground">Active Now</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{stats.hubspotSyncedSessions}</div>
                      <p className="text-sm text-muted-foreground">HubSpot Synced</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">
                        {stats.chatMetrics.averageSatisfaction > 0 
                          ? `${stats.chatMetrics.averageSatisfaction}⭐` 
                          : 'N/A'
                        }
                      </div>
                      <p className="text-sm text-muted-foreground">Avg. Rating</p>
                    </CardContent>
                  </Card>
                </div>

                <ChatLogsViewer onDataChange={handleDataChange} />
              </div>
            </TabsContent>

            <TabsContent value="knowledge">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Knowledge Base</h2>
                  <FileText className="h-5 w-5" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>PDF Document Upload</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PDFUploadManager />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Knowledge Base Manager</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <KnowledgeBaseManager />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="training">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Chatbot Training</h2>
                  <Settings className="h-5 w-5" />
                </div>
                <ChatbotTraining />
              </div>
            </TabsContent>

            <TabsContent value="users">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">User Management</h2>
                  <Users className="h-5 w-5" />
                </div>
                <AdminRoleManager />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
