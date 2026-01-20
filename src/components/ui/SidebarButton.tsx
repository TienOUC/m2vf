'use client';

import { ReactNode } from 'react';

interface SidebarButtonProps {
  icon: ReactNode;
  title: string;
  onClick: () => void;
  className?: string;
  animation?: 'rotate' | 'scale';
}

export default function SidebarButton({
  icon,
  title,
  onClick,
  className = '',
  animation = 'rotate'
}: SidebarButtonProps) {
  const animationClasses = {
    rotate: 'group-hover:rotate-45',
    scale: 'group-hover:scale-110'
  };

  return (
    <button
      className={`p-3 text-gray-700 hover:bg-gray-200 transition-colors flex items-center justify-center group ${className}`}
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
