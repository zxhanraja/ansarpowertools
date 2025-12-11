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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch the real profile from the database
  const fetchUserProfile = async (sessionUser: any) => {
    try {
      console.log(`[Auth] Fetching profile for: ${sessionUser.email} (${sessionUser.id})`);
      
      // Use maybeSingle() instead of single() to avoid "Cannot coerce..." error if row is missing
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .maybeSingle();

      if (error) {
        // Fix: Log specific message instead of generic object
        console.error("Error fetching profile:", error.message || error);

        // Specific handling for missing table (common in new setups)
        if (error.code === '42P01') {
          console.warn("⚠️ 'profiles' table not found in Supabase. Please run the SQL setup script.");
        }
      }

      console.log("[Auth] DB Profile:", profile);

      if (profile) {
        const role = (profile.role as UserRole) || UserRole.CUSTOMER;
        console.log(`[Auth] Role determined as: ${role}`);
        setUser({
          id: sessionUser.id,
          email: sessionUser.email || '',
          name: profile.full_name || sessionUser.email?.split('@')[0],
          role: role
        });
      } else {
        console.warn("[Auth] Profile missing in DB. Fallback to CUSTOMER.");
        // Fallback to session data if DB fetch fails OR if profile doesn't exist yet
        setUser({
          id: sessionUser.id,
          email: sessionUser.email || '',
          name: sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0],
          role: UserRole.CUSTOMER
        });
      }
    } catch (err: any) {
      console.error("Unexpected error in fetchUserProfile:", err.message || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check active session
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Auth] State Change: ${event}`);
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
    setLoading(true); // Start loading immediately
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Supabase Login Error:", error.message);
      setLoading(false);
      return { error };
    }

    // Critical Fix: Explicitly wait for profile fetch before resolving login
    // This prevents the "Race Condition" where navigation happens before role is set
    if (data.user) {
      await fetchUserProfile(data.user);
    } else {
      setLoading(false);
    }

    return { error: null };
  };

  const signup = async (email: string, password: string, name: string, role: UserRole = UserRole.CUSTOMER) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role // This initial metadata is used by the trigger to populate the profile
        }
      }
    });
    if (error) console.error("Supabase Signup Error:", error.message);
    return { error };
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