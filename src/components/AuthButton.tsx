
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

const AuthButton = () => {
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span>{user.email}</span>
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
  }

  return (
    <Link to="/auth">
      <Button variant="outline" size="sm">
        Sign In
      </Button>
    </Link>
  );
};

export default AuthButton;
