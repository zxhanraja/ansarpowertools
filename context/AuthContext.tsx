import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ error: any }>;
  signup: (email: string, password: string, name: string, role?: UserRole) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Diagnostics Helper
const logDiagnostic = (action: string, details: any) => {
  console.group(`[Auth Diagnostic] ${action}`);
  console.log("Details:", details);
  console.log("Timestamp:", new Date().toISOString());
  console.log("Connection:", navigator.onLine ? "Online" : "Offline");
  console.groupEnd();
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (sessionUser: any) => {
    try {
      logDiagnostic("Fetching Profile", { email: sessionUser.email });

      // 5-second timeout for profile fetch
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .maybeSingle();

      const timeoutPromise = new Promise<{ data: any, error: any }>((_, reject) =>
        setTimeout(() => reject(new Error("Database timeout after 5s")), 5000)
      );

      const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]);

      if (error) {
        logDiagnostic("Profile Error", error);
      }

      if (profile) {
        setUser({
          id: sessionUser.id,
          email: sessionUser.email || '',
          name: profile.full_name || sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0],
          role: profile.role as UserRole
        });
      } else {
        // Fallback if profile not found
        setUser({
          id: sessionUser.id,
          email: sessionUser.email || '',
          name: sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0],
          role: (sessionUser.app_metadata?.role || sessionUser.user_metadata?.role || 'CUSTOMER') as UserRole
        });
      }
    } catch (err: any) {
      logDiagnostic("Fetch Catch", err.message);
      // Ensure we still have a basic user object even if DB fails
      setUser({
        id: sessionUser.id,
        email: sessionUser.email || '',
        name: sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0],
        role: (sessionUser.app_metadata?.role || sessionUser.user_metadata?.role || 'CUSTOMER') as UserRole
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check active session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
          setLoading(false);
        }
      } catch (e) {
        logDiagnostic("Init Auth Error", e);
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Auth Event] ${event}`);
      if (session?.user) {
        // If it's a SIGN_IN event or similar, we want to verify the role from DB
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          // We don't set loading here to avoid flicker if just refreshing token
          // But for initial sign in, fetchUserProfile handles loading state if called manually
          await fetchUserProfile(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    logDiagnostic("Login Attempt", { email });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.user) {
        await fetchUserProfile(data.user);
      }
      return { error: null };
    } catch (e: any) {
      logDiagnostic("Login Failed", e.message);
      setLoading(false);
      return { error: e };
    }
  };

  const signup = async (email: string, password: string, name: string, role: UserRole = UserRole.CUSTOMER) => {
    setLoading(true);
    logDiagnostic("Signup Attempt", { email, name });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role }
        }
      });

      if (error) throw error;
      logDiagnostic("Signup Success", { userId: data.user?.id });
      // If signup is successful, we don't need to wait for the profile trigger here
      // The onAuthStateChange will handle the redirection/session
      return { error: null };
    } catch (e: any) {
      logDiagnostic("Signup Failed", e.message);
      setLoading(false);
      return { error: e };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === UserRole.ADMIN,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};