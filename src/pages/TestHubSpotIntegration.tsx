import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AdminAuthGuard from '@/components/AdminAuthGuard';

const TestHubSpotIntegration = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/admin/dashboard?tab=hubspot-test', { replace: true });
  }, [navigate]);
  return (
    <AdminAuthGuard>
      <Navigate to="/admin/dashboard?tab=hubspot-test" replace />
    </AdminAuthGuard>
  );
};

export default TestHubSpotIntegration;