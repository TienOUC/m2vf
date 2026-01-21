'use client';

import { ReactNode } from 'react';

interface SidebarButtonProps {
  icon: ReactNode;
  title: string;
  onClick: () => void;
  className?: string;
  animation?: 'rotate' | 'scale';
  selected?: boolean;
}

export default function SidebarButton({
  icon,
  title,
  onClick,
  className = '',
  animation = 'rotate',
  selected = false
}: SidebarButtonProps) {
  const animationClasses = {
    rotate: 'group-hover:rotate-45',
    scale: 'group-hover:scale-110'
  };

  return (
    <button
      className={`w-10 h-10 text-gray-700 hover:bg-gray-200 transition-colors flex items-center justify-center group rounded-full ${selected ? 'bg-blue-100' : ''} ${className}`}
      title={title}
      onClick={onClick}
    >
      <span
        className={`transform transition-transform duration-200 ${animationClasses[animation]}`}
      >
        {icon}
      </span>
    </button>
  );
}
