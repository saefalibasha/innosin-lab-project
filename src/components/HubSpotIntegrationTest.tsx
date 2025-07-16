
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHubSpotIntegration } from '@/hooks/useHubSpotIntegration';
import { toast } from 'sonner';
import { TestTube, CheckCircle, XCircle, Loader } from 'lucide-react';

const HubSpotIntegrationTest = () => {
  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'success' | 'error'>>({});
  const [testData, setTestData] = useState<any>({});
  const { createContact, createDeal, createTicket, syncConversation, loading } = useHubSpotIntegration();

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
            priority: 'LOW'
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
        <Button 
          onClick={runAllTests} 
          disabled={loading}
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
