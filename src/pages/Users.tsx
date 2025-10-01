import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users as UsersIcon, Search, Shield, Clock, UserCheck, UserX } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  role: 'funcionario' | 'gerente' | 'admin';
  created_at: string;
  updated_at: string;
}

const ROLE_LABELS = {
  funcionario: { label: 'Funcionário', variant: 'secondary' as const, color: 'bg-blue-500' },
  gerente: { label: 'Gerente', variant: 'default' as const, color: 'bg-purple-500' },
  admin: { label: 'Administrador', variant: 'destructive' as const, color: 'bg-red-500' },
};

export const Users = () => {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Check if current user can update roles (only admins)
  const canUpdateRole = profile?.role === 'admin';

  useEffect(() => {
    // Check if user is admin or manager
    if (profile?.role !== 'admin' && profile?.role !== 'gerente') {
      toast({
        title: 'Acesso negado',
        description: 'Você não tem permissão para acessar esta página.',
        variant: 'destructive',
      });
      return;
    }

    loadUsers();
  }, [profile]);

  const loadUsers = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading users:', error);
        toast({
          title: 'Erro ao carregar usuários',
          description: 'Não foi possível carregar a lista de usuários.',
          variant: 'destructive',
        });
        return;
      }

      setUsers((data || []).map(item => ({
        ...item,
        role: item.role as 'funcionario' | 'gerente' | 'admin'
      })));
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'funcionario' | 'gerente' | 'admin') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        toast({
          title: 'Erro ao atualizar papel',
          description: 'Não foi possível atualizar o papel do usuário.',
          variant: 'destructive',
        });
        return;
      }

      // Update local state
      setUsers(prev => prev.map(user => 
        user.user_id === userId 
          ? { ...user, role: newRole }
          : user
      ));

      toast({
        title: 'Papel atualizado',
        description: 'O papel do usuário foi atualizado com sucesso.',
      });
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  // Filter users based on search and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = !search || 
      user.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Only allow admins and managers to access this page
  if (profile?.role !== 'admin' && profile?.role !== 'gerente') {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar o gerenciamento de usuários.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <UsersIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie usuários, papéis e permissões do sistema
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <UsersIcon className="h-5 w-5 text-muted-foreground icon-glow" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Usuários cadastrados no sistema
            </p>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Funcionários</CardTitle>
            <UserCheck className="h-5 w-5 text-success icon-glow" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {users.filter(u => u.role === 'funcionario').length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Usuários com papel de funcionário
            </p>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Gerentes</CardTitle>
            <Shield className="h-5 w-5 text-primary icon-glow" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {users.filter(u => u.role === 'gerente').length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Usuários com papel de gerente
            </p>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-5 w-5 text-warning icon-glow" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Usuários com papel de administrador
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="stats-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={roleFilter || undefined} onValueChange={(value) => setRoleFilter(value || '')}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os papéis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="funcionario">Funcionário</SelectItem>
                <SelectItem value="gerente">Gerente</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="stats-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            Lista de Usuários ({filteredUsers.length} de {users.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UsersIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum usuário encontrado com os filtros aplicados</p>
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="block sm:hidden space-y-3">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0',
                        ROLE_LABELS[user.role].color
                      )}>
                        {user.full_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <h3 className="font-medium text-sm truncate flex-1">
                            {user.full_name || 'Usuário sem nome'}
                          </h3>
                          <Badge variant={ROLE_LABELS[user.role].variant} className="text-xs flex-shrink-0">
                            {ROLE_LABELS[user.role].label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{format(new Date(user.created_at), 'dd/MM/yy', { locale: ptBR })}</span>
                        </div>
                        {profile?.role === 'admin' && (
                          <Select
                            value={user.role}
                            onValueChange={(newRole: 'funcionario' | 'gerente' | 'admin') => 
                              updateUserRole(user.user_id, newRole)
                            }
                          >
                            <SelectTrigger className="w-full h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="funcionario">Funcionário</SelectItem>
                              <SelectItem value="gerente">Gerente</SelectItem>
                              <SelectItem value="admin">Administrador</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto -mx-6 px-6">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Usuário</TableHead>
                      <TableHead className="w-[140px]">Cargo</TableHead>
                      <TableHead className="hidden md:table-cell w-[180px]">Data de Criação</TableHead>
                      <TableHead className="hidden lg:table-cell w-[180px]">Última Atualização</TableHead>
                      {canUpdateRole && <TableHead className="w-[160px]">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0',
                              ROLE_LABELS[user.role].color
                            )}>
                              {user.full_name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span className="truncate">{user.full_name || 'Usuário sem nome'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={ROLE_LABELS[user.role].variant} className="text-xs">
                            {ROLE_LABELS[user.role].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">
                              {format(new Date(user.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="text-sm text-muted-foreground truncate">
                            {format(new Date(user.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </div>
                        </TableCell>
                        {canUpdateRole && (
                          <TableCell>
                            <Select
                              value={user.role}
                              onValueChange={(newRole: 'funcionario' | 'gerente' | 'admin') => 
                                updateUserRole(user.user_id, newRole)
                              }
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="funcionario">Funcionário</SelectItem>
                                <SelectItem value="gerente">Gerente</SelectItem>
                                <SelectItem value="admin">Administrador</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;