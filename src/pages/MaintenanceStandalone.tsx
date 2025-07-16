
import React from 'react';
import Maintenance from './Maintenance';
import HubSpotIntegrationTest from '@/components/HubSpotIntegrationTest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { isLovableDevelopment } from '@/utils/environmentDetection';

const MaintenanceStandalone = () => {
  const isDevelopment = isLovableDevelopment();

  if (!isDevelopment) {
    return <Maintenance />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="maintenance" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="maintenance">Maintenance Page</TabsTrigger>
            <TabsTrigger value="testing">HubSpot Testing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="maintenance">
            <Maintenance />
          </TabsContent>
          
          <TabsContent value="testing">
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">HubSpot Integration Testing</h1>
                <p className="text-muted-foreground">
                  Use this tool to test all HubSpot integrations in the development environment.
                </p>
              </div>
              <HubSpotIntegrationTest />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MaintenanceStandalone;
