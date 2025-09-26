import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import logoWayne from '@/assets/logo-wayne.png';

export const Login = () => {
  const { user, signIn, loading, createDemoUsers } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(loginForm.email, loginForm.password);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro no login',
        description: 'Email ou senha incorretos. Tente novamente.',
      });
    } else {
      toast({
        title: 'Login realizado',
        description: 'Bem-vindo ao sistema Wayne Industries!',
      });
    }

    setIsLoading(false);
  };

  const handleDemoLogin = async (userType: 'funcionario' | 'gerente' | 'admin') => {
    const demoCredentials = {
      funcionario: { email: 'funcionario@wayne.app.br', name: 'Funcionário' },
      gerente: { email: 'gerente@wayne.app.br', name: 'Gerente' },
      admin: { email: 'admin@wayne.app.br', name: 'Administrador' }
    };

    const { email, name } = demoCredentials[userType];
    
    setLoginForm({
      email,
      password: '123456',
    });

    setIsLoading(true);

    // First try to sign in
    let { error } = await signIn(email, '123456');

    // If user doesn't exist, create demo users and try again
    if (error && error.message?.includes('Invalid login credentials')) {
      toast({
        title: 'Criando usuários demo...',
        description: 'Aguarde enquanto configuramos os usuários de demonstração.',
      });

      // Create demo users
      const { error: createError } = await createDemoUsers();
      
      if (createError) {
        toast({
          variant: 'destructive',
          title: 'Erro ao criar usuários demo',
          description: 'Não foi possível criar os usuários de demonstração.',
        });
        setIsLoading(false);
        return;
      }

      // Try to sign in again after creating users
      setTimeout(async () => {
        const { error: retryError } = await signIn(email, '123456');
        
        if (retryError) {
          toast({
            variant: 'destructive',
            title: 'Erro no login demo',
            description: `Não foi possível fazer login como ${name} Demo.`,
          });
        } else {
          toast({
            title: 'Login demo realizado',
            description: `Bem-vindo ao sistema Wayne Industries como ${name}!`,
          });
        }
        setIsLoading(false);
      }, 2000);
    } else if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro no login demo',
        description: `Não foi possível fazer login como ${name} Demo.`,
      });
      setIsLoading(false);
    } else {
      toast({
        title: 'Login demo realizado',
        description: `Bem-vindo ao sistema Wayne Industries como ${name}!`,
      });
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src={logoWayne} 
            alt="Wayne Industries" 
            className="h-20 w-auto mx-auto mb-4"
          />
          <p className="text-muted-foreground">Sistema de Gestão de Recursos</p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Acesso ao Sistema</CardTitle>
            <CardDescription>
              Entre com suas credenciais ou use uma conta demo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Entrar
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">ou acesse como</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-green-500/30 text-green-600 hover:bg-green-50 hover:text-green-700 dark:border-green-500/30 dark:text-green-400 dark:hover:bg-green-950 dark:hover:text-green-300"
                      onClick={() => handleDemoLogin('funcionario')}
                      disabled={isLoading}
                    >
                      👨‍💼 Demo Funcionário
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-yellow-500/30 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 dark:border-yellow-500/30 dark:text-yellow-400 dark:hover:bg-yellow-950 dark:hover:text-yellow-300"
                      onClick={() => handleDemoLogin('gerente')}
                      disabled={isLoading}
                    >
                      👨‍💼 Demo Gerente
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-red-500/30 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                      onClick={() => handleDemoLogin('admin')}
                      disabled={isLoading}
                    >
                      🔐 Demo Administrador
                    </Button>
                  </div>
                </div>
              </form>

              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <Link 
                    to="/register" 
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    Criar conta
                  </Link>
                  <Link 
                    to="/forgot-password" 
                    className="text-muted-foreground hover:text-primary"
                  >
                    Esqueci minha senha
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};