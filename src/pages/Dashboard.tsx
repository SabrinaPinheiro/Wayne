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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Total de Recursos</CardTitle>
            <Package className="h-5 w-5 text-muted-foreground icon-glow" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : stats.totalResources}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Equipamentos, veículos e dispositivos
            </p>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Recursos Disponíveis</CardTitle>
            <Package className="h-5 w-5 text-success icon-glow" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {loading ? '...' : stats.availableResources}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Prontos para uso
            </p>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Em Uso</CardTitle>
            <Activity className="h-5 w-5 text-primary icon-glow" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {loading ? '...' : stats.resourcesInUse}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Recursos atualmente alocados
            </p>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Manutenção</CardTitle>
            <AlertTriangle className="h-5 w-5 text-warning icon-glow" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">
              {loading ? '...' : stats.resourcesInMaintenance}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Requerem atenção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats for Managers and Admins */}
      {(profile?.role === 'admin' || profile?.role === 'gerente') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="stats-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Usuários do Sistema</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground icon-glow" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '...' : stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Total de usuários cadastrados
              </p>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Atividades Recentes</CardTitle>
              <Activity className="h-5 w-5 text-muted-foreground icon-glow" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '...' : stats.recentActivities}</div>
              <p className="text-xs text-muted-foreground mt-2">
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

    </div>
  );
};