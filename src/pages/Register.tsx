import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
const logoWayne = '/logo-wayne.png';

export const Register = () => {
  const { user, signUp, loading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Erro na confirmação',
        description: 'As senhas não coincidem.',
      });
      return;
    }

    if (registerForm.password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Senha muito fraca',
        description: 'A senha deve ter pelo menos 6 caracteres.',
      });
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(registerForm.email, registerForm.password, registerForm.fullName);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro no cadastro',
        description: error.message === 'User already registered' 
          ? 'Este email já está registrado.' 
          : 'Erro ao criar conta. Tente novamente.',
      });
    } else {
      toast({
        title: 'Conta criada com sucesso!',
        description: 'Verifique seu email para confirmar sua conta.',
      });
    }

    setIsLoading(false);
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
            className="h-48 w-auto mx-auto mb-6 opacity-90 hover:opacity-100 transition-opacity duration-300 drop-shadow-2xl"
          />
          <h2 className="text-3xl font-bold text-gotham-black mb-3 drop-shadow-lg">Wayne Industries</h2>
          <p className="text-gotham-black/80 font-medium text-lg">Sistema de Gestão de Recursos</p>
        </div>
      </div>

      {/* Right Column - Register Form */}
      <div className="flex-1 flex items-center justify-center px-6 md:px-24 lg:px-32 xl:px-40 py-6 lg:py-8">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <img 
              src={logoWayne} 
              alt="Wayne Industries" 
              className="h-24 w-auto mx-auto mb-4 icon-glow animate-pulse lg:h-20"
            />
            <p className="text-muted-foreground">Sistema de Gestão de Recursos</p>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Criar Conta</CardTitle>
              <CardDescription>
                Preencha os dados para criar sua conta no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={registerForm.fullName}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, fullName: e.target.value })
                  }
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={registerForm.email}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, email: e.target.value })
                  }
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, password: e.target.value })
                  }
                  required
                  minLength={6}
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, confirmPassword: e.target.value })
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
                  Criar Conta
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
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
};