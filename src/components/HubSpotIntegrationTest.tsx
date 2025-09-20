
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHubSpotIntegration } from '@/hooks/useHubSpotIntegration';
import { toast } from 'sonner';
import { TestTube, CheckCircle, XCircle, Loader, Settings } from 'lucide-react';

const HubSpotIntegrationTest = () => {
  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'success' | 'error'>>({});
  const [testData, setTestData] = useState<any>({});
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('');
  const { createContact, createDeal, createTicket, syncConversation, getTicketPipelines, loading } = useHubSpotIntegration();

  useEffect(() => {
    loadPipelines();
  }, []);

  const loadPipelines = async () => {
    try {
      const pipelineData = await getTicketPipelines();
      setPipelines(pipelineData);
      if (pipelineData.length > 0) {
        setSelectedPipeline(pipelineData[0].id);
        if (pipelineData[0].stages?.length > 0) {
          setSelectedStage(pipelineData[0].stages[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load pipelines:', error);
    }
  };

  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    setTestResults(prev => ({ ...prev, [testName]: 'pending' }));
    
    try {
      const result = await testFunction();
      setTestResults(prev => ({ ...prev, [testName]: 'success' }));
      setTestData(prev => ({ ...prev, [testName]: result }));
      toast.success(`${testName} test passed`);
      return result;
    } catch (error) {
      console.error(`${testName} test failed:`, error);
      setTestResults(prev => ({ ...prev, [testName]: 'error' }));
      setTestData(prev => ({ ...prev, [testName]: error }));
      toast.error(`${testName} test failed`);
      throw error;
    }
  };

  const runAllTests = async () => {
    const sessionId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Test 1: Create Contact
      const contactResult = await runTest('Create Contact', () => 
        createContact({
          sessionId,
          email: 'test@example.com',
          name: 'Test User',
          company: 'Test Company',
          jobTitle: 'Test Engineer',
          phone: '+1234567890'
        })
      );

      // Test 2: Create Deal (if contact creation was successful)
      if (contactResult?.contactId) {
        await runTest('Create Deal', () => 
          createDeal({
            sessionId,
            dealName: 'Test Deal',
            contactId: contactResult.contactId,
            amount: 5000
          })
        );
      }

      // Test 3: Create Ticket
      if (contactResult?.contactId) {
        await runTest('Create Ticket', () => 
          createTicket({
            sessionId,
            subject: 'Test Support Ticket',
            content: 'This is a test ticket created for integration testing.',
            contactId: contactResult.contactId,
            priority: 'LOW',
            pipelineId: selectedPipeline,
            stageId: selectedStage
          })
        );
      }

      // Test 4: Sync Conversation
      if (contactResult?.contactId) {
        await runTest('Sync Conversation', () => 
          syncConversation({
            sessionId,
            contactId: contactResult.contactId
          })
        );
      }

      toast.success('All HubSpot integration tests completed!');
    } catch (error) {
      toast.error('Some tests failed. Check the results below.');
    }
  };

  const getTestIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Loader className="h-4 w-4 animate-spin text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <TestTube className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          HubSpot Integration Test Suite
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pipeline Configuration */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <h4 className="font-medium">Ticket Pipeline Configuration</h4>
          </div>
          
          {pipelines.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Pipeline</label>
                <Select value={selectedPipeline} onValueChange={(value) => {
                  setSelectedPipeline(value);
                  const pipeline = pipelines.find(p => p.id === value);
                  if (pipeline?.stages?.length > 0) {
                    setSelectedStage(pipeline.stages[0].id);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pipeline" />
                  </SelectTrigger>
                  <SelectContent>
                    {pipelines.map((pipeline) => (
                      <SelectItem key={pipeline.id} value={pipeline.id}>
                        {pipeline.label} ({pipeline.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Stage</label>
                <Select value={selectedStage} onValueChange={setSelectedStage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {pipelines.find(p => p.id === selectedPipeline)?.stages?.map((stage: any) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.label} ({stage.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No pipelines loaded. Click "Check Pipelines" to fetch them.
            </div>
          )}
          
          <Button 
            onClick={loadPipelines} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Check Pipelines
          </Button>
        </div>

        <Button 
          onClick={runAllTests} 
          disabled={loading || !selectedPipeline || !selectedStage}
          className="w-full"
        >
          {loading ? 'Running Tests...' : 'Run All HubSpot Integration Tests'}
        </Button>

        <div className="space-y-2">
          {['Create Contact', 'Create Deal', 'Create Ticket', 'Sync Conversation'].map((testName) => (
            <div key={testName} className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">{testName}</span>
              <div className="flex items-center gap-2">
                {getTestIcon(testResults[testName])}
                <span className="text-sm text-muted-foreground">
                  {testResults[testName] || 'Not run'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {Object.keys(testData).length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Test Results:</h4>
            <pre className="bg-muted p-3 rounded-lg text-xs overflow-auto max-h-40">
              {JSON.stringify(testData, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HubSpotIntegrationTest;
