'use client';

import { ReactNode } from 'react';

interface MenuButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}

export default function MenuButton({
  icon,
  label,
  onClick,
  className = ''
}: MenuButtonProps) {
  return (
    <button
      className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors ${className}`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
