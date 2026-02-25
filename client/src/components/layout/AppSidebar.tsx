import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  ListTodo,
  PlusCircle,
  Clock,
  CheckSquare,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const adminMenuItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Users', url: '/admin/users', icon: Users },
  { title: 'Reports', url: '/admin/reports', icon: BarChart3 },
  { title: 'Settings', url: '/admin/settings', icon: Settings },
];

const facultyMenuItems = [
  { title: 'Dashboard', url: '/faculty', icon: LayoutDashboard },
  { title: 'Tasks', url: '/faculty/tasks', icon: ListTodo },
  { title: 'Create Task', url: '/faculty/tasks/create', icon: PlusCircle },
  { title: 'Reports', url: '/faculty/reports', icon: BarChart3 },
];

const studentMenuItems = [
  { title: 'Dashboard', url: '/student', icon: LayoutDashboard },
  { title: 'My Tasks', url: '/student/tasks', icon: CheckSquare },
  { title: 'Time Reports', url: '/student/time-reports', icon: Clock },
];

export function AppSidebar() {
  const { user } = useAuth();
  const location = useLocation();

  const getMenuItems = () => {
    switch (user?.role) {
      case 'admin':
        return adminMenuItems;
      case 'faculty':
        return facultyMenuItems;
      case 'student':
        return studentMenuItems;
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
            <CheckSquare className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">TaskTracker</h1>
            <p className="text-xs text-muted-foreground">Action Item Manager</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="rounded-lg bg-sidebar-accent/50 p-4">
          <p className="text-xs font-medium text-muted-foreground">Need help?</p>
          <p className="text-xs text-muted-foreground mt-1">
            Check our documentation for guides and tutorials.
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
