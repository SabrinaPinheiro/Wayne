import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

interface StatusData {
  name: string;
  value: number;
  color: string;
}

const STATUS_COLORS = {
  disponivel: 'hsl(var(--success))',
  em_uso: 'hsl(var(--primary))',
  manutencao: 'hsl(var(--warning))',
  inativo: 'hsl(var(--destructive))',
};

const STATUS_LABELS = {
  disponivel: 'Disponível',
  em_uso: 'Em Uso',
  manutencao: 'Manutenção',
  inativo: 'Inativo',
};

export const ResourceStatusChart = () => {
  const [data, setData] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatusData();
  }, []);

  const loadStatusData = async () => {
    try {
      const { data: resources, error } = await supabase
        .from('resources')
        .select('status');

      if (error) {
        console.error('Error loading resource status data:', error);
        return;
      }

      // Count resources by status
      const statusCounts = resources?.reduce((acc: Record<string, number>, resource) => {
        acc[resource.status] = (acc[resource.status] || 0) + 1;
        return acc;
      }, {}) || {};

      // Convert to chart data
      const chartData = Object.entries(statusCounts).map(([status, count]) => ({
        name: STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status,
        value: count as number,
        color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'hsl(var(--muted))',
      }));

      setData(chartData);
    } catch (error) {
      console.error('Error loading status data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Status dos Recursos</CardTitle>
        <Settings className="h-4 w-4 text-muted-foreground icon-glow" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[250px] flex items-center justify-center">
            <div className="text-sm text-muted-foreground">Carregando dados...</div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center">
            <div className="text-sm text-muted-foreground">Nenhum recurso encontrado</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend 
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};