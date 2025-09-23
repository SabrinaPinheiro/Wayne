import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Package } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Activity {
  id: string;
  user_name: string;
  resource_name: string;
  action: string;
  timestamp: string;
  notes?: string;
}

const ACTION_LABELS = {
  checkout: { label: 'Retirou', color: 'bg-blue-500' },
  checkin: { label: 'Devolveu', color: 'bg-green-500' },
  maintenance: { label: 'Manutenção', color: 'bg-yellow-500' },
};

export const ActivityTimeline = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('access_logs')
        .select(`
          id,
          action,
          timestamp,
          notes,
          profiles!access_logs_user_id_fkey (full_name),
          resources!access_logs_resource_id_fkey (name)
        `)
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading activities:', error);
        return;
      }

      const formattedActivities = data?.map((item: any) => ({
        id: item.id,
        user_name: item.profiles?.full_name || 'Usuário',
        resource_name: item.resources?.name || 'Recurso',
        action: item.action,
        timestamp: item.timestamp,
        notes: item.notes,
      })) || [];

      setActivities(formattedActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-medium">Atividades Recentes</CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground icon-glow" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                <div className="space-y-1 flex-1">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma atividade recente encontrada
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const actionConfig = ACTION_LABELS[activity.action as keyof typeof ACTION_LABELS] || {
                label: activity.action,
                color: 'bg-gray-500'
              };

              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${actionConfig.color}`}>
                    {activity.action === 'checkout' ? (
                      <Package className="h-4 w-4 text-white" />
                    ) : activity.action === 'checkin' ? (
                      <Package className="h-4 w-4 text-white" />
                    ) : (
                      <Package className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm font-medium">{activity.user_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {actionConfig.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground">
                      {activity.resource_name}
                    </p>
                    {activity.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.notes}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};