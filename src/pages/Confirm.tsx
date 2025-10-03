import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
const logoWayne = '/logo-wayne.png';
const logoBatman = '/logo-batman.png';

export const Confirm = () => {
  const { verifyOtp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [confirmationStatus, setConfirmationStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const confirmEmail = async () => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');
      const type = searchParams.get('type') || 'signup';

      if (!token) {
        setConfirmationStatus('error');
        setIsLoading(false);
        toast({
          variant: 'destructive',
          title: 'Link inválido',
          description: 'Este link de confirmação é inválido ou expirou.',
        });
        return;
      }

      if (!email) {
        setConfirmationStatus('error');
        setIsLoading(false);
        toast({
          variant: 'destructive',
          title: 'Email não encontrado',
          description: 'Não foi possível identificar o email para confirmação.',
        });
        return;
      }

      const { error } = await verifyOtp(email, token, type);

      if (error) {
        setConfirmationStatus('error');
        toast({
          variant: 'destructive',
          title: 'Erro na confirmação',
          description: 'Não foi possível confirmar sua conta. O link pode ter expirado.',
        });
      } else {
        setConfirmationStatus('success');
        toast({
          title: 'Conta confirmada!',
          description: 'Sua conta foi confirmada com sucesso. Você já pode fazer login.',
        });
        
        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }

      setIsLoading(false);
    };

    confirmEmail();
  }, [searchParams, verifyOtp, toast, navigate]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <div className="space-y-2">
            <p className="font-medium">Confirmando sua conta...</p>
            <p className="text-sm text-muted-foreground">
              Aguarde enquanto verificamos sua confirmação.
            </p>
          </div>
        </div>
      );
    }

    if (confirmationStatus === 'success') {
      return (
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-green-600 dark:text-green-400">
              Conta confirmada com sucesso!
            </p>
            <p className="text-sm text-muted-foreground">
              Sua conta foi ativada. Você será redirecionado para o login em alguns segundos.
            </p>
          </div>
          <Link to="/login">
            <Button className="w-full">
              Fazer Login
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
            <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="font-medium text-red-600 dark:text-red-400">
            Erro na confirmação
          </p>
          <p className="text-sm text-muted-foreground">
            Este link pode ter expirado ou já foi usado. Tente fazer login ou criar uma nova conta.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Link to="/login">
            <Button className="w-full">
              Tentar Login
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="outline" className="w-full">
              Criar Nova Conta
            </Button>
          </Link>
        </div>
      </div>
    );
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
            <CardTitle>Confirmação de Conta</CardTitle>
            <CardDescription>
              {confirmationStatus === 'loading' && 'Verificando sua confirmação...'}
              {confirmationStatus === 'success' && 'Sua conta foi confirmada!'}
              {confirmationStatus === 'error' && 'Houve um problema na confirmação'}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            {renderContent()}
            
            {confirmationStatus === 'error' && (
              <div className="mt-4 text-center">
                <Link 
                  to="/login" 
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Login
                </Link>
              </div>
            )}
          </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};