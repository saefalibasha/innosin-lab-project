
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from 'lucide-react';

export const AdminProductEditor: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Product Editor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Product editing functionality will be implemented here.
        </p>
      </CardContent>
    </Card>
  );
};
