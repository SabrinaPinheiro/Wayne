import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
const logoWayne = '/logo-wayne.png';
const logoBatman = '/logo-batman.png';

export const AuthError = () => {
  const [searchParams] = useSearchParams();
  const [errorType, setErrorType] = useState<string>('unknown');
  const [errorDescription, setErrorDescription] = useState<string>('');

  useEffect(() => {
    const error = searchParams.get('error') || 'unknown';
    const description = searchParams.get('error_description') || '';
    
    setErrorType(error);
    setErrorDescription(description);
  }, [searchParams]);

  const getErrorMessage = () => {
    switch (errorType) {
      case 'access_denied':
        return {
          title: 'Acesso Negado',
          message: 'Você cancelou o processo de autenticação ou não tem permissão para acessar.',
          suggestions: ['Tente fazer login novamente', 'Verifique suas credenciais']
        };
      case 'invalid_request':
        return {
          title: 'Solicitação Inválida',
          message: 'Houve um problema com a solicitação de autenticação.',
          suggestions: ['Tente acessar o sistema através da página inicial', 'Limpe o cache do navegador']
        };
      case 'server_error':
        return {
          title: 'Erro do Servidor',
          message: 'Ocorreu um erro interno no servidor de autenticação.',
          suggestions: ['Tente novamente em alguns minutos', 'Entre em contato com o suporte se o problema persistir']
        };
      case 'temporarily_unavailable':
        return {
          title: 'Serviço Temporariamente Indisponível',
          message: 'O serviço de autenticação está temporariamente indisponível.',
          suggestions: ['Tente novamente em alguns minutos', 'Verifique sua conexão com a internet']
        };
      case 'email_not_confirmed':
        return {
          title: 'Email Não Confirmado',
          message: 'Você precisa confirmar seu email antes de fazer login.',
          suggestions: ['Verifique sua caixa de entrada', 'Clique no link de confirmação enviado por email']
        };
      case 'invalid_credentials':
        return {
          title: 'Credenciais Inválidas',
          message: 'Email ou senha incorretos.',
          suggestions: ['Verifique seu email e senha', 'Use a opção "Esqueci minha senha" se necessário']
        };
      default:
        return {
          title: 'Erro de Autenticação',
          message: errorDescription || 'Ocorreu um erro durante o processo de autenticação.',
          suggestions: ['Tente fazer login novamente', 'Verifique sua conexão com a internet']
        };
    }
  };

  const { title, message, suggestions } = getErrorMessage();

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
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/20">
                <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <CardTitle className="text-center">{title}</CardTitle>
            <CardDescription className="text-center">
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            <div className="space-y-4">
              {suggestions.length > 0 && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-sm">O que você pode fazer:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Link to="/login">
                  <Button className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Tentar Novamente
                  </Button>
                </Link>
                
                {errorType === 'email_not_confirmed' && (
                  <Link to="/register">
                    <Button variant="outline" className="w-full">
                      Reenviar Email de Confirmação
                    </Button>
                  </Link>
                )}
                
                {(errorType === 'invalid_credentials' || errorType === 'access_denied') && (
                  <Link to="/forgot-password">
                    <Button variant="outline" className="w-full">
                      Esqueci Minha Senha
                    </Button>
                  </Link>
                )}

                <div className="text-center mt-4">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar ao Login
                  </Link>
                </div>
              </div>

              {errorDescription && (
                <details className="mt-4">
                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-primary">
                    Detalhes técnicos
                  </summary>
                  <div className="mt-2 p-2 bg-muted/30 rounded text-xs font-mono text-muted-foreground">
                    Error: {errorType}
                    {errorDescription && <><br />Description: {errorDescription}</>}
                  </div>
                </details>
              )}
            </div>
          </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};