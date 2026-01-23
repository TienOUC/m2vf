'use client';

import { usePathname } from 'next/navigation';
import { Logo } from '@/components/navbar/Logo';
import { NavMenu } from '@/components/navbar/NavMenu';
import { BellButton } from '@/components/navbar/BellButton';
import { ThemeToggle } from '@/components/navbar/ThemeToggle';
import { UserMenu } from '@/components/navbar/UserMenu';

// Main Navbar Component
interface NavbarProps {
  isLoggedIn?: boolean;
  username?: string;
}

export default function Navbar({ isLoggedIn = false, username = '' }: NavbarProps) {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/', label: '首页' },
    { href: '/projects', label: '项目空间' },
  ];
  
  return (
    <header className="w-full h-[70px] flex justify-between items-center px-20 box-border">
      <div className="flex justify-between items-center w-full max-w-[1440px] mx-auto">
        <div className="flex items-center gap-3">
          <Logo />
          <NavMenu navItems={navItems} currentPath={pathname} />
        </div>
        
        <div className="flex items-center gap-2.5">
          <BellButton />
          <ThemeToggle />
          <UserMenu isLoggedIn={isLoggedIn} username={username} />
        </div>
      </div>
    </header>
  );
}