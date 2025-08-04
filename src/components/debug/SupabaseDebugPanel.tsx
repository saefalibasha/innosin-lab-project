import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Database, TestTube } from 'lucide-react';
import { debugSupabaseProducts, testAlternativeQueries } from '@/utils/supabaseDebug';

interface DebugResult {
  success: boolean;
  totalCount?: number;
  restrictiveCount: number;
  activeOnlyCount: number;
  seriesOnlyCount: number;
  noFiltersCount: number;
  error?: any;
}

const SupabaseDebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [debugResult, setDebugResult] = useState<DebugResult | null>(null);
  const [queryResults, setQueryResults] = useState<any[]>([]);

  const runDiagnostics = async () => {
    setIsRunning(true);
    try {
      console.log('🔧 Running Supabase diagnostics...');
      
      const [debugData, queryData] = await Promise.all([
        debugSupabaseProducts(),
        testAlternativeQueries()
      ]);
      
      setDebugResult(debugData);
      setQueryResults(queryData);
      
    } catch (error) {
      console.error('Error running diagnostics:', error);
      setDebugResult({ 
        success: false, 
        error, 
        restrictiveCount: 0,
        activeOnlyCount: 0,
        seriesOnlyCount: 0,
        noFiltersCount: 0
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusBadge = (count: number) => {
    if (count > 0) return <Badge variant="default" className="bg-green-500">Found: {count}</Badge>;
    return <Badge variant="destructive">None: {count}</Badge>;
  };

  // Only show in development mode
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="shadow-lg">
            <Database className="w-4 h-4 mr-2" />
            Debug Supabase
            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-2">
          <Card className="w-96 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <TestTube className="w-4 h-4" />
                Supabase Products Debug
              </CardTitle>
              <CardDescription className="text-xs">
                Test database connectivity and query strategies
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <Button 
                onClick={runDiagnostics} 
                disabled={isRunning}
                size="sm" 
                className="w-full"
              >
                {isRunning ? 'Running Diagnostics...' : 'Run Diagnostics'}
              </Button>
              
              {debugResult && (
                <div className="space-y-2">
                  <div className="text-xs font-medium">Connection Status:</div>
                  <Badge variant={debugResult.success ? "default" : "destructive"}>
                    {debugResult.success ? "Connected" : "Failed"}
                  </Badge>
                  
                  {debugResult.success && (
                    <>
                      <div className="text-xs font-medium">Total Products: {debugResult.totalCount}</div>
                      
                      <div className="space-y-1">
                        <div className="text-xs">Query Results:</div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Restrictive (both filters):</span>
                            {getStatusBadge(debugResult.restrictiveCount)}
                          </div>
                          <div className="flex justify-between">
                            <span>Active only:</span>
                            {getStatusBadge(debugResult.activeOnlyCount)}
                          </div>
                          <div className="flex justify-between">
                            <span>Series only:</span>
                            {getStatusBadge(debugResult.seriesOnlyCount)}
                          </div>
                          <div className="flex justify-between">
                            <span>No filters:</span>
                            {getStatusBadge(debugResult.noFiltersCount)}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {debugResult.error && (
                    <div className="p-2 bg-destructive/10 rounded text-xs">
                      <div className="font-medium text-destructive">Error:</div>
                      <div className="text-destructive/80">
                        {debugResult.error.message || String(debugResult.error)}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {queryResults.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium">Alternative Strategies:</div>
                  <div className="space-y-1">
                    {queryResults.map((result, index) => (
                      <div key={index} className="flex justify-between items-center text-xs">
                        <span className="truncate flex-1">{result.name.replace('Strategy ', 'S')}</span>
                        {result.success ? (
                          <Badge variant="outline" className="text-xs">{result.count}</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">Error</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default SupabaseDebugPanel;