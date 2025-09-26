import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import logoWayne from '@/assets/logo-wayne.png';

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
            <CardTitle>Confirmação de Conta</CardTitle>
            <CardDescription>
              {confirmationStatus === 'loading' && 'Verificando sua confirmação...'}
              {confirmationStatus === 'success' && 'Sua conta foi confirmada!'}
              {confirmationStatus === 'error' && 'Houve um problema na confirmação'}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
  );
};