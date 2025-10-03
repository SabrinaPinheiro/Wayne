import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
const logoWayne = '/logo-wayne.png';
const logoBatman = '/logo-batman.png';

export const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await resetPassword(email);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar email',
        description: 'Não foi possível enviar o email de recuperação. Tente novamente.',
      });
    } else {
      setEmailSent(true);
      toast({
        title: 'Email enviado!',
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Coluna esquerda - Logo Batman */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gotham-gold via-yellow-600 to-amber-700 items-center justify-center p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gotham-gold/90 via-yellow-500/80 to-amber-600/90"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,215,0,0.3),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,193,7,0.2),transparent_50%)]"></div>
          <div className="text-center relative z-10 mx-[25%]">
            <img 
              src={logoBatman} 
              alt="Batman Logo" 
              className="h-48 w-auto mx-auto mb-6 opacity-90 hover:opacity-100 transition-opacity duration-300 drop-shadow-2xl"
            />
            <h2 className="text-3xl font-bold text-gotham-black mb-3 drop-shadow-lg">Wayne Industries</h2>
            <p className="text-gotham-black/80 font-medium text-lg">Sistema de Gestão de Recursos</p>
          </div>
        </div>

        {/* Coluna direita - Conteúdo */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 md:px-24 lg:px-32 xl:px-40 py-6">
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
                <CardTitle>Esqueci minha senha</CardTitle>
                <CardDescription>
                  {emailSent 
                    ? 'Email de recuperação enviado com sucesso!'
                    : 'Digite seu email para receber um link de recuperação'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6">
                {emailSent ? (
                  <div className="space-y-4 text-center">
                    <div className="flex justify-center">
                      <div className="rounded-full bg-primary/10 p-3">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Enviamos um link de recuperação para:
                      </p>
                      <p className="font-medium">{email}</p>
                      <p className="text-sm text-muted-foreground">
                        Verifique sua caixa de entrada e spam. O link expira em 1 hora.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => setEmailSent(false)}
                        variant="outline"
                        disabled={isLoading}
                      >
                        Tentar outro email
                      </Button>
                      <Link to="/login">
                        <Button variant="ghost" className="w-full">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Voltar ao Login
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enviar Link de Recuperação
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
      </div>
    </div>
  );
};