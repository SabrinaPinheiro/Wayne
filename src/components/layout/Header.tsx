import { User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate, Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { NotificationBell } from './NotificationBell';
import symbolWayne from '@/assets/symbol-wayne.png';

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
    <header className="h-16 border-b border-gotham-gold/20 bg-gradient-to-r from-gotham-gray to-gotham-black backdrop-blur-sm shadow-header">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-gotham-white hover:bg-gotham-gold/20 hover:scale-105 transition-all" />
          <Link 
            to="/dashboard" 
            className="text-xl font-bold gradient-text hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-2"
          >
            <img 
              src={symbolWayne} 
              alt="Wayne Industries Symbol" 
              className="w-8 h-8 object-contain"
            />
            Wayne Industries
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-3 text-gotham-white hover:bg-gotham-gold/20 hover:text-gotham-black transition-all hover:scale-105 h-12 px-4"
              >
                <Avatar className="h-10 w-10 border-2 border-gotham-gold/30">
                  <AvatarImage src={profile?.avatar_url || ''} alt="Avatar" />
                  <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-gotham-gold/20 to-gotham-gold/10 text-gotham-white">
                    {getInitials(profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <div className="font-semibold text-sm">
                    {profile?.full_name || 'Usuário'}
                  </div>
                  <div className="text-xs text-gotham-light">
                    {profile?.role === 'admin' ? 'Administrador' : 
                     profile?.role === 'gerente' ? 'Gerente' : 'Funcionário'}
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-64 p-2 bg-gotham-gray border-gotham-gold/20">
              <DropdownMenuItem 
                onClick={handleProfileClick} 
                className="cursor-pointer p-3 rounded-lg hover:bg-gotham-gold/20 transition-colors text-gotham-white"
              >
                <User className="mr-3 h-5 w-5 text-gotham-gold" />
                <div>
                  <div className="font-medium">Perfil</div>
                  <div className="text-xs text-gotham-light">Gerencie suas informações</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate('/settings')} 
                className="cursor-pointer p-3 rounded-lg hover:bg-gotham-gold/20 transition-colors text-gotham-white"
              >
                <Settings className="mr-3 h-5 w-5 text-gotham-gold" />
                <div>
                  <div className="font-medium">Configurações</div>
                  <div className="text-xs text-gotham-light">Ajustes do sistema</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2 border-gotham-gold/20" />
              <DropdownMenuItem 
                onClick={signOut} 
                className="cursor-pointer p-3 rounded-lg text-danger hover:bg-danger/10 transition-colors"
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