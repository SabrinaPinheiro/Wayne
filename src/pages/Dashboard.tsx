import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Users, Activity, AlertTriangle, FileText, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AccessChart } from '@/components/dashboard/AccessChart';
import { ResourceStatusChart } from '@/components/dashboard/ResourceStatusChart';
import { VehicleMovementChart } from '@/components/dashboard/VehicleMovementChart';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';

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
  const navigate = useNavigate();
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
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Recursos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground icon-glow" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.totalResources}</div>
            <p className="text-xs text-muted-foreground">
              Equipamentos, veículos e dispositivos
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recursos Disponíveis</CardTitle>
            <Package className="h-4 w-4 text-success icon-glow" />
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

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Uso</CardTitle>
            <Activity className="h-4 w-4 text-primary icon-glow" />
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

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manutenção</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning icon-glow" />
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
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários do Sistema</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground icon-glow" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Total de usuários cadastrados
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atividades Recentes</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground icon-glow" />
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

      {/* Analytics Charts */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Analytics</h3>
        
        {/* First Row - Main Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <AccessChart />
          <ResourceStatusChart />
        </div>
        
        {/* Second Row - Vehicle Movement and Activity Timeline */}
        <div className="grid gap-6 md:grid-cols-2">
          <VehicleMovementChart />
          <ActivityTimeline />
        </div>
      </div>

      {/* Quick Access */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Acesso Rápido</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow card-hover"
            onClick={() => navigate('/resources')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Package className="h-8 w-8 text-primary icon-glow" />
                <div>
                  <h4 className="font-semibold">Recursos</h4>
                  <p className="text-sm text-muted-foreground">
                    Gerenciar equipamentos e veículos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow card-hover"
            onClick={() => navigate('/access-logs')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <FileText className="h-8 w-8 text-primary icon-glow" />
                <div>
                  <h4 className="font-semibold">Logs de Acesso</h4>
                  <p className="text-sm text-muted-foreground">
                    Histórico de movimentações
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {(profile?.role === 'admin' || profile?.role === 'gerente') && (
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow card-hover"
              onClick={() => navigate('/users')}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <UserPlus className="h-8 w-8 text-primary icon-glow" />
                  <div>
                    <h4 className="font-semibold">Usuários</h4>
                    <p className="text-sm text-muted-foreground">
                      Gerenciar usuários do sistema
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};