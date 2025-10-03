import { LayoutDashboard, Package, History, User, FileText } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
const logoWayne = '/logo-wayne.png';
const symbolWayne = '/symbol-wayne.png';
const logoBatman = '/logo-batman.png';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
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
    title: 'Portal Funcionário',
    url: '/employee',
    icon: User,
  },
  {
    title: 'Logs de Acesso',
    url: '/access-logs',
    icon: History,
  },
];

const adminMenuItems = [
  {
    title: 'Gerenciar Usuários',
    url: '/users',
    icon: User,
  },
  {
    title: 'Relatórios',
    url: '/reports',
    icon: FileText,
  },
];

export const AppSidebar = () => {
  const { state, setOpenMobile } = useSidebar();
  const { profile } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  // Show admin items only for admins and managers
  const canViewAdminItems = profile?.role === 'admin' || profile?.role === 'gerente';
  const allMenuItems = canViewAdminItems ? [...menuItems, ...adminMenuItems] : menuItems;

  // Handle mobile sidebar close on navigation
  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const getNavClassName = ({ isActive }: { isActive: boolean }) => {
    if (isActive) {
      return 'bg-primary text-primary-foreground font-medium shadow-sm sidebar-link active';
    }
    return 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground sidebar-link';
  };

  return (
    <Sidebar className={state === 'collapsed' ? 'w-16' : 'w-64'} collapsible="icon">
      <SidebarHeader className="p-4">
        <NavLink to="/dashboard" className="block">
          <img 
            src={state === 'collapsed' ? symbolWayne : logoWayne}
            alt="Wayne Industries" 
            className={state === 'collapsed' ? "h-8 w-auto mx-auto" : "h-16 w-auto mx-auto"}
          />
        </NavLink>
      </SidebarHeader>

      <SidebarContent className="bg-sidebar border-r border-sidebar-border">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {allMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={getNavClassName}
                      onClick={handleNavClick}
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
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex justify-center">
          <img 
            src={logoBatman}
            alt="Batman Logo" 
            className={state === 'collapsed' ? "h-32 w-32 object-contain" : "h-48 w-48 object-contain"}
          />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};