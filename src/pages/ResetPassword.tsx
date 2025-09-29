import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import logoWayne from '@/assets/logo-wayne.png';

export const ResetPassword = () => {
  const { updatePassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    // Verificar se há um token de reset na URL
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (!accessToken || !refreshToken) {
      toast({
        variant: 'destructive',
        title: 'Link inválido',
        description: 'Este link de recuperação é inválido ou expirou.',
      });
      navigate('/forgot-password');
    }
  }, [searchParams, navigate, toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.password !== passwordForm.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Erro na confirmação',
        description: 'As senhas não coincidem.',
      });
      return;
    }

    if (passwordForm.password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Senha muito fraca',
        description: 'A senha deve ter pelo menos 6 caracteres.',
      });
      return;
    }

    setIsLoading(true);

    const { error } = await updatePassword(passwordForm.password);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar senha',
        description: 'Não foi possível atualizar sua senha. Tente novamente.',
      });
    } else {
      setPasswordUpdated(true);
      toast({
        title: 'Senha atualizada!',
        description: 'Sua senha foi atualizada com sucesso.',
      });
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src={logoWayne} 
            alt="Wayne Industries" 
            className="h-32 w-auto mx-auto mb-4"
          />
          <p className="text-muted-foreground">Sistema de Gestão de Recursos</p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Redefinir Senha</CardTitle>
            <CardDescription>
              {passwordUpdated 
                ? 'Senha atualizada com sucesso!'
                : 'Digite sua nova senha'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {passwordUpdated ? (
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Senha atualizada com sucesso!</p>
                  <p className="text-sm text-muted-foreground">
                    Você será redirecionado para a tela de login em alguns segundos.
                  </p>
                </div>
                <Link to="/login">
                  <Button className="w-full">
                    Ir para Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <Label htmlFor="password">Nova Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={passwordForm.password}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, password: e.target.value })
                    }
                    required
                    minLength={6}
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    required
                    minLength={6}
                  />
                </div>
                
                <div className="space-y-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Atualizar Senha
                  </Button>

                  <div className="text-center">
                    <Link 
                      to="/login" 
                      className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Voltar ao Login
                    </Link>
                  </div>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};