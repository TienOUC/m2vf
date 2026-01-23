'use client';

import { NavItem } from './NavItem';

interface NavMenuProps {
  navItems: Array<{ href: string; label: string }>;
  currentPath: string;
}

export const NavMenu = ({ navItems, currentPath }: NavMenuProps) => {
  return (
    <nav className="flex items-center gap-1 ml-6">
      {navItems.map((item) => (
        <NavItem
          key={item.href}
          href={item.href}
          label={item.label}
          isActive={currentPath === item.href || (item.href === '/projects' && currentPath.startsWith('/projects'))}
        />
      ))}
    </nav>
  );
};
