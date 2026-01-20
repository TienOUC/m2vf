import { memo } from 'react';

interface ResizeIconProps {
  className?: string;
}

const ResizeIcon = ({ className }: ResizeIconProps) => {
  return (
    <div className={`rotate-180 w-6 h-6 flex items-center justify-center transition-all duration-200 pointer-events-none text-[var(--color-neutral-400)] opacity-0 group-hover:opacity-100 group-selected:opacity-100 ${className || ''}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        strokeWidth="3"
        stroke="currentColor"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 18a12 12 0 0 1 12-12" />
      </svg>
    </div>
  );
};

export default memo(ResizeIcon);
