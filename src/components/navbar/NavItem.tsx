'use client';

import Link from 'next/link';
import { useUIStore } from '@/lib/stores/uiStore';
import { cn } from '@/lib/utils';

interface NavItemProps {
  href: string;
  label: string;
  isActive: boolean;
}

export const NavItem = ({ href, label, isActive }: NavItemProps) => {
  const { isDarkMode } = useUIStore((state) => ({ isDarkMode: state.isDarkMode }));
  
  return (
    <Link
      href={href}
      className={cn(
        "px-4 py-2 text-[14px] font-medium rounded-lg transition-all relative",
        isActive
          ? isDarkMode 
            ? "text-white bg-neutral-800"
            : "text-neutral-900 bg-neutral-100"
          : isDarkMode
            ? "text-neutral-400 hover:text-white hover:bg-neutral-800"
            : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
      )}
    >
      {label}
    </Link>
  );
};
