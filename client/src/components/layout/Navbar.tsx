import { Search, LogOut, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';

interface Notification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      if (!user) {
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/notifications?userId=${user.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || 'Failed to load notifications.');
        }

        if (isMounted) {
          const notifs = data.notifications || [];
          setNotifications(notifs);
          setUnreadCount(notifs.filter((n: Notification) => !n.isRead).length);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [API_BASE_URL, user]);

  const handleMarkAllRead = async () => {
    if (!user) return;

    try {
      await fetch(`${API_BASE_URL}/api/notifications/mark-all-read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-primary/10 text-primary',
      faculty: 'bg-accent/10 text-accent',
      student: 'bg-success/10 text-success',
    };
    return colors[role as keyof typeof colors] || colors.student;
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-sm">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        <SidebarTrigger className="md:hidden" />
        
        <div className="hidden md:flex flex-1 items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-9 bg-secondary/50 border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-2 py-1.5">
                  <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="h-auto py-1 px-2 text-xs">
                      Mark all read
                    </Button>
                  )}
                </div>
                <DropdownMenuSeparator />
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <DropdownMenuItem key={notif.id} className={`flex-col items-start gap-1 py-3 ${!notif.isRead ? 'bg-accent/10' : ''}`}>
                        <p className="text-sm font-medium">{notif.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {user ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium">{user?.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${getRoleBadge(user?.role || 'student')}`}>
                    {user?.role?.charAt(0).toUpperCase()}{user?.role?.slice(1)}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
