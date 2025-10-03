import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16 py-6">
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-bold gradient-text">404</h1>
          <h2 className="text-2xl font-semibold">Página não encontrada</h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            A página que você está procurando não existe ou foi movida.
          </p>
          <a 
            href="/" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 underline transition-colors text-lg font-medium"
          >
            Voltar para a página inicial
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
