import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, Package, History, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Resource {
  id: string;
  name: string;
  type: string;
  description: string;
  status: string;
  location: string;
  created_at: string;
  created_by: string;
  updated_at: string;
}

interface AccessLog {
  id: string;
  action: string;
  notes: string;
  timestamp: string;
  resources: { name: string };
}

const STATUS_CONFIG = {
  disponivel: { label: 'Disponível', variant: 'default' as const, icon: CheckCircle },
  em_uso: { label: 'Em Uso', variant: 'secondary' as const, icon: Clock },
  manutencao: { label: 'Manutenção', variant: 'destructive' as const, icon: AlertTriangle },
};

export const Employee = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [myLogs, setMyLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployeeData();
  }, []);

  const loadEmployeeData = async () => {
    try {
      setLoading(true);
      
      // Load available resources
      const { data: resourcesData, error: resourcesError } = await supabase
        .from('resources')
        .select('*')
        .order('name');

      if (resourcesError) {
        console.error('Resources error:', resourcesError);
        throw resourcesError;
      }

      // Load my access logs - fix the query for user_id
      const { data: logsData, error: logsError } = await supabase
        .from('access_logs')
        .select(`
          *,
          resources!access_logs_resource_id_fkey(name)
        `)
        .eq('user_id', profile?.user_id)
        .order('timestamp', { ascending: false })
        .limit(10);

      if (logsError) {
        console.error('Logs error:', logsError);
        // Don't throw for logs error, just set empty array
        setMyLogs([]);
      } else {
        setMyLogs(logsData || []);
      }

      setResources(resourcesData || []);
    } catch (error) {
      console.error('Error loading employee data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as informações dos recursos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const requestResource = async (resourceId: string, resourceName: string) => {
    try {
      // Create an access log entry for the resource request
      const { error } = await supabase
        .from('access_logs')
        .insert({
          user_id: profile?.user_id,
          resource_id: resourceId,
          action: 'solicitacao',
          notes: `Solicitação de acesso ao recurso: ${resourceName}`
        });

      if (error) throw error;

      toast({
        title: "Solicitação enviada",
        description: `Sua solicitação para ${resourceName} foi enviada aos gestores.`,
      });

      // Reload data to show the new log
      loadEmployeeData();
    } catch (error) {
      console.error('Error requesting resource:', error);
      toast({
        title: "Erro ao solicitar recurso",
        description: "Não foi possível enviar a solicitação.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  const availableResources = resources.filter(r => r.status === 'disponivel');
  const myActiveResources = resources.filter(r => r.status === 'em_uso');

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <User className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Portal do Funcionário</h1>
          <p className="text-muted-foreground">Bem-vindo, {profile?.full_name}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Recursos Disponíveis</CardTitle>
            <Package className="h-5 w-5 text-success icon-glow" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{availableResources.length}</div>
            <p className="text-xs text-muted-foreground mt-2">Para solicitação</p>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Em Meu Uso</CardTitle>
            <Clock className="h-5 w-5 text-warning icon-glow" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{myActiveResources.length}</div>
            <p className="text-xs text-muted-foreground mt-2">Recursos ativos</p>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Meu Histórico</CardTitle>
            <History className="h-5 w-5 text-primary icon-glow" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{myLogs.length}</div>
            <p className="text-xs text-muted-foreground mt-2">Acessos recentes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Available Resources */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg">
              <Package className="h-6 w-6 text-primary icon-glow" />
              Recursos Disponíveis
            </CardTitle>
            <CardDescription className="text-base">
              Recursos que você pode solicitar para uso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {availableResources.length === 0 ? (
                <div className="empty-state p-8 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h4 className="font-medium mb-2">Nenhum recurso disponível</h4>
                  <p className="text-muted-foreground text-sm">
                    Aguarde novos recursos serem liberados
                  </p>
                </div>
              ) : (
                availableResources.map((resource) => {
                  const StatusIcon = STATUS_CONFIG[resource.status].icon;
                  return (
                    <div key={resource.id} className="flex items-center justify-between p-6 border rounded-lg card-hover">
                      <div className="flex-1">
                        <h4 className="font-semibold text-base">{resource.name}</h4>
                        <p className="text-sm text-muted-foreground">{resource.type}</p>
                        <p className="text-xs text-muted-foreground mt-1">{resource.location}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <StatusIcon className="h-4 w-4" />
                          <Badge variant={STATUS_CONFIG[resource.status].variant} className="text-sm">
                            {STATUS_CONFIG[resource.status].label}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        size="default" 
                        onClick={() => requestResource(resource.id, resource.name)}
                        className="ml-4"
                      >
                        Solicitar
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* My Recent Access Logs */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg">
              <History className="h-6 w-6 text-primary icon-glow" />
              Meu Histórico Recente
            </CardTitle>
            <CardDescription className="text-base">
              Seus últimos acessos aos recursos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {myLogs.length === 0 ? (
                <div className="empty-state p-8 text-center">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h4 className="font-medium mb-2">Nenhum histórico de acesso</h4>
                  <p className="text-muted-foreground text-sm">
                    Seus acessos aos recursos aparecerão aqui
                  </p>
                </div>
              ) : (
                myLogs.map((log) => (
                  <div key={log.id} className="flex items-start justify-between p-5 border rounded-lg card-hover">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-base">{log.resources?.name}</h4>
                        <Badge variant="outline" className="text-sm">
                          {log.action === 'checkout' ? 'Retirada' : 
                           log.action === 'checkin' ? 'Devolução' : 
                           log.action === 'solicitacao' ? 'Solicitação' : 'Manutenção'}
                        </Badge>
                      </div>
                      {log.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{log.notes}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(log.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};