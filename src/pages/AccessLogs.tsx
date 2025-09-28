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
      
      let query = supabase
        .from('access_logs')
        .select(`
          id,
          action,
          notes,
          timestamp,
          profiles!inner(full_name),
          resources!inner(name, type)
        `, { count: 'exact' })
        .order('timestamp', { ascending: false });

      // Apply filters
      if (filters.search) {
        query = query.or(`profiles.full_name.ilike.%${filters.search}%,resources.name.ilike.%${filters.search}%`);
      }

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

      if (error) throw error;

      const formattedLogs: AccessLog[] = (data || []).map((log: any) => ({
        id: log.id,
        user_name: log.profiles?.full_name || 'Usuário Desconhecido',
        resource_name: log.resources?.name || 'Recurso Desconhecido',
        resource_type: log.resources?.type || 'Tipo Desconhecido',
        action: log.action,
        notes: log.notes,
        timestamp: log.timestamp,
      }));

      setLogs(formattedLogs);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os logs de acesso.',
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
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
            <div className="space-y-4 p-6">
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
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">Data/Hora</TableHead>
                        <TableHead className="min-w-[100px]">Usuário</TableHead>
                        <TableHead className="min-w-[120px]">Recurso</TableHead>
                        <TableHead className="min-w-[80px]">Tipo</TableHead>
                        <TableHead className="min-w-[80px]">Ação</TableHead>
                        <TableHead className="min-w-[120px]">Observações</TableHead>
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