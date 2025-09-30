import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AvatarUpload } from '@/components/AvatarUpload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Save, Mail, UserCircle } from 'lucide-react';

export const Profile = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null);

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'gerente':
        return 'Gerente';
      case 'funcionario':
        return 'Funcionário';
      default:
        return 'Funcionário';
    }
  };

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'gerente':
        return 'default';
      case 'funcionario':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const handleSave = async () => {
    if (!profile || !user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar o perfil. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFullName(profile?.full_name || '');
    setIsEditing(false);
  };

  const handleAvatarUpdate = (newAvatarUrl: string | null) => {
    setAvatarUrl(newAvatarUrl);
    // Refresh auth context to update profile
    window.location.reload();
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <User className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Avatar and Personal Information Section - Same row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Avatar Section */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-4">
              <div className="flex items-center space-x-2">
                <UserCircle className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Avatar</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <AvatarUpload
                  currentAvatarUrl={avatarUrl}
                  onAvatarUpdate={handleAvatarUpdate}
                  fallbackText={getInitials(profile?.full_name)}
                />
                <div className="text-center space-y-2">
                  <h3 className="font-medium">{profile?.full_name || 'Nome não informado'}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <Badge 
                    variant={getRoleBadgeVariant(profile?.role)}
                    className="font-medium"
                  >
                    {getRoleDisplayName(profile?.role)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">Informações Pessoais</CardTitle>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    {isLoading ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-1">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    O email não pode ser alterado pelo sistema
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Digite seu nome completo"
                    className={isEditing ? '' : 'bg-muted/30'}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Alert className="border-primary/20 bg-primary/5">
          <User className="h-4 w-4 text-primary" />
          <AlertDescription>
            <strong>Informação:</strong> Algumas informações como função e email são gerenciadas pelo administrador do sistema.
            Para alterações nestes campos, entre em contato com o administrador.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};