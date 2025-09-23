import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { NotificationBell } from './NotificationBell';

export const Header = () => {
  const { profile, signOut } = useAuth();

  return (
    <header className="h-16 border-b border-border bg-card shadow-sm">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-foreground hover:bg-accent" />
          <div className="flex items-center gap-3">
            <img 
              src="/src/assets/wayne-logo.png" 
              alt="Wayne Industries" 
              className="h-8 w-auto"
            />
            <span className="text-lg font-semibold text-foreground">
              Wayne Industries
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 text-foreground hover:bg-accent hover:text-accent-foreground">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {profile?.full_name || 'Usuário'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-sm font-medium text-popover-foreground">
                {profile?.full_name || 'Usuário'}
              </div>
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                {profile?.role === 'admin' ? 'Administrador' : 
                 profile?.role === 'gerente' ? 'Gerente' : 'Funcionário'}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};