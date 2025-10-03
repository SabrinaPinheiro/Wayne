import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16 py-6">
        <div className="text-center space-y-8">
          {/* Logo Wayne Industries */}
          <div className="flex justify-center mb-8">
            <img 
              src="/logo-wayne.png" 
              alt="Wayne Industries" 
              className="h-16 w-auto sm:h-20 md:h-24 lg:h-28 object-contain"
            />
          </div>
          
          {/* Título 404 */}
          <div className="space-y-4">
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold gradient-text">404</h1>
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">Página não encontrada</h2>
          </div>
          
          {/* Mensagem de erro */}
          <div className="space-y-4">
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              A página que você está procurando não existe ou foi movida.
            </p>
            <p className="text-sm text-muted-foreground/80">
              Rota solicitada: <code className="bg-muted px-2 py-1 rounded text-xs">{location.pathname}</code>
            </p>
          </div>
          
          {/* Botão de retorno */}
          <div className="pt-4">
            <Button 
              onClick={() => window.location.href = "/"} 
              className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium"
              size="lg"
            >
              <Home className="h-5 w-5" />
              Voltar para a página inicial
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
