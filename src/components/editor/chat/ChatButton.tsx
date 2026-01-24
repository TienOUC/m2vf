'use client'

import { Button } from '@/components/ui/button';

interface ChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export function ChatButton({ onClick, isOpen }: ChatButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed top-4 right-4 w-10 h-10 rounded-xl backdrop-blur-sm z-40 group bg-background/90 border border-border hover:bg-accent hover:text-accent-foreground p-0"
      aria-label={isOpen ? "关闭聊天面板" : "打开聊天面板"}
    >
      <svg 
        viewBox="0 0 24 24" 
        className="w-4 h-4 transition-colors text-muted-foreground group-hover:text-accent-foreground" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3A7 7 0 0 0 12 2z" />
      </svg>
    </Button>
  );
}
