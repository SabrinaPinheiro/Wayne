import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface Alert {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  status: 'read' | 'unread';
  created_at: string;
  read_at?: string;
}

const ALERT_ICONS = {
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
  success: CheckCircle,
};

const ALERT_COLORS = {
  info: 'text-blue-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
  success: 'text-green-500',
};

const ALERT_VARIANTS = {
  info: 'default' as const,
  warning: 'secondary' as const,
  error: 'destructive' as const,
  success: 'default' as const,
};

export const Alerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (user) {
      loadAlerts();
    }
  }, [user, filter]);

  const loadAlerts = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('alerts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (filter === 'unread') {
        query = query.eq('status', 'unread');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading alerts:', error);
        toast({
          title: 'Erro ao carregar alertas',
          description: 'Não foi possível carregar os alertas.',
          variant: 'destructive',
        });
        return;
      }

      setAlerts((data || []).map(item => ({
        ...item,
        type: item.type as 'info' | 'warning' | 'error' | 'success',
        status: item.status as 'read' | 'unread'
      })));
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ 
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) {
        console.error('Error marking alert as read:', error);
        return;
      }

      // Update local state
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'read' as const, read_at: new Date().toISOString() }
          : alert
      ));

      toast({
        title: 'Alerta marcado como lido',
        description: 'O alerta foi atualizado com sucesso.',
      });
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = alerts.filter(a => a.status === 'unread').map(a => a.id);
      
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('alerts')
        .update({ 
          status: 'read',
          read_at: new Date().toISOString()
        })
        .in('id', unreadIds);

      if (error) {
        console.error('Error marking all alerts as read:', error);
        return;
      }

      // Update local state
      setAlerts(prev => prev.map(alert => 
        unreadIds.includes(alert.id)
          ? { ...alert, status: 'read' as const, read_at: new Date().toISOString() }
          : alert
      ));

      toast({
        title: 'Todos os alertas marcados como lidos',
        description: 'Todos os alertas foram atualizados com sucesso.',
      });
    } catch (error) {
      console.error('Error marking all alerts as read:', error);
    }
  };

  const unreadCount = alerts.filter(a => a.status === 'unread').length;
  const filteredAlerts = filter === 'unread' ? alerts.filter(a => a.status === 'unread') : alerts;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8 text-primary icon-glow" />
            Alertas
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            Notificações e alertas do sistema
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            Todos ({alerts.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            onClick={() => setFilter('unread')}
            size="sm"
          >
            Não lidos ({unreadCount})
          </Button>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} size="sm" variant="outline">
              <Check className="h-4 w-4 mr-2" />
              Marcar todos como lidos
            </Button>
          )}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="card-hover">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-8 w-8 bg-muted rounded-full" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAlerts.length === 0 ? (
          <Card className="card-hover">
            <CardContent className="p-12 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg mb-2">
                {filter === 'unread' ? 'Nenhum alerta não lido' : 'Nenhum alerta encontrado'}
              </p>
              <p className="text-muted-foreground text-sm">
                {filter === 'unread' 
                  ? 'Todos os alertas foram lidos!' 
                  : 'Você não possui alertas no momento.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => {
            const Icon = ALERT_ICONS[alert.type];
            const isUnread = alert.status === 'unread';

            return (
              <Card 
                key={alert.id} 
                className={cn(
                  'card-hover transition-all duration-200',
                  isUnread && 'border-l-4 border-l-primary bg-muted/20'
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={cn(
                      'flex-shrink-0 p-2 rounded-full',
                      isUnread ? 'bg-primary/20' : 'bg-muted'
                    )}>
                      <Icon className={cn(
                        'h-5 w-5',
                        isUnread ? ALERT_COLORS[alert.type] : 'text-muted-foreground'
                      )} />
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={ALERT_VARIANTS[alert.type]} className="text-xs">
                          {alert.type === 'info' && 'Informação'}
                          {alert.type === 'warning' && 'Aviso'}
                          {alert.type === 'error' && 'Erro'}
                          {alert.type === 'success' && 'Sucesso'}
                        </Badge>
                        {isUnread && (
                          <Badge variant="default" className="text-xs">
                            Novo
                          </Badge>
                        )}
                      </div>
                      
                      <p className={cn(
                        'text-sm leading-relaxed',
                        isUnread ? 'font-medium' : 'text-muted-foreground'
                      )}>
                        {alert.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(alert.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })} • {format(new Date(alert.created_at), 'dd/MM/yyyy HH:mm')}
                        </p>
                        
                        {isUnread && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(alert.id)}
                            className="h-auto p-1 text-xs"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Marcar como lido
                          </Button>
                        )}
                      </div>
                      
                      {alert.read_at && (
                        <p className="text-xs text-muted-foreground italic">
                          Lido em {format(new Date(alert.read_at), 'dd/MM/yyyy HH:mm')}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};