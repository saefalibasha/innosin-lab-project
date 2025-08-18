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

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check if user is admin
        if (session?.user) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
            
            setIsAdmin(profile?.role === 'admin');
          } catch (error) {
            console.error('Error checking admin status:', error);
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check if user is admin
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          setIsAdmin(profile?.role === 'admin');
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
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
