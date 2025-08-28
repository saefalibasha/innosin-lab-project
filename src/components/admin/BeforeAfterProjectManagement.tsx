
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera } from 'lucide-react';

const BeforeAfterProjectManagement = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Before & After Projects
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Before and after project management functionality will be implemented here.
        </p>
      </CardContent>
    </Card>
  );
};

export default BeforeAfterProjectManagement;
