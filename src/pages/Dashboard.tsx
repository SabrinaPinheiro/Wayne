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
import logoBatman from '@/assets/logo-batman.png';

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
    <div className="space-y-0">
      {/* Batman Hero Section */}
      <div className="relative bg-gradient-to-br from-gotham-black via-gotham-gray to-gotham-black min-h-[200px] flex items-center justify-center overflow-hidden mb-8">
        {/* Batman Logo Background - Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <img 
            src={logoBatman} 
            alt="" 
            aria-hidden="true"
            className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 object-contain opacity-[0.06] select-none"
            style={{ filter: 'brightness(1.3) contrast(1.2)' }}
          />
        </div>
        
        {/* Hexagonal Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hexagons" x="0" y="0" width="50" height="43.4" patternUnits="userSpaceOnUse">
                <polygon points="25,0 50,14.4 50,28.9 25,43.4 0,28.9 0,14.4" fill="none" stroke="#d4af37" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexagons)" />
          </svg>
        </div>
        
        {/* Main Content */}
        <div className="relative z-10 text-center px-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Package className="w-8 h-8 text-gotham-gold icon-glow" />
            <h1 className="text-3xl md:text-4xl font-bold gradient-text">
              {getGreeting()}, {profile?.full_name || 'Usuário'}!
            </h1>
          </div>
          
          <p className="text-gotham-light/90 text-lg font-medium">
            {getRoleTitle()} • Wayne Industries Resource Management
          </p>
        </div>
        
        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-gotham-black to-transparent" />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6">

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="stats-card hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gotham-light">
              Total Resources
            </CardTitle>
            <Package className="h-4 w-4 text-gotham-gold icon-glow" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gotham-white">{stats.totalResources}</div>
            <p className="text-xs text-gotham-light">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="stats-card hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gotham-light">
              Available
            </CardTitle>
            <Package className="h-4 w-4 text-gotham-gold icon-glow" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gotham-white">{stats.availableResources}</div>
            <p className="text-xs text-gotham-light">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="stats-card hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gotham-light">
              In Use
            </CardTitle>
            <Activity className="h-4 w-4 text-gotham-gold icon-glow" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gotham-white">{stats.resourcesInUse}</div>
            <p className="text-xs text-gotham-light">
              +19% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="stats-card hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gotham-light">
              Maintenance
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-gotham-gold icon-glow" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gotham-white">{stats.resourcesInMaintenance}</div>
            <p className="text-xs text-gotham-light">
              +201 since last hour
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats for Managers and Admins */}
      {(profile?.role === 'admin' || profile?.role === 'gerente') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card className="stats-card hover-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gotham-light">System Users</CardTitle>
              <Users className="h-4 w-4 text-gotham-gold icon-glow" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gotham-white">{loading ? '...' : stats.totalUsers}</div>
              <p className="text-xs text-gotham-light">
                Total registered users
              </p>
            </CardContent>
          </Card>

          <Card className="stats-card hover-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gotham-light">Recent Activities</CardTitle>
              <Activity className="h-4 w-4 text-gotham-gold icon-glow" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gotham-white">{loading ? '...' : stats.recentActivities}</div>
              <p className="text-xs text-gotham-light">
                Last 24 hours
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
    </div>
  );
};