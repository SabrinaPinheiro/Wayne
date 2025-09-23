import { LayoutDashboard, Package, History, Settings, LogOut, User } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const menuItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Recursos',
    url: '/resources',
    icon: Package,
  },
  {
    title: 'Funcionário',
    url: '/employee',
    icon: User,
  },
  {
    title: 'Logs de Acesso',
    url: '/access-logs',
    icon: History,
  },
  {
    title: 'Configurações',
    url: '/settings',
    icon: Settings,
  },
];

export const AppSidebar = () => {
  const { state } = useSidebar();
  const { signOut } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  const getNavClassName = ({ isActive }: { isActive: boolean }) => {
    if (isActive) {
      return 'bg-primary text-primary-foreground font-medium shadow-sm sidebar-link active';
    }
    return 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground sidebar-link';
  };

  return (
    <Sidebar className={state === 'collapsed' ? 'w-14' : 'w-64'} collapsible="icon">
      <SidebarContent className="bg-sidebar border-r border-sidebar-border">
      <div className="p-4">
        <img 
          src="/src/assets/wayne-logo.png" 
          alt="Wayne Industries" 
          className="h-16 w-auto mx-auto"
        />
      </div>
        
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={getNavClassName}
                    >
                      <item.icon className="h-4 w-4" />
                      {state !== 'collapsed' && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Logout Button at Bottom */}
        <div className="mt-auto p-4">
          <SidebarMenuButton asChild className="w-full">
            <button
              onClick={signOut}
              className="flex items-center gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full p-2 rounded-md"
            >
              <LogOut className="h-4 w-4" />
              {state !== 'collapsed' && <span>Sair</span>}
            </button>
          </SidebarMenuButton>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};