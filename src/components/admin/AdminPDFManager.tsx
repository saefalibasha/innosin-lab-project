
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export const AdminPDFManager: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          PDF Document Manager
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          PDF document management functionality will be implemented here.
        </p>
      </CardContent>
    </Card>
  );
};
