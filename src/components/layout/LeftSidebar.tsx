'use client';

import { Add, Folder } from '@mui/icons-material';

interface LeftSidebarProps {
  onAddClick?: () => void;
  onAssetLibraryClick?: () => void;
}

export default function LeftSidebar({ onAddClick, onAssetLibraryClick }: LeftSidebarProps) {
  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-gray-200 z-10 flex flex-col items-center gap-3">
      <button 
        className="p-3 rounded-[50%] bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all duration-200 shadow-md flex items-center justify-center group"
        title="添加"
        onClick={onAddClick}
      >
        <span className="transition-transform duration-200 group-hover:rotate-45">
          <Add fontSize="small" />
        </span>
      </button>
      <button 
        className="p-3 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors flex items-center justify-center"
        title="资产库"
        onClick={onAssetLibraryClick}
      >
        <Folder fontSize="small" />
      </button>
    </div>
  );
}