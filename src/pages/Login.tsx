import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
const logoWayne = '/logo-wayne.png';

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
    <div className="min-h-screen flex bg-background">
      {/* Left Column - Batman Logo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gotham-gold via-yellow-600 to-amber-700 items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gotham-gold/90 via-yellow-500/80 to-amber-600/90"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,215,0,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,193,7,0.2),transparent_50%)]"></div>
        <div className="text-center relative z-10 mx-[25%]">
          <img 
            src="/logo-batman.png" 
            alt="Batman Logo" 
            className="h-64 w-auto mx-auto mb-8 opacity-90 hover:opacity-100 transition-opacity duration-300 drop-shadow-2xl"
          />
          <h2 className="text-3xl font-bold text-gotham-black mb-3 drop-shadow-lg">Wayne Industries</h2>
          <p className="text-gotham-black/80 font-medium text-lg">Protegendo Gotham através da tecnologia</p>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 md:px-24 lg:px-32 xl:px-40 py-6 lg:py-8">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
              <img 
                src={logoWayne} 
                alt="Wayne Industries" 
                className="h-24 w-auto mx-auto mb-4 icon-glow animate-pulse lg:h-20"
              />
            </Link>
            <p className="text-muted-foreground">Sistema de Gestão de Recursos</p>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Acesso ao Sistema</CardTitle>
              <CardDescription>
                Entre com suas credenciais ou use uma conta demo
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6">
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
                      className="w-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-700 hover:from-blue-500/30 hover:to-cyan-500/30 hover:border-blue-500/40"
                      onClick={() => handleDemoLogin('funcionario')}
                      disabled={isLoading}
                    >
                      👨‍💼 Demo Funcionário
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-700 hover:from-purple-500/30 hover:to-pink-500/30 hover:border-purple-500/40"
                      onClick={() => handleDemoLogin('gerente')}
                      disabled={isLoading}
                    >
                      👨‍💼 Demo Gerente
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/30 text-red-700 hover:from-red-500/30 hover:to-orange-500/30 hover:border-red-500/40"
                      onClick={() => handleDemoLogin('admin')}
                      disabled={isLoading}
                    >
                      🔐 Demo Administrador
                    </Button>
                  </div>
                </div>
              </form>

              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
                <div className="flex flex-col sm:flex-row justify-between gap-2 text-sm">
                  <Link 
                    to="/" 
                    className="text-muted-foreground hover:text-primary text-center sm:text-left"
                  >
                    ← Voltar ao site
                  </Link>
                  <Link 
                    to="/register" 
                    className="text-primary hover:text-primary/80 font-medium text-center hidden"
                  >
                    Criar conta
                  </Link>
                  <Link 
                    to="/forgot-password" 
                    className="text-muted-foreground hover:text-primary text-center sm:text-right"
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
    </div>
  );
};