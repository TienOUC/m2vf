'use client';

import { Sun, Moon } from 'lucide-react';
import { useUIStore } from '@/lib/stores/uiStore';
import { cn } from '@/lib/utils';

export const ThemeToggle = () => {
  const { isDarkMode, setIsDarkMode } = useUIStore((state) => ({
    isDarkMode: state.isDarkMode,
    setIsDarkMode: state.setIsDarkMode
  }));
  
  return (
    <button
      onClick={() => setIsDarkMode(!isDarkMode)}
      className={cn(
        "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
        isDarkMode 
          ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-300"
          : "bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-700"
      )}
      title={isDarkMode ? '切换到亮色模式' : '切换到暗色模式'}
    >
      {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
};
