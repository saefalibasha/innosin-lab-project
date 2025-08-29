
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AdminAuthStatus = () => {
  const { user, isAdmin, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{user.email}</span>
        </div>
        {isAdmin && (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Shield className="h-3 w-3" />
            <span>Admin</span>
          </Badge>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={signOut}
        className="flex items-center space-x-1"
      >
        <LogOut className="h-4 w-4" />
        <span>Sign Out</span>
      </Button>
    </div>
  );
};

export default AdminAuthStatus;
