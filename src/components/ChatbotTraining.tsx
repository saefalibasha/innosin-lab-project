
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, BarChart3, MessageSquare, Zap, FileText, Database } from 'lucide-react';
import { 
  EnhancedKnowledgeManager, 
  EnhancedTrainingManager, 
  ConversationFlowBuilder, 
  AnalyticsDashboard 
} from './admin/enhanced';
import PDFUploadManager from './PDFUploadManager';

const ChatbotTraining = () => {
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="upload" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Document Upload</span>
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>Knowledge Base</span>
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Training Data</span>
          </TabsTrigger>
          <TabsTrigger value="flows" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Conversation Flows</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Document Upload & Processing</h3>
            </div>
            <p className="text-blue-700 text-sm mt-1">
              Upload PDF documents to automatically generate knowledge base entries and training data for your AI chatbot.
            </p>
          </div>
          <Card>
            <CardContent className="p-6">
              <PDFUploadManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Knowledge Base Management</h3>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Manage AI knowledge entries generated from uploaded documents. This is the primary source of information for your chatbot responses.
            </p>
          </div>
          <EnhancedKnowledgeManager />
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Training Data Management</h3>
            </div>
            <p className="text-purple-700 text-sm mt-1">
              Create and manage specific training examples to improve your chatbot's responses to particular intents and scenarios.
            </p>
          </div>
          <EnhancedTrainingManager />
        </TabsContent>

        <TabsContent value="flows" className="space-y-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold text-orange-900">Conversation Flow Builder</h3>
            </div>
            <p className="text-orange-700 text-sm mt-1">
              Design multi-turn conversation flows to guide users through complex interactions and workflows.
            </p>
          </div>
          <ConversationFlowBuilder />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-900">Performance Analytics</h3>
            </div>
            <p className="text-red-700 text-sm mt-1">
              Monitor your chatbot's performance, knowledge base effectiveness, and user interaction patterns.
            </p>
          </div>
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatbotTraining;
