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

      // Build query
      let query = supabase
        .from('access_logs')
        .select(`
          id,
          action,
          timestamp,
          notes,
          user_id,
          resource_id
        `, { count: 'exact' });

      // Apply filters
      if (filters.search) {
        query = query.or(
          `profiles.full_name.ilike.%${filters.search}%,resources.name.ilike.%${filters.search}%`
        );
      }

      if (filters.action) {
        query = query.eq('action', filters.action);
      }

      if (filters.dateFrom) {
        query = query.gte('timestamp', new Date(filters.dateFrom + 'T00:00:00').toISOString());
      }

      if (filters.dateTo) {
        query = query.lte('timestamp', new Date(filters.dateTo + 'T23:59:59').toISOString());
      }

      // Apply pagination and ordering
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error, count } = await query
        .order('timestamp', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error loading logs:', error);
        toast({
          title: 'Erro ao carregar logs',
          description: 'Não foi possível carregar os logs de acesso.',
          variant: 'destructive',
        });
        return;
      }

      // Get user and resource names separately to avoid foreign key issues
      const userIds = data?.map(item => item.user_id).filter(Boolean) || [];
      const resourceIds = data?.map(item => item.resource_id).filter(Boolean) || [];
      
      const [usersData, resourcesData] = await Promise.all([
        userIds.length > 0 ? supabase.from('profiles').select('id, full_name').in('id', userIds) : { data: [] },
        resourceIds.length > 0 ? supabase.from('resources').select('id, name, type').in('id', resourceIds) : { data: [] }
      ]);

      const usersMap = new Map<string, string>();
      const resourcesMap = new Map<string, {name: string, type: string}>();
      
      // Populate maps safely
      usersData.data?.forEach(u => {
        if (u.id && u.full_name) {
          usersMap.set(u.id, u.full_name);
        }
      });
      
      resourcesData.data?.forEach(r => {
        if (r.id && r.name && r.type) {
          resourcesMap.set(r.id, { name: r.name, type: r.type });
        }
      });

      const formattedLogs = data?.map((item: any) => ({
        id: item.id,
        user_name: usersMap.get(item.user_id) || 'Usuário',
        resource_name: resourcesMap.get(item.resource_id)?.name || 'Recurso',
        resource_type: resourcesMap.get(item.resource_id)?.type || 'Tipo',
        action: item.action,
        notes: item.notes,
        timestamp: item.timestamp,
      })) || [];

      setLogs(formattedLogs);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({ search: '', action: '', dateFrom: '', dateTo: '' });
    setCurrentPage(1);
  };

  const exportCSV = () => {
    try {
      const csvHeaders = ['Data/Hora', 'Usuário', 'Recurso', 'Tipo', 'Ação', 'Observações'];
      const csvData = logs.map(log => [
        format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
        log.user_name,
        log.resource_name,
        log.resource_type,
        ACTION_LABELS[log.action as keyof typeof ACTION_LABELS]?.label || log.action,
        log.notes || '',
      ]);

      const csvContent = [csvHeaders, ...csvData]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `logs-acesso-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();

      toast({
        title: 'Export realizado',
        description: 'Logs exportados com sucesso!',
      });
    } catch (error) {
      toast({
        title: 'Erro no export',
        description: 'Não foi possível exportar os logs.',
        variant: 'destructive',
      });
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary icon-glow" />
          Logs de Acesso
        </h1>
        <p className="text-muted-foreground mt-1">
          Histórico completo de movimentações de recursos
        </p>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuário ou recurso..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filters.action || undefined} onValueChange={(value) => handleFilterChange('action', value || '')}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as ações" />
              </SelectTrigger>
              <SelectContent>
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

            <div className="flex gap-2">
              <Button variant="outline" onClick={clearFilters} size="sm">
                Limpar
              </Button>
              <Button onClick={exportCSV} size="sm" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="card-hover">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Registros de Acesso ({totalCount} total)
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Atualizado automaticamente
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum log encontrado com os filtros aplicados</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Recurso</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Observações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {log.user_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          {log.resource_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.resource_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ACTION_LABELS[log.action as keyof typeof ACTION_LABELS]?.variant || 'default'}>
                          {ACTION_LABELS[log.action as keyof typeof ACTION_LABELS]?.label || log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={log.notes}>
                        {log.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
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
                      Anterior
                    </Button>
                    <div className="text-sm">
                      Página {currentPage} de {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Próxima
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