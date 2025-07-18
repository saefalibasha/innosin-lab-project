
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export const AdminChatManager: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Chat Session Manager
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Chat session management functionality will be implemented here.
        </p>
      </CardContent>
    </Card>
  );
};
