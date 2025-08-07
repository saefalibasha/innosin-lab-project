
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ModelViewerProps {
  modelPath: string;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ modelPath }) => {
  return (
    <Card>
      <CardContent className="p-4 h-64 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="mb-2">3D Model Viewer</div>
          <div className="text-sm">Model: {modelPath}</div>
          <div className="text-xs mt-2">3D viewer integration pending</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelViewer;
