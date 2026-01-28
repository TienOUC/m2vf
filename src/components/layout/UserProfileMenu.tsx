'use client';

import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { useUIStore } from '@/lib/stores/uiStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

interface UserProfileMenuProps {
  size?: 'sm' | 'md';
  variant?: 'navbar' | 'sidebar';
}

export default function UserProfileMenu({ size = 'sm', variant = 'navbar' }: UserProfileMenuProps) {
  const { isDarkMode } = useUIStore((state) => ({ isDarkMode: state.isDarkMode }));
  const { user, isAuthenticated, logout } = useAuthStore();
  
  // 根据变体和尺寸设置样式
  const getAvatarStyles = () => {
    if (variant === 'navbar') {
      return {
        avatar: 'w-6 h-6 border-none ring-0',
        fallback: 'flex items-center justify-center text-xs font-medium text-neutral-900',
        button: cn(
          "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
          isDarkMode 
            ? "bg-neutral-800 hover:bg-neutral-700"
            : "bg-neutral-100 hover:bg-neutral-200"
        ),
        menu: 'w-64 p-0',
        menuPosition: ''
      };
    } else { // sidebar
      return {
        avatar: 'w-10 h-10 border-none ring-0',
        fallback: 'flex items-center justify-center text-sm font-semibold text-neutral-900',
        button: 'rounded-full bg-gray-200 hover:bg-gray-300 shadow-md flex items-center justify-center w-10 h-10 transition',
        menu: 'w-48 bg-background rounded-lg shadow-lg py-1 z-20 transition-all duration-200 transform origin-left',
        menuPosition: 'absolute left-full ml-3 top-1/2 -translate-y-1/2'
      };
    }
  };
  
  const styles = getAvatarStyles();
  
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className={cn(
            "px-4 py-2 text-[13px] font-medium rounded-xl transition-all",
            isDarkMode
              ? "text-neutral-300 hover:text-white hover:bg-neutral-800"
              : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
          )}
        >
          登录
        </Link>
        <Link
          href="/register"
          className={cn(
            "px-4 py-2 text-[13px] font-medium rounded-xl transition-all",
            isDarkMode
              ? "bg-white text-black hover:bg-neutral-200"
              : "bg-neutral-900 text-white hover:bg-neutral-800"
          )}
        >
          注册
        </Link>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
  };

  const avatarSize = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const fontSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(styles.button, "focus:outline-none focus:ring-0 focus:ring-offset-0")}
        >
          <Avatar className={cn(styles.avatar, "focus:outline-none focus:ring-0 focus:ring-offset-0")}>
            <AvatarFallback className={styles.fallback}>
              {((user.nickname || user.username || user.name)[0]).toUpperCase()}
            </AvatarFallback>
            <AvatarImage src={user.avatar || ''} alt={user.nickname || user.username || user.name } className="transition-opacity duration-300" />
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className={variant === 'sidebar' ? 'w-48 bg-background rounded-lg shadow-lg py-1 z-20' : styles.menu}
        side={variant === 'sidebar' ? 'right' : 'bottom'}
        align={variant === 'sidebar' ? 'center' : 'end'}
        sideOffset={12}
      >
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Avatar className="w-10 h-10 border-none ring-0">
                <AvatarFallback className="flex items-center justify-center text-sm font-medium text-neutral-900">
                  {((user.nickname || user.username || user.name )[0]).toUpperCase()}
                </AvatarFallback>
                <AvatarImage src={user.avatar || ''} alt={user.nickname || user.username || user.name } className="transition-opacity duration-300" />
              </Avatar>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {user.nickname || user.username || user.name }
              </span>
              <span className="text-xs text-muted-foreground">
                {user.email || user.phone || '未设置'}
              </span>
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          className={cn(
            "w-full text-left px-4 py-2 text-sm transition-all",
            isDarkMode
              ? "text-red-400 hover:text-red-300 hover:bg-red-900/20"
              : "text-red-500 hover:text-red-600 hover:bg-red-50"
          )}
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
