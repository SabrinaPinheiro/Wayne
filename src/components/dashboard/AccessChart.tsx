import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';

interface DailyAccess {
  date: string;
  accesses: number;
}

export const AccessChart = () => {
  const [data, setData] = useState<DailyAccess[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccessData();
  }, []);

  const loadAccessData = async () => {
    try {
      const endDate = new Date();
      const startDate = subDays(endDate, 29); // Last 30 days

      const { data: logs, error } = await supabase
        .from('access_logs')
        .select('timestamp')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error loading access data:', error);
        return;
      }

      // Create array of all days in the last 30 days
      const allDays = eachDayOfInterval({ start: startDate, end: endDate });
      
      // Count accesses by day
      const accessCounts = logs?.reduce((acc: Record<string, number>, log) => {
        const day = format(new Date(log.timestamp), 'yyyy-MM-dd');
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {}) || {};

      // Create chart data with all days (including days with 0 accesses)
      const chartData = allDays.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        return {
          date: format(day, 'dd/MM'),
          accesses: accessCounts[dateStr] || 0,
        };
      });

      setData(chartData);
    } catch (error) {
      console.error('Error loading access data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Acessos Diários (Últimos 30 dias)</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground icon-glow" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[200px] flex items-center justify-center">
            <div className="text-sm text-muted-foreground">Carregando dados...</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
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
              <Line 
                type="monotone" 
                dataKey="accesses" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};