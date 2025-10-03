import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';

interface VehicleMovement {
  date: string;
  checkouts: number;
  checkins: number;
}

export const VehicleMovementChart = () => {
  const [data, setData] = useState<VehicleMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicleData();
  }, []);

  const loadVehicleData = async () => {
    try {
      const endDate = new Date();
      const startDate = subDays(endDate, 13); // Last 14 days

      // Get vehicle resources
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('resources')
        .select('id')
        .eq('type', 'veiculo');

      if (vehiclesError) {
        console.error('Error loading vehicles:', vehiclesError);
        return;
      }

      const vehicleIds = vehicles?.map(v => v.id) || [];

      if (vehicleIds.length === 0) {
        setData([]);
        setLoading(false);
        return;
      }

      // Get vehicle access logs
      const { data: logs, error } = await supabase
        .from('access_logs')
        .select('timestamp, action, resource_id')
        .in('resource_id', vehicleIds)
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error loading vehicle movement data:', error);
        return;
      }

      // Create array of all days in the last 14 days
      const allDays = eachDayOfInterval({ start: startDate, end: endDate });
      
      // Count movements by day and action
      const movementCounts = logs?.reduce((acc: Record<string, { checkouts: number; checkins: number }>, log) => {
        const day = format(new Date(log.timestamp), 'yyyy-MM-dd');
        if (!acc[day]) {
          acc[day] = { checkouts: 0, checkins: 0 };
        }
        
        if (log.action === 'checkout') {
          acc[day].checkouts++;
        } else if (log.action === 'checkin') {
          acc[day].checkins++;
        }
        
        return acc;
      }, {}) || {};

      // Create chart data
      const chartData = allDays.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const movements = movementCounts[dateStr] || { checkouts: 0, checkins: 0 };
        return {
          date: format(day, 'dd/MM'),
          checkouts: movements.checkouts,
          checkins: movements.checkins,
        };
      });

      setData(chartData);
    } catch (error) {
      console.error('Error loading vehicle movement data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Movimentação de Veículos (Últimos 14 dias)</CardTitle>
        <Truck className="h-4 w-4 text-muted-foreground icon-glow" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[200px] flex items-center justify-center">
            <div className="text-sm text-muted-foreground">Carregando dados...</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar 
                dataKey="checkouts" 
                fill="hsl(var(--primary))" 
                name="Retiradas"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="checkins" 
                fill="hsl(var(--success))" 
                name="Devoluções"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};