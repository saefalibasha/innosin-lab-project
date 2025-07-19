
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, BarChart3, MessageSquare, Settings, Zap } from 'lucide-react';
import { 
  EnhancedKnowledgeManager, 
  EnhancedTrainingManager, 
  ConversationFlowBuilder, 
  AnalyticsDashboard 
} from './admin/enhanced';

const ChatbotTraining = () => {
  const [activeTab, setActiveTab] = useState('knowledge');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Chatbot Management Center</h1>
          <p className="text-muted-foreground">
            Comprehensive training, knowledge management, and analytics platform
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="knowledge" className="flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>Knowledge Base</span>
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Training Center</span>
          </TabsTrigger>
          <TabsTrigger value="flows" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Conversation Flows</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="knowledge" className="space-y-6">
          <EnhancedKnowledgeManager />
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <EnhancedTrainingManager />
        </TabsContent>

        <TabsContent value="flows" className="space-y-6">
          <ConversationFlowBuilder />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bot Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">AI Service Provider</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="openai">OpenAI GPT-4</option>
                  <option value="claude">Anthropic Claude</option>
                  <option value="custom">Custom Model</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Default Confidence Threshold</label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  defaultValue="0.8" 
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Low (0.0)</span>
                  <span>Medium (0.5)</span>
                  <span>High (1.0)</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Response Style</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="technical">Technical</option>
                  <option value="casual">Casual</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Maximum Response Length</label>
                <input 
                  type="number" 
                  min="50" 
                  max="500" 
                  defaultValue="200" 
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Fallback Behavior</label>
                <textarea 
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  defaultValue="I apologize, but I don't have enough information to answer that question accurately. Let me connect you with one of our specialists who can provide you with the detailed assistance you need."
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="enable-learning" defaultChecked />
                <label htmlFor="enable-learning" className="text-sm">
                  Enable continuous learning from conversations
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="enable-analytics" defaultChecked />
                <label htmlFor="enable-analytics" className="text-sm">
                  Enable detailed analytics and performance tracking
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatbotTraining;
