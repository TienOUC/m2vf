'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Logo } from '@/components/navbar/Logo';
import { NavMenu } from '@/components/navbar/NavMenu';
import { BellButton } from '@/components/navbar/BellButton';
import { ThemeToggle } from '@/components/navbar/ThemeToggle';
import UserProfileMenu from '@/components/layout/UserProfileMenu';
import { useAuthStore } from '@/lib/stores/authStore';

// Main Navbar Component
export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, user, checkAuthStatus } = useAuthStore();
  
  // 初始化时检查认证状态
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);
  
  // 根据登录状态动态生成导航项
  const navItems = [
    { href: '/', label: '首页' },
    ...(isAuthenticated ? [{ href: '/projects', label: '项目空间' }] : []),
  ];
  
  return (
    <header className="w-full h-[70px] flex justify-between items-center px-6 md:px-12 lg:px-20 box-border">
      <div className="flex justify-between items-center w-full max-w-[1440px] mx-auto">
        <div className="flex items-center gap-3">
          <Logo />
          <NavMenu navItems={navItems} currentPath={pathname} />
        </div>
        
        <div className="flex items-center gap-2.5 transition-all duration-300">
          <BellButton />
          <ThemeToggle />
          <div className="transition-all duration-300 ease-in-out">
            <UserProfileMenu size="sm" variant="navbar" />
          </div>
        </div>
      </div>
    </header>
  );
}