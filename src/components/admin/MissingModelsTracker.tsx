
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Upload, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MissingModel {
  productId: string;
  productName: string;
  timestamp: number;
}

interface MissingModelsTrackerProps {
  missingModels: MissingModel[];
  onClearModel: (productId: string) => void;
  onClearAll: () => void;
}

const MissingModelsTracker = ({
  missingModels,
  onClearModel,
  onClearAll
}: MissingModelsTrackerProps) => {
  if (missingModels.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Missing 3D Models Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No missing models detected. All products have valid 3D models.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Missing 3D Models Tracker
          <Badge variant="destructive" className="ml-auto">
            {missingModels.length} missing
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            The following products are missing 3D models or failed to load. Upload models to complete the product experience.
          </AlertDescription>
        </Alert>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {missingModels.length} product{missingModels.length !== 1 ? 's' : ''} need{missingModels.length === 1 ? 's' : ''} 3D models
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClearAll}
          >
            Clear All
          </Button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {missingModels.map((model) => (
            <div 
              key={model.productId}
              className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
            >
              <div className="flex-1">
                <p className="font-medium text-sm">{model.productName}</p>
                <p className="text-xs text-muted-foreground">
                  ID: {model.productId}
                </p>
                <p className="text-xs text-muted-foreground">
                  Detected: {new Date(model.timestamp).toLocaleString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onClearModel(model.productId)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Next Steps:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Upload missing 3D models (.glb format)</li>
            <li>• Update product model paths in the database</li>
            <li>• Verify model file accessibility</li>
            <li>• Test 3D model loading in product pages</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default MissingModelsTracker;
