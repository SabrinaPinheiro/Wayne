import { User, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="h-16 border-b border-border bg-gradient-to-r from-card to-card/80 backdrop-blur-sm shadow-header">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-foreground hover:bg-accent/80 hover:scale-105 transition-all" />
          <span className="text-xl font-bold gradient-text">
            Wayne Industries
          </span>
        </div>

        <div className="flex items-center gap-4">
          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-3 text-foreground hover:bg-accent/80 hover:text-accent-foreground transition-all hover:scale-105 h-12 px-4"
              >
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarImage src={profile?.avatar_url || ''} alt="Avatar" />
                  <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-primary/20 to-primary/10">
                    {getInitials(profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <div className="font-semibold text-sm">
                    {profile?.full_name || 'Usuário'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {profile?.role === 'admin' ? 'Administrador' : 
                     profile?.role === 'gerente' ? 'Gerente' : 'Funcionário'}
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-64 p-2">
              <DropdownMenuItem 
                onClick={handleProfileClick} 
                className="cursor-pointer p-3 rounded-lg hover:bg-accent/80 transition-colors"
              >
                <User className="mr-3 h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Perfil</div>
                  <div className="text-xs text-muted-foreground">Gerencie suas informações</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem 
                onClick={signOut} 
                className="cursor-pointer p-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5" />
                <div>
                  <div className="font-medium">Sair</div>
                  <div className="text-xs">Encerrar sessão</div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};