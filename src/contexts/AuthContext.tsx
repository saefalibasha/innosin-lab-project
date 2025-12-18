
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useSecurityValidation } from '@/hooks/useSecurityValidation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { validateAndSanitize, schemas } = useSecurityValidation();

  const checkAdminStatus = async (userEmail: string) => {
    try {
      console.log('Checking admin status for:', userEmail);

      // Use RPC with SECURITY DEFINER to avoid RLS issues
      const { data, error } = await supabase.rpc('is_admin', { user_email: userEmail });

      console.log('Admin RPC result:', { data, error });

      if (error) {
        console.error('RPC error checking admin status:', error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(Boolean(data));
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Check admin status when user changes
        if (session?.user?.email) {
          checkAdminStatus(session.user.email);
        } else {
          setIsAdmin(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Check admin status for existing session
      if (session?.user?.email) {
        checkAdminStatus(session.user.email);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    // Server-side rate limiting check
    try {
      const { data: allowed, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
        operation_name: 'signup',
        max_attempts: 3,
        time_window_minutes: 15
      });
      
      if (rateLimitError) {
        console.error('Rate limit check failed:', rateLimitError);
      } else if (!allowed) {
        return { error: { message: 'Too many signup attempts. Please try again later.' } };
      }
    } catch (err) {
      console.error('Rate limit check error:', err);
      // Continue with signup if rate limit check fails (fail-open for availability)
    }

    // Validate inputs
    const emailValidation = validateAndSanitize(email, schemas.email);
    if (!emailValidation.success) {
      return { error: { message: emailValidation.error } };
    }

    const passwordValidation = validateAndSanitize(password, schemas.password);
    if (!passwordValidation.success) {
      return { error: { message: passwordValidation.error } };
    }

    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email: emailValidation.data,
      password: passwordValidation.data,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    // Log the attempt for server-side rate limiting
    if (error) {
      try {
        await supabase.from('rate_limit_log').insert({
          email: emailValidation.data,
          operation: 'signup',
          success: false
        });
      } catch (logError) {
        // Silent fail for logging
      }
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    // Server-side rate limiting check
    try {
      const { data: allowed, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
        operation_name: 'signin',
        max_attempts: 5,
        time_window_minutes: 15
      });
      
      if (rateLimitError) {
        console.error('Rate limit check failed:', rateLimitError);
      } else if (!allowed) {
        return { error: { message: 'Too many signin attempts. Please try again later.' } };
      }
    } catch (err) {
      console.error('Rate limit check error:', err);
      // Continue with signin if rate limit check fails (fail-open for availability)
    }

    // Validate email format (but allow existing passwords through)
    const emailValidation = validateAndSanitize(email, schemas.email);
    if (!emailValidation.success) {
      return { error: { message: 'Invalid email format' } };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: emailValidation.data,
      password,
    });

    // Log the attempt for server-side rate limiting
    if (error) {
      try {
        await supabase.from('rate_limit_log').insert({
          email: emailValidation.data,
          operation: 'signin',
          success: false
        });
      } catch (logError) {
        // Silent fail for logging
      }
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  const value = {
    user,
    session,
    loading,
    isAdmin,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
