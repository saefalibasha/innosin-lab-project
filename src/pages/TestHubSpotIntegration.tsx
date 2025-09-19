import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, TestTube, AlertTriangle, CheckCircle } from 'lucide-react';
import HubSpotIntegrationTest from '@/components/HubSpotIntegrationTest';

const TestHubSpotIntegration = () => {
  const testScenarios = [
    {
      title: "Contact Form Integration",
      path: "/contact",
      description: "Test contact form submission and HubSpot contact creation",
      hubspotObjects: ["Contact", "Ticket"],
      status: "ready"
    },
    {
      title: "RFQ Cart Integration", 
      path: "/rfq-cart",
      description: "Test RFQ submission with product data and deal creation",
      hubspotObjects: ["Contact", "Deal"],
      status: "ready"
    },
    {
      title: "AI Chat Integration",
      path: "/home",
      description: "Test AI chat conversation syncing and contact creation",
      hubspotObjects: ["Contact", "Note"],
      status: "ready"
    },
    {
      title: "Contact Gate Modal",
      path: "/floor-planner",
      description: "Test contact gate modal for tool access",
      hubspotObjects: ["Contact", "Ticket (optional)"],
      status: "ready"
    }
  ];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <TestTube className="h-8 w-8 text-primary" />
          HubSpot Integration Testing Suite
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive testing for all HubSpot integration points including contact forms, 
          RFQ submissions, AI chat conversations, and contact gate modals.
        </p>
      </div>

      {/* API Integration Tests */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">API Integration Tests</h2>
        <p className="text-muted-foreground">
          Run automated tests to verify HubSpot API connectivity and data creation.
        </p>
        <HubSpotIntegrationTest />
      </div>

      {/* User Flow Tests */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">User Flow Testing</h2>
        <p className="text-muted-foreground">
          Test real user scenarios to ensure end-to-end integration works correctly.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          {testScenarios.map((scenario, index) => (
            <Card key={index} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{scenario.title}</CardTitle>
                  <Badge variant={scenario.status === 'ready' ? 'default' : 'secondary'}>
                    {scenario.status === 'ready' ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 mr-1" />
                    )}
                    {scenario.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {scenario.description}
                </p>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">HubSpot Objects Created:</h4>
                  <div className="flex flex-wrap gap-1">
                    {scenario.hubspotObjects.map((obj, objIndex) => (
                      <Badge key={objIndex} variant="outline" className="text-xs">
                        {obj}
                      </Badge>
                    ))}
                  </div>
                </div>

                <a
                  href={scenario.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  Test This Flow
                  <ExternalLink className="h-3 w-3" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Testing Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. API Tests (Above)</h4>
            <p className="text-sm text-muted-foreground">
              Run the automated integration tests to verify HubSpot API connectivity.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">2. User Flow Tests</h4>
            <p className="text-sm text-muted-foreground">
              Click "Test This Flow" for each scenario and complete the user journey. 
              Use test data like "test+{Date.now()}@example.com" for emails.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">3. Monitor Results</h4>
            <p className="text-sm text-muted-foreground">
              Check the <a href="/admin/hubspot-monitor" className="text-primary hover:underline">HubSpot Monitor</a> dashboard 
              to see integration logs and verify data was created in HubSpot.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">4. HubSpot Verification</h4>
            <p className="text-sm text-muted-foreground">
              Log into your HubSpot account to verify contacts, deals, tickets, and notes 
              were created correctly with the test data.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestHubSpotIntegration;