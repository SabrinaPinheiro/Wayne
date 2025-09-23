import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (user) {
      loadUnreadCount();
      subscribeToAlerts();
    }
  }, [user]);

  const loadUnreadCount = async () => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('id')
        .eq('user_id', user?.id)
        .eq('status', 'unread');

      if (!error && data !== null) {
        const newCount = data.length || 0;
        if (newCount > unreadCount) {
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 1000);
        }
        setUnreadCount(newCount);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const subscribeToAlerts = () => {
    const channel = supabase
      .channel('alerts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts',
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          loadUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleClick = () => {
    navigate('/alerts');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="relative"
    >
      <Bell 
        className={cn(
          'h-5 w-5',
          isAnimating && 'animate-pulse',
          unreadCount > 0 && 'text-primary icon-glow'
        )} 
      />
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className={cn(
            'absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[20px]',
            isAnimating && 'animate-bounce'
          )}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
};