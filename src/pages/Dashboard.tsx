import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Users, Activity, AlertTriangle } from 'lucide-react';

interface DashboardStats {
  totalResources: number;
  availableResources: number;
  resourcesInUse: number;
  resourcesInMaintenance: number;
  totalUsers: number;
  recentActivities: number;
}

export const Dashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalResources: 0,
    availableResources: 0,
    resourcesInUse: 0,
    resourcesInMaintenance: 0,
    totalUsers: 0,
    recentActivities: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);

      // Load resources stats
      const { data: resources, error: resourcesError } = await supabase
        .from('resources')
        .select('status');

      if (resourcesError) throw resourcesError;

      // Load users count (only for managers and admins)
      let usersCount = 0;
      if (profile?.role === 'admin' || profile?.role === 'gerente') {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id');
        
        if (!profilesError) {
          usersCount = profiles?.length || 0;
        }
      }

      // Load recent activities
      const { data: activities, error: activitiesError } = await supabase
        .from('access_logs')
        .select('id')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (activitiesError) throw activitiesError;

      // Calculate stats
      const totalResources = resources?.length || 0;
      const availableResources = resources?.filter(r => r.status === 'disponivel').length || 0;
      const resourcesInUse = resources?.filter(r => r.status === 'em_uso').length || 0;
      const resourcesInMaintenance = resources?.filter(r => r.status === 'manutencao').length || 0;

      setStats({
        totalResources,
        availableResources,
        resourcesInUse,
        resourcesInMaintenance,
        totalUsers: usersCount,
        recentActivities: activities?.length || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getRoleTitle = () => {
    switch (profile?.role) {
      case 'admin':
        return 'Administrador';
      case 'gerente':
        return 'Gerente';
      default:
        return 'Funcionário';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {getGreeting()}, {profile?.full_name || 'Usuário'}!
        </h1>
        <p className="text-muted-foreground mt-1">
          {getRoleTitle()} • Wayne Industries Resource Management
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Recursos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.totalResources}</div>
            <p className="text-xs text-muted-foreground">
              Equipamentos, veículos e dispositivos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recursos Disponíveis</CardTitle>
            <Package className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {loading ? '...' : stats.availableResources}
            </div>
            <p className="text-xs text-muted-foreground">
              Prontos para uso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Uso</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {loading ? '...' : stats.resourcesInUse}
            </div>
            <p className="text-xs text-muted-foreground">
              Recursos atualmente alocados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manutenção</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {loading ? '...' : stats.resourcesInMaintenance}
            </div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats for Managers and Admins */}
      {(profile?.role === 'admin' || profile?.role === 'gerente') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários do Sistema</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Total de usuários cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atividades Recentes</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.recentActivities}</div>
              <p className="text-xs text-muted-foreground">
                Últimas 24 horas
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Access Section */}
      <Card>
        <CardHeader>
          <CardTitle>Acesso Rápido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-border rounded-lg hover:bg-accent cursor-pointer transition-colors">
              <Package className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">Recursos</h3>
              <p className="text-sm text-muted-foreground">
                Gerenciar equipamentos e dispositivos
              </p>
            </div>
            
            <div className="p-4 border border-border rounded-lg hover:bg-accent cursor-pointer transition-colors">
              <Activity className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">Logs de Acesso</h3>
              <p className="text-sm text-muted-foreground">
                Histórico de uso dos recursos
              </p>
            </div>
            
            {(profile?.role === 'admin' || profile?.role === 'gerente') && (
              <div className="p-4 border border-border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                <Users className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium">Usuários</h3>
                <p className="text-sm text-muted-foreground">
                  Gerenciar perfis e permissões
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};