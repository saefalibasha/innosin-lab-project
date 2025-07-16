import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSecurityValidation } from '@/hooks/useSecurityValidation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, UserX, UserCheck, History, AlertTriangle } from 'lucide-react';

interface AdminRole {
  id: string;
  user_email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface AuditLog {
  id: string;
  changed_by_email: string;
  target_user_email: string;
  old_role: string | null;
  new_role: string | null;
  action: string;
  created_at: string;
}

const AdminRoleManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { validateAndSanitize, schemas, checkRateLimit } = useSecurityValidation();
  
  const [adminRoles, setAdminRoles] = useState<AdminRole[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('admin');
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminRoles();
    fetchAuditLogs();
    checkCurrentUserRole();
  }, []);

  const checkCurrentUserRole = async () => {
    if (!user?.email) return;
    
    try {
      const { data } = await supabase.rpc('get_current_user_role');
      setCurrentUserRole(data);
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const fetchAdminRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdminRoles(data || []);
    } catch (error) {
      console.error('Error fetching admin roles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin roles",
        variant: "destructive",
      });
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_role_audit')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAdminRole = async () => {
    // Rate limiting
    if (!checkRateLimit('add_admin', 3, 300000)) { // 3 attempts per 5 minutes
      toast({
        title: "Rate Limited",
        description: "Too many attempts. Please wait before trying again.",
        variant: "destructive",
      });
      return;
    }

    // Validate email
    const emailValidation = validateAndSanitize(newUserEmail, schemas.email);
    if (!emailValidation.success) {
      toast({
        title: "Invalid Email",
        description: emailValidation.error,
        variant: "destructive",
      });
      return;
    }

    // Prevent self-modification
    if (emailValidation.data === user?.email) {
      toast({
        title: "Error",
        description: "Cannot modify your own role",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('admin_roles')
        .insert({
          user_email: emailValidation.data,
          role: newUserRole,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Added ${emailValidation.data} as ${newUserRole}`,
      });

      setNewUserEmail('');
      setNewUserRole('admin');
      fetchAdminRoles();
      fetchAuditLogs();
    } catch (error: any) {
      console.error('Error adding admin role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add admin role",
        variant: "destructive",
      });
    }
  };

  const toggleRoleStatus = async (roleId: string, currentStatus: boolean) => {
    // Rate limiting
    if (!checkRateLimit('toggle_role', 5, 300000)) {
      toast({
        title: "Rate Limited",
        description: "Too many attempts. Please wait.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('admin_roles')
        .update({ is_active: !currentStatus })
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Role ${!currentStatus ? 'activated' : 'deactivated'}`,
      });

      fetchAdminRoles();
      fetchAuditLogs();
    } catch (error: any) {
      console.error('Error toggling role status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update role status",
        variant: "destructive",
      });
    }
  };

  const deleteRole = async (roleId: string) => {
    // Rate limiting
    if (!checkRateLimit('delete_role', 3, 300000)) {
      toast({
        title: "Rate Limited",
        description: "Too many attempts. Please wait.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('admin_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin role deleted",
      });

      fetchAdminRoles();
      fetchAuditLogs();
    } catch (error: any) {
      console.error('Error deleting role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete role",
        variant: "destructive",
      });
    }
  };

  // Only super admins can manage roles
  if (currentUserRole !== 'super_admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <p>You don't have permission to manage admin roles.</p>
            <p className="text-sm mt-2">Only super administrators can access this feature.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading admin roles...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add New Admin */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Add New Admin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={newUserRole} onValueChange={setNewUserRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={addAdminRole} className="w-full">
                Add Admin
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Admin Roles */}
      <Card>
        <CardHeader>
          <CardTitle>Current Admin Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adminRoles.map((role) => (
              <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{role.user_email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={role.role === 'super_admin' ? 'default' : 'secondary'}>
                        {role.role}
                      </Badge>
                      <Badge variant={role.is_active ? 'default' : 'destructive'}>
                        {role.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {role.user_email !== user?.email && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleRoleStatus(role.id, role.is_active)}
                    >
                      {role.is_active ? (
                        <>
                          <UserX className="h-4 w-4 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Admin Role</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the admin role for {role.user_email}? 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteRole(role.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Changes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {auditLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm">
                <div>
                  <span className="font-medium">{log.changed_by_email}</span> {log.action} 
                  {log.old_role && log.new_role && log.old_role !== log.new_role && (
                    <span> role from <Badge variant="outline">{log.old_role}</Badge> to <Badge variant="outline">{log.new_role}</Badge></span>
                  )}
                  {log.action === 'created' && (
                    <span> <Badge variant="outline">{log.new_role}</Badge> role</span>
                  )}
                  <span> for <span className="font-medium">{log.target_user_email}</span></span>
                </div>
                <span className="text-muted-foreground">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRoleManager;