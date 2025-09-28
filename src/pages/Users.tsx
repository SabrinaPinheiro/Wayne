import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <UsersIcon className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie usuários, papéis e permissões do sistema
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-500/20 rounded-full">
                <UsersIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Total de Usuários</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-500/20 rounded-full">
                <UserCheck className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.role === 'funcionario').length}
                </p>
                <p className="text-sm text-muted-foreground">Funcionários</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-500/20 rounded-full">
                <Shield className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.role === 'gerente').length}
                </p>
                <p className="text-sm text-muted-foreground">Gerentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-red-500/20 rounded-full">
                <Shield className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.role === 'admin').length}
                </p>
                <p className="text-sm text-muted-foreground">Administradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
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
      <Card className="card-hover">
        <CardHeader>
          <CardTitle>
            Lista de Usuários ({filteredUsers.length} de {users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
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
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Nome</TableHead>
                      <TableHead className="min-w-[100px]">Papel</TableHead>
                      <TableHead className="min-w-[130px]">Criado em</TableHead>
                      <TableHead className="min-w-[130px]">Última atualização</TableHead>
                      {profile?.role === 'admin' && <TableHead className="min-w-[120px]">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium max-w-[120px]">
                          <div className="flex items-center gap-2">
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
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span className="whitespace-nowrap">
                              {format(new Date(user.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground whitespace-nowrap">
                            {format(new Date(user.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </div>
                        </TableCell>
                        {profile?.role === 'admin' && (
                          <TableCell>
                            <Select
                              value={user.role}
                              onValueChange={(newRole: 'funcionario' | 'gerente' | 'admin') => 
                                updateUserRole(user.user_id, newRole)
                              }
                            >
                              <SelectTrigger className="w-32">
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};