import { memo } from 'react';

interface ResizeIconProps {
  className?: string;
}

const ResizeIcon = ({ className }: ResizeIconProps) => {
  return (
    <div className={`w-4 h-4 flex items-center justify-center transition duration-200 group-hover:brightness-[1.3] pointer-events-none ${className || ''}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="10"
        height="10"
        viewBox="0 0 24 24"
        strokeWidth="4"
        stroke="var(--color-neutral-400)"
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
