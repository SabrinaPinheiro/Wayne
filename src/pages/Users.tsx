import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Users as UsersIcon, Shield, Clock, Search, Plus, Edit, Trash2, UserX, UserCheck, Loader2 } from 'lucide-react';

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
  const { profile, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'funcionario' as 'funcionario' | 'gerente' | 'admin'
  });

  // Check if current user can update roles (only admins)
  const canUpdateRole = profile?.role === 'admin';

  useEffect(() => {
    // Wait for auth to finish loading before checking permissions
    if (authLoading) return;
    
    // If auth is not loading but profile is still null, wait for profile to load
    // This prevents showing "Access denied" while profile is still being fetched
    if (!authLoading && profile === null) {
      console.log('🔄 [Users] Auth loaded but profile is null, waiting for profile...');
      return;
    }
    
    // Check if user is admin or manager
    if (profile?.role !== 'admin' && profile?.role !== 'gerente') {
      console.log('❌ [Users] Access denied for role:', profile?.role);
      toast({
        title: 'Acesso negado',
        description: 'Você não tem permissão para acessar esta página.',
        variant: 'destructive',
      });
      return;
    }

    console.log('✅ [Users] Access granted for role:', profile?.role);
    loadUsers();
  }, [profile, authLoading]);

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
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setUsers(users.map(user => 
        user.user_id === userId 
          ? { ...user, role: newRole, updated_at: new Date().toISOString() }
          : user
      ));

      toast({
        title: 'Sucesso',
        description: 'Papel do usuário atualizado com sucesso.',
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar papel do usuário.',
        variant: 'destructive',
      });
    }
  };

  const createUser = async () => {
    if (!newUserForm.email || !newUserForm.password || !newUserForm.full_name) {
      toast({
        title: 'Erro',
        description: 'Todos os campos são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUserForm.email,
        password: newUserForm.password,
        email_confirm: true
      });

      if (authError) throw authError;

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          full_name: newUserForm.full_name,
          role: newUserForm.role
        });

      if (profileError) throw profileError;

      toast({
        title: 'Sucesso',
        description: 'Usuário criado com sucesso.',
      });

      // Reset form and close modal
      setNewUserForm({
        email: '',
        password: '',
        full_name: '',
        role: 'funcionario'
      });
      setIsCreateModalOpen(false);
      
      // Reload users
      loadUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar usuário.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateUser = async () => {
    if (!editingUser || !editingUser.full_name) {
      toast({
        title: 'Erro',
        description: 'Nome completo é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Updating user:', editingUser);
      console.log('Current profile role:', profile?.role);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editingUser.full_name,
          role: editingUser.role,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', editingUser.user_id);

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Usuário atualizado com sucesso.',
      });

      setIsEditModalOpen(false);
      setEditingUser(null);
      loadUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar usuário.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteUser = async (userId: string, userEmail?: string) => {
    try {
      console.log('Deleting user:', userId);
      console.log('Current profile role:', profile?.role);
      
      // Com a migração CASCADE DELETE aplicada, quando excluirmos o usuário do auth,
      // todos os dados relacionados serão automaticamente removidos:
      // - profiles (CASCADE DELETE)
      // - access_logs (CASCADE DELETE) 
      // - alerts (CASCADE DELETE)
      // - user_settings (CASCADE DELETE)
      // - resources.created_by será definido como NULL (SET NULL)
      
      // Delete user from auth - isso irá automaticamente excluir todos os dados relacionados
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) {
        console.error('Auth delete error:', authError);
        throw authError;
      }

      toast({
        title: 'Usuário excluído com sucesso',
        description: 'O usuário e todos os seus dados relacionados foram removidos do sistema.',
      });

      loadUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Erro ao excluir usuário',
        description: error.message || 'Não foi possível excluir o usuário. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const toggleUserStatus = async (userId: string, currentRole: string) => {
    // For now, we'll use role to simulate active/inactive status
    // In a real app, you might have a separate 'active' field
    const newRole = currentRole === 'funcionario' ? 'gerente' : 'funcionario';
    await updateUserRole(userId, newRole as 'funcionario' | 'gerente' | 'admin');
  };

  // Filter users based on search and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = !search || 
      user.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Debug information
  console.log('👥 [Users Page] Current user profile:', profile);
  console.log('🔑 [Users Page] Profile role:', profile?.role);
  console.log('👤 [Users Page] Is admin?', profile?.role === 'admin');
  console.log('👨‍💼 [Users Page] Is gerente?', profile?.role === 'gerente');
  console.log('⏳ [Users Page] Profile loading?', !profile);
  console.log('🔄 [Users Page] Auth loading?', authLoading);

  // Show loading state while auth is loading OR while profile is being fetched
  if (authLoading || (!authLoading && profile === null)) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="w-full max-w-sm mx-4">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold mb-2">Carregando...</h2>
            <p className="text-muted-foreground">
              {authLoading ? 'Verificando autenticação...' : 'Carregando perfil do usuário...'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Only allow admins and managers to access this page
  if (profile?.role !== 'admin' && profile?.role !== 'gerente') {
    console.warn('🚫 [Users Page] Access denied for role:', profile?.role);
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="w-full max-w-sm mx-4">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar o gerenciamento de usuários.
            </p>
            <div className="mt-4 text-xs text-muted-foreground">
              Papel atual: {profile?.role || 'Não definido'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('✅ [Users Page] Access granted for role:', profile?.role);

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <UsersIcon className="h-8 w-8 text-primary" />
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
            <p className="text-muted-foreground">
              Gerencie usuários, papéis e permissões do sistema
            </p>
          </div>
        </div>
        {canUpdateRole && (
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md lg:max-w-lg">
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo usuário. Uma senha temporária será gerada.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})}
                    placeholder="usuario@wayne.app.br"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Senha Temporária</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({...newUserForm, password: e.target.value})}
                    placeholder="Senha temporária"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    value={newUserForm.full_name}
                    onChange={(e) => setNewUserForm({...newUserForm, full_name: e.target.value})}
                    placeholder="Nome completo do usuário"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Papel</Label>
                  <Select
                    value={newUserForm.role}
                    onValueChange={(value: 'funcionario' | 'gerente' | 'admin') => 
                      setNewUserForm({...newUserForm, role: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="funcionario">Funcionário</SelectItem>
                      <SelectItem value="gerente">Gerente</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button onClick={createUser} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Usuário
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 w-full" style={{maxWidth: '100%', overflow: 'hidden'}}>
        <Card className="w-full min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium truncate">Total de Usuários</CardTitle>
            <UsersIcon className="h-5 w-5 text-muted-foreground icon-glow flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Usuários cadastrados no sistema
            </p>
          </CardContent>
        </Card>

        <Card className="w-full min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium truncate">Funcionários</CardTitle>
            <UserCheck className="h-5 w-5 text-success icon-glow flex-shrink-0" />
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

        <Card className="w-full min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium truncate">Gerentes</CardTitle>
            <Shield className="h-5 w-5 text-primary icon-glow flex-shrink-0" />
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

        <Card className="w-full min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium truncate">Administradores</CardTitle>
            <Shield className="h-5 w-5 text-warning icon-glow flex-shrink-0" />
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
      <Card className="w-full min-w-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5 flex-shrink-0" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-2 w-full" style={{maxWidth: '100%', overflow: 'hidden'}}>
            <div className="relative w-full min-w-0">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            <Select value={roleFilter || undefined} onValueChange={(value) => setRoleFilter(value || '')}>
              <SelectTrigger className="w-full">
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
      <Card className="w-full min-w-0">
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
              <div className="block md:hidden space-y-3 w-full">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="p-4 w-full min-w-0">
                    <div className="flex items-start gap-3 w-full min-w-0">
                      <div className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0',
                        ROLE_LABELS[user.role].color
                      )}>
                        {user.full_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex items-center justify-between mb-2 gap-2 w-full">
                          <h3 className="font-medium text-sm truncate flex-1 min-w-0">
                            {user.full_name || 'Usuário sem nome'}
                          </h3>
                          <Badge variant={ROLE_LABELS[user.role].variant} className="text-xs flex-shrink-0">
                            {ROLE_LABELS[user.role].label}
                          </Badge>
                        </div>
                        
                        {/* Datas - Criado em e Atualizado em */}
                        <div className="space-y-1 mb-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">Criado: {format(new Date(user.created_at), 'dd/MM/yy', { locale: ptBR })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">Atualizado: {format(new Date(user.updated_at), 'dd/MM/yy', { locale: ptBR })}</span>
                          </div>
                        </div>

                        {/* Seletor de papel para admin */}
                        {profile?.role === 'admin' && (
                          <div className="mb-3">
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
                          </div>
                        )}

                        {/* Botões de ação para admin */}
                        {canUpdateRole && (
                          <div className="flex items-center gap-2 pt-2 border-t border-border">
                            <Dialog open={isEditModalOpen && editingUser?.id === user.id} onOpenChange={(open) => {
                              if (!open) {
                                setIsEditModalOpen(false);
                                setEditingUser(null);
                              }
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 h-8 text-xs"
                                  onClick={() => {
                                    setEditingUser(user);
                                    setIsEditModalOpen(true);
                                  }}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Editar
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-sm">
                                <DialogHeader>
                                  <DialogTitle>Editar Usuário</DialogTitle>
                                  <DialogDescription>
                                    Altere os dados do usuário selecionado.
                                  </DialogDescription>
                                </DialogHeader>
                                {editingUser && (
                                  <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit_full_name">Nome Completo</Label>
                                      <Input
                                        id="edit_full_name"
                                        value={editingUser.full_name}
                                        onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})}
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit_role">Papel</Label>
                                      <Select
                                        value={editingUser.role}
                                        onValueChange={(value: 'funcionario' | 'gerente' | 'admin') => 
                                          setEditingUser({...editingUser, role: value})
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="funcionario">Funcionário</SelectItem>
                                          <SelectItem value="gerente">Gerente</SelectItem>
                                          <SelectItem value="admin">Administrador</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                )}
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setIsEditModalOpen(false);
                                      setEditingUser(null);
                                    }}
                                    disabled={isSubmitting}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button onClick={updateUser} disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Salvar
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1 h-8 text-xs text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Excluir
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
                                  <AlertDialogDescription className="space-y-2">
                                    <p>
                                      Tem certeza que deseja excluir o usuário "{user.full_name}"?
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      <strong>Atenção:</strong> Esta ação irá remover permanentemente:
                                    </p>
                                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                      <li>Perfil do usuário</li>
                                      <li>Histórico de acessos</li>
                                      <li>Alertas e notificações</li>
                                      <li>Configurações pessoais</li>
                                    </ul>
                                    <p className="text-sm font-medium text-destructive">
                                      Esta ação não pode ser desfeita.
                                    </p>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteUser(user.user_id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              {/* Desktop Table */}
              <div className="hidden md:block w-full overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]">Usuário</TableHead>
                      <TableHead className="w-[15%]">Papel</TableHead>
                      <TableHead className="hidden md:table-cell w-[20%]">Criado em</TableHead>
                      <TableHead className="hidden lg:table-cell w-[20%]">Atualizado em</TableHead>
                      {canUpdateRole && <TableHead className="w-[15%]">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium w-[30%]">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={cn(
                              'h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0',
                              ROLE_LABELS[user.role].color
                            )}>
                              {user.full_name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span className="truncate min-w-0">{user.full_name || 'Usuário sem nome'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="w-[15%]">
                          <Badge variant={ROLE_LABELS[user.role].variant} className="text-xs">
                            {ROLE_LABELS[user.role].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell w-[20%]">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">
                              {format(new Date(user.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell w-[20%]">
                          <div className="text-sm text-muted-foreground truncate">
                            {format(new Date(user.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </div>
                        </TableCell>
                        {canUpdateRole && (
                          <TableCell className="w-[15%]">
                            <div className="flex items-center gap-2">
                              <Dialog open={isEditModalOpen && editingUser?.id === user.id} onOpenChange={(open) => {
                                if (!open) {
                                  setIsEditModalOpen(false);
                                  setEditingUser(null);
                                }
                              }}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingUser(user);
                                      setIsEditModalOpen(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-sm">
                                  <DialogHeader>
                                    <DialogTitle>Editar Usuário</DialogTitle>
                                    <DialogDescription>
                                      Altere os dados do usuário selecionado.
                                    </DialogDescription>
                                  </DialogHeader>
                                  {editingUser && (
                                    <div className="grid gap-4 py-4">
                                      <div className="grid gap-2">
                                        <Label htmlFor="edit_full_name">Nome Completo</Label>
                                        <Input
                                          id="edit_full_name"
                                          value={editingUser.full_name}
                                          onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})}
                                        />
                                      </div>
                                      <div className="grid gap-2">
                                        <Label htmlFor="edit_role">Papel</Label>
                                        <Select
                                          value={editingUser.role}
                                          onValueChange={(value: 'funcionario' | 'gerente' | 'admin') => 
                                            setEditingUser({...editingUser, role: value})
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="funcionario">Funcionário</SelectItem>
                                            <SelectItem value="gerente">Gerente</SelectItem>
                                            <SelectItem value="admin">Administrador</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  )}
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setIsEditModalOpen(false);
                                        setEditingUser(null);
                                      }}
                                      disabled={isSubmitting}
                                    >
                                      Cancelar
                                    </Button>
                                    <Button onClick={updateUser} disabled={isSubmitting}>
                                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                      Salvar
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
                                    <AlertDialogDescription className="space-y-2">
                                      <p>
                                        Tem certeza que deseja excluir o usuário "{user.full_name}"?
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        <strong>Atenção:</strong> Esta ação irá remover permanentemente:
                                      </p>
                                      <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                        <li>Perfil do usuário</li>
                                        <li>Histórico de acessos</li>
                                        <li>Alertas e notificações</li>
                                        <li>Configurações pessoais</li>
                                      </ul>
                                      <p className="text-sm font-medium text-destructive">
                                        Esta ação não pode ser desfeita.
                                      </p>
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteUser(user.user_id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
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