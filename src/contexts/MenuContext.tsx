'use client';

import { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';

interface MenuContextType {
  activeMenuId: string | null;
  setActiveMenuId: (menuId: string | null) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 监听全局鼠标移动，用于判断鼠标是否离开所有菜单和按钮区域
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <MenuContext.Provider value={{ activeMenuId, setActiveMenuId }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenuContext = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenuContext must be used within a MenuProvider');
  }
  return context;
};
