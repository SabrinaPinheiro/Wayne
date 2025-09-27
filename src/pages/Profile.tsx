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
import { User, Save, Mail } from 'lucide-react';

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
    <div className="container mx-auto py-8 px-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text">Meu Perfil</h1>
        <p className="text-muted-foreground text-lg">Gerencie suas informações pessoais</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Avatar Section */}
        <div className="lg:col-span-1">
          <Card className="card-enhanced">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Avatar</CardTitle>
              <CardDescription>Sua foto de perfil</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <AvatarUpload
                currentAvatarUrl={avatarUrl}
                onAvatarUpdate={handleAvatarUpdate}
                fallbackText={getInitials(profile?.full_name)}
              />
              <div className="text-center">
                <Badge 
                  variant={getRoleBadgeVariant(profile?.role)}
                  className="text-sm font-medium"
                >
                  {getRoleDisplayName(profile?.role)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Information Section */}
        <div className="lg:col-span-2">
          <Card className="card-enhanced">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <User className="h-6 w-6 icon-glow" />
                    Informações Pessoais
                  </CardTitle>
                  <CardDescription>
                    Suas informações básicas de perfil
                  </CardDescription>
                </div>
                {!isEditing && (
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(true)}
                    className="hover:glow-effect"
                    size="lg"
                  >
                    Editar Perfil
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="email" className="flex items-center gap-2 text-base font-semibold">
                    <Mail className="h-5 w-5 text-primary" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted/50 h-12 text-base"
                  />
                  <p className="text-sm text-muted-foreground">
                    O email não pode ser alterado pelo sistema
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="fullName" className="text-base font-semibold">Nome Completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Digite seu nome completo"
                    className={`h-12 text-base transition-all ${
                      isEditing 
                        ? 'border-primary/50 focus:border-primary focus:ring-primary/20' 
                        : 'bg-muted/30'
                    }`}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-6 border-t">
                  <Button 
                    onClick={handleSave} 
                    disabled={isLoading}
                    className="flex items-center gap-2 glow-effect"
                    size="lg"
                  >
                    <Save className="h-5 w-5" />
                    {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={isLoading}
                    size="lg"
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Alert className="mt-8 border-primary/20 bg-primary/5">
        <User className="h-5 w-5 text-primary" />
        <AlertDescription className="text-base">
          <strong>Informação:</strong> Algumas informações como função e email são gerenciadas pelo administrador do sistema.
          Para alterações nestes campos, entre em contato com o administrador.
        </AlertDescription>
      </Alert>
    </div>
  );
};