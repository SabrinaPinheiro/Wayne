import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Menu,
  Home,
  Users,
  Package,
  FileText,
  Settings,
  User,
  Shield,
  LogOut,
  Bell,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
const logoBatman = '/logo-batman.png';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  requiresAuth?: boolean;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    requiresAuth: true,
  },
  {
    title: 'Usuários',
    href: '/users',
    icon: Users,
    requiresAuth: true,
  },
  {
    title: 'Recursos',
    href: '/resources',
    icon: Package,
    requiresAuth: true,
  },
  {
    title: 'Relatórios',
    href: '/reports',
    icon: FileText,
    requiresAuth: true,
  },
  {
    title: 'Logs de Acesso',
    href: '/access-logs',
    icon: Shield,
    badge: 'Novo',
    requiresAuth: true,
  },
  {
    title: 'Funcionários',
    href: '/employee',
    icon: User,
    requiresAuth: true,
  },
];

interface MobileNavProps {
  className?: string;
}

export const MobileNav: React.FC<MobileNavProps> = ({ className }) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [open, setOpen] = React.useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setOpen(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const filteredNavItems = navItems.filter(
    (item) => !item.requiresAuth || user
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'md:hidden h-9 w-9 p-0',
            className
          )}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu de navegação</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle className="text-left">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">W</span>
              </div>
              <span>Wayne Industries</span>
            </div>
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full py-6">
          {/* User Info */}
          {user && (
            <div className="mb-6">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Usuário ativo
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="flex-1 space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          {user && (
            <div className="space-y-2 pt-4 border-t">
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === '/profile'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <User className="h-5 w-5" />
                <span>Perfil</span>
              </Link>
              
              <Separator className="my-2" />
              
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full justify-start space-x-3 px-3 py-2 h-auto text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-5 w-5" />
                <span>Sair</span>
              </Button>
              
              {/* Batman Logo */}
              <div className="flex justify-center pt-4 mt-4 border-t">
                <img 
                  src={logoBatman}
                  alt="Batman Logo" 
                  className="h-16 w-16 object-contain opacity-90"
                />
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Hook para detectar se é mobile
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

// Componente de navegação responsiva
interface ResponsiveNavProps {
  children: React.ReactNode;
  mobileNav?: React.ReactNode;
  className?: string;
}

export const ResponsiveNav: React.FC<ResponsiveNavProps> = ({
  children,
  mobileNav,
  className,
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn('flex items-center', className)}>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-4">
        {children}
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden">
        {mobileNav || <MobileNav />}
      </div>
    </div>
  );
};

export default MobileNav;