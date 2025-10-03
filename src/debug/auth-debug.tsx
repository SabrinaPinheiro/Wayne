import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const AuthDebug = () => {
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 [AuthDebug] Starting authentication check...');
      
      // Check current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('📋 [AuthDebug] Current session:', session);
      console.log('❌ [AuthDebug] Session error:', sessionError);
      
      // Check current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('👤 [AuthDebug] Current user:', user);
      console.log('❌ [AuthDebug] User error:', userError);
      
      // Check localStorage for session
      const localSession = localStorage.getItem('sb-iasaqwddyppkhldoghqe-auth-token');
      console.log('💾 [AuthDebug] LocalStorage session:', localSession);
      
      // If we have a user, try to fetch profile
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        console.log('👥 [AuthDebug] User profile:', profile);
        console.log('❌ [AuthDebug] Profile error:', profileError);
      }
    };
    
    checkAuth();
  }, []);
  
  return null;
};