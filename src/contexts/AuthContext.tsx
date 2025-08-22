
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
  const { validateAndSanitize, schemas, checkRateLimit } = useSecurityValidation();

  const checkAdminStatus = async (userEmail: string) => {
    try {
      console.log('Checking admin status for:', userEmail);
      const { data, error } = await supabase
        .from('admin_roles')
        .select('role, is_active')
        .eq('user_email', userEmail)
        .eq('is_active', true)
        .single();
      
      console.log('Admin query result:', { data, error });
      
      if (error) {
        console.log('No admin role found for user:', userEmail);
        setIsAdmin(false);
        return;
      }
      
      console.log('Setting admin status to:', !!data);
      setIsAdmin(!!data);
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
    // Rate limiting check
    if (!checkRateLimit('signup', 3, 900000)) { // 3 attempts per 15 minutes
      return { error: { message: 'Too many signup attempts. Please try again later.' } };
    }

    // Validate inputs
    const emailValidation = validateAndSanitize(email, schemas.email, 'validate_email');
    if (!emailValidation.success) {
      return { error: { message: emailValidation.error } };
    }

    const passwordValidation = validateAndSanitize(password, schemas.password, 'validate_password');
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

    // Log the attempt
    if (error) {
      try {
        await supabase.from('rate_limit_log').insert({
          email: emailValidation.data,
          operation: 'signup_failed',
          success: false
        });
      } catch (logError) {
        // Silent fail for logging
      }
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    // Rate limiting check
    if (!checkRateLimit('signin', 5, 900000)) { // 5 attempts per 15 minutes
      return { error: { message: 'Too many signin attempts. Please try again later.' } };
    }

    // Validate email format (but allow existing passwords through)
    const emailValidation = validateAndSanitize(email, schemas.email, 'validate_signin_email');
    if (!emailValidation.success) {
      return { error: { message: 'Invalid email format' } };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: emailValidation.data,
      password,
    });

    // Log the attempt
    if (error) {
      try {
        await supabase.from('rate_limit_log').insert({
          email: emailValidation.data,
          operation: 'signin_failed',
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
