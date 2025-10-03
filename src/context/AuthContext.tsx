import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  role: 'funcionario' | 'gerente' | 'admin';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  verifyOtp: (email: string, token: string, type: string) => Promise<{ error: any }>;
  createDemoUsers: () => Promise<{ error?: any; data?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 [AuthContext] Setting up auth state listener...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 [AuthContext] Auth state changed:', { event, userId: session?.user?.id });
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch profile when user logs in
        if (session?.user) {
          console.log('👤 [AuthContext] User found, fetching profile...');
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 100); // Pequeno delay para garantir que a sessão está estabelecida
        } else {
          console.log('❌ [AuthContext] No user, clearing profile...');
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    console.log('🔍 [AuthContext] Checking for existing session...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📋 [AuthContext] Existing session check:', { userId: session?.user?.id });
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('👤 [AuthContext] Existing user found, fetching profile...');
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching profile for user ID:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error fetching profile:', error);
        return;
      }
      
      if (data) {
        console.log('✅ Profile fetched successfully:', {
          id: data.id,
          user_id: data.user_id,
          full_name: data.full_name,
          role: data.role,
          created_at: data.created_at
        });
        console.log('🔑 User role detected:', data.role);
        console.log('👤 Is admin?', data.role === 'admin');
        console.log('👨‍💼 Is gerente?', data.role === 'gerente');
      } else {
        console.warn('⚠️ No profile data found for user:', userId);
      }
      
      setProfile(data as Profile);
    } catch (error) {
      console.error('💥 Error fetching profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { error };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password: password
    });
    return { error };
  };

  const verifyOtp = async (email: string, token: string, type: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: type as any
    });
    return { error };
  };

  const createDemoUsers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-demo-users', {
        body: {}
      });

      if (error) {
        console.error('Error creating demo users:', error);
        return { error };
      }

      console.log('Demo users created successfully:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Error calling create-demo-users function:', error);
      return { error };
    }
  };


  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    verifyOtp,
    createDemoUsers,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};