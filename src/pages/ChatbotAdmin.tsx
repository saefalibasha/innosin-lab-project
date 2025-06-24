
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChatbotTraining from '@/components/ChatbotTraining';
import ChatAdminDashboard from '@/components/ChatAdminDashboard';

const ChatbotAdmin = () => {
  return (
    <div className="container mx-auto py-12 pt-20">
      <Tabs defaultValue="training" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="training">Bot Training</TabsTrigger>
          <TabsTrigger value="dashboard">Admin Dashboard</TabsTrigger>
        </TabsList>
        
        <TabsContent value="training">
          <ChatbotTraining />
        </TabsContent>
        
        <TabsContent value="dashboard">
          <ChatAdminDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatbotAdmin;
