'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Workflow, 
  LayoutDashboard, 
  Play, 
  History, 
  Settings, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Bell,
  Crown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Workflows', href: '/dashboard', icon: Workflow },
  { name: 'Executions', href: '/executions', icon: Play },
  { name: 'History', href: '/history', icon: History },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/auth/login' });
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="p-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Workflow className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">FlowForge</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 p-0"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-blue-50 text-blue-700 border border-blue-200" 
                  : "text-gray-700 hover:bg-gray-100",
                collapsed && "justify-center"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade Banner */}
      {!collapsed && session?.user?.subscription === 'free' && (
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Crown className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-blue-700 mb-3">
              Unlock unlimited workflows and advanced features
            </p>
            <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
              Upgrade Now
            </Button>
          </div>
        </div>
      )}

      {/* User Menu */}
      <div className="p-4 border-t border-gray-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className={cn(
                "w-full p-2 h-auto",
                collapsed ? "justify-center" : "justify-start"
              )}
            >
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || ''} />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {session?.user?.name ? getInitials(session.user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                    <p className="text-xs text-gray-500">{session?.user?.email}</p>
                  </div>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.image || ''} />
                <AvatarFallback className="bg-blue-600 text-white">
                  {session?.user?.name ? getInitials(session.user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{session?.user?.name}</p>
                <p className="text-xs text-gray-500">{session?.user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}