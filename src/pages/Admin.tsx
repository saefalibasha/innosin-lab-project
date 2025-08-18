
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import HeaderBrand from '@/components/HeaderBrand';
import SecurityAuditLog from '@/components/SecurityAuditLog';

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dashboard Overview</h2>
        <p className="text-muted-foreground">Welcome to the admin dashboard</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Monitor system security</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Manage product catalog</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">User management</p>
          </CardContent>
        </Card>
      </div>

      <SecurityAuditLog />
    </div>
  );
};

const Admin = () => {
  const { user, isAdmin } = useAuth();

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderBrand />
        <div className="pt-20 container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
              <p className="text-muted-foreground">You don't have permission to access the admin area.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderBrand />
      
      <div className="pt-20 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your application</p>
        </div>

        <Routes>
          <Route path="/*" element={<AdminDashboard />} />
        </Routes>
      </div>
    </div>
  );
};

export default Admin;
