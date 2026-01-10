import { Tooltip } from '@mui/material';
import { memo } from 'react';

interface ToolbarButtonProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  className?: string;
  ariaLabel: string;
  children?: React.ReactNode;
}

const ToolbarButton = ({ 
  icon, 
  title, 
  onClick, 
  className = "w-8 h-8 p-1 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors", 
  ariaLabel,
  children
}: ToolbarButtonProps) => {
  return (
    <div className="relative group">
      <Tooltip title={title} placement="top">
        <button
          onClick={onClick}
          className={className}
          aria-label={ariaLabel}
        >
          {icon}
        </button>
      </Tooltip>
      {children && (
        <div className="absolute left-0 top-9 bg-white rounded-md shadow-sm border border-gray-200 py-1 z-20 min-w-[120px] w-32 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
          {children}
        </div>
      )}
    </div>
  );
};

export default memo(ToolbarButton);