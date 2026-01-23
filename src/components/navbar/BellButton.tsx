'use client';

import { Bell } from 'lucide-react';
import { useUIStore } from '@/lib/stores/uiStore';
import { cn } from '@/lib/utils';

export const BellButton = () => {
  const { isDarkMode } = useUIStore((state) => ({ isDarkMode: state.isDarkMode }));
  
  return (
    <button className={cn(
      "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
      isDarkMode 
        ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-300"
        : "bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-500 hover:text-neutral-700"
    )}>
      <Bell className="w-4 h-4" />
    </button>
  );
};
