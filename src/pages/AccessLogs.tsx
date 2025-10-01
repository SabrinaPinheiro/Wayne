import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Search, Filter, ChevronLeft, ChevronRight, Clock, User, Package } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/components/ui/use-toast';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { EmptyState } from '@/components/ui/empty-state';
import { TableLoading } from '@/components/ui/loading';

interface AccessLog {
  id: string;
  user_name: string;
  resource_name: string;
  resource_type: string;
  action: string;
  notes?: string;
  timestamp: string;
}

interface Filters {
  search: string;
  action: string;
  dateFrom: string;
  dateTo: string;
}

const ACTION_LABELS = {
  checkout: { label: 'Retirada', variant: 'default' as const },
  checkin: { label: 'Devolução', variant: 'secondary' as const },
  maintenance: { label: 'Manutenção', variant: 'destructive' as const },
};

export const AccessLogs = () => {
  const { profile } = useAuth();
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    action: '',
    dateFrom: '',
    dateTo: '',
  });
  const itemsPerPage = 10;

  useEffect(() => {
    loadLogs();
  }, [currentPage, filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Erro de autenticação:', authError);
        toast({
          title: 'Erro de Autenticação',
          description: 'Usuário não autenticado. Faça login novamente.',
          variant: 'destructive',
        });
        return;
      }
      
      let query = supabase
        .from('access_logs')
        .select(`
          id,
          action,
          notes,
          timestamp,
          user_id,
          resources!access_logs_resource_id_fkey(name, type)
        `, { count: 'exact' })
        .order('timestamp', { ascending: false });

      // Apply filters
      if (filters.action) {
        query = query.eq('action', filters.action);
      }

      if (filters.dateFrom) {
        query = query.gte('timestamp', `${filters.dateFrom}T00:00:00`);
      }

      if (filters.dateTo) {
        query = query.lte('timestamp', `${filters.dateTo}T23:59:59`);
      }

      // Pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Erro detalhado ao carregar logs:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        let errorMessage = 'Não foi possível carregar os logs de acesso.';
        if (error.code === 'PGRST301') {
          errorMessage = 'Acesso negado. Verifique suas permissões.';
        } else if (error.code === 'PGRST116') {
          errorMessage = 'Erro de relacionamento entre tabelas.';
        }
        
        throw new Error(errorMessage);
      }

      // Buscar os perfis dos usuários
      const userIds = [...new Set((data || []).map((log: any) => log.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Erro ao carregar perfis:', profilesError);
      }

      // Criar um mapa de user_id para full_name
      const profilesMap = new Map();
      (profilesData || []).forEach((profile: any) => {
        profilesMap.set(profile.user_id, profile.full_name);
      });

      let formattedLogs: AccessLog[] = (data || []).map((log: any) => ({
        id: log.id,
        user_name: profilesMap.get(log.user_id) || 'Usuário Desconhecido',
        resource_name: log.resources?.name || 'Recurso Desconhecido',
        resource_type: log.resources?.type || 'Tipo Desconhecido',
        action: log.action,
        notes: log.notes,
        timestamp: log.timestamp,
      }));

      // Aplicar filtro de busca por nome de usuário se necessário
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        formattedLogs = formattedLogs.filter(log => 
          log.user_name.toLowerCase().includes(searchLower) ||
          log.resource_name.toLowerCase().includes(searchLower)
        );
      }

      setLogs(formattedLogs);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Erro geral ao carregar logs:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro inesperado ao carregar logs.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handleExport = () => {
    try {
      // Create CSV content
      const csvContent = [
        ['Data/Hora', 'Usuário', 'Recurso', 'Tipo', 'Ação', 'Observações'].join(','),
        ...logs.map(log => [
          format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
          log.user_name,
          log.resource_name,
          log.resource_type,
          ACTION_LABELS[log.action as keyof typeof ACTION_LABELS]?.label || log.action,
          log.notes || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `logs_acesso_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Sucesso',
        description: 'Logs exportados com sucesso!',
      });
    } catch (error) {
      console.error('Erro no export:', error);
      toast({
        title: 'Erro no export',
        description: 'Não foi possível exportar os logs.',
        variant: 'destructive',
      });
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Logs de Acesso</h1>
          <p className="text-muted-foreground">
            Histórico completo de movimentações de recursos
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuário ou recurso..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filters.action} onValueChange={(value) => handleFilterChange('action', value === 'all' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as ações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                <SelectItem value="checkout">Retirada</SelectItem>
                <SelectItem value="checkin">Devolução</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Data inicial"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />

            <Input
              type="date"
              placeholder="Data final"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />

            <Button 
              onClick={handleExport}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Logs de Acesso ({totalCount} total)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <TableLoading rows={5} columns={6} className="p-6" />
          ) : logs.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Nenhum log encontrado"
              description="Não há registros de acesso com os filtros aplicados. Tente ajustar os filtros."
            />
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="block sm:hidden space-y-3 p-4">
                {logs.map((log) => (
                  <Card key={log.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-mono">
                            {format(new Date(log.timestamp), 'dd/MM/yy HH:mm', { locale: ptBR })}
                          </span>
                        </div>
                        <Badge variant={ACTION_LABELS[log.action as keyof typeof ACTION_LABELS]?.variant || 'default'} className="text-xs">
                          {ACTION_LABELS[log.action as keyof typeof ACTION_LABELS]?.label || log.action}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm font-medium truncate">{log.user_name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm truncate block">{log.resource_name}</span>
                            <Badge variant="outline" className="text-xs mt-1">{log.resource_type}</Badge>
                          </div>
                        </div>
                        
                        {log.notes && (
                          <div className="text-sm text-muted-foreground">
                            <strong>Observações:</strong> {log.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">Data/Hora</TableHead>
                      <TableHead className="w-[150px]">Usuário</TableHead>
                      <TableHead className="w-[150px]">Recurso</TableHead>
                      <TableHead className="w-[100px]">Tipo</TableHead>
                      <TableHead className="w-[100px]">Ação</TableHead>
                      <TableHead className="min-w-[150px]">Observações</TableHead>
                    </TableRow>
                  </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-sm whitespace-nowrap">
                            {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </TableCell>
                          <TableCell className="max-w-[100px] truncate">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{log.user_name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[120px] truncate">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{log.resource_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{log.resource_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={ACTION_LABELS[log.action as keyof typeof ACTION_LABELS]?.variant || 'default'} className="text-xs">
                              {ACTION_LABELS[log.action as keyof typeof ACTION_LABELS]?.label || log.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[120px] truncate" title={log.notes}>
                            {log.notes || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
                  <div className="text-sm text-muted-foreground text-center sm:text-left">
                    Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, totalCount)} de {totalCount} registros
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Anterior</span>
                    </Button>
                    <div className="text-sm">
                      {currentPage}/{totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <span className="hidden sm:inline">Próxima</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};