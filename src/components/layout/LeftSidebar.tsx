'use client';

import { Add, Image as ImageIcon } from '@mui/icons-material';

interface LeftSidebarProps {
  onAddClick?: () => void;
  onAssetLibraryClick?: () => void;
}

export default function LeftSidebar({ onAddClick, onAssetLibraryClick }: LeftSidebarProps) {
  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-gray-200 z-10 flex flex-col items-center gap-3">
      <button 
        className="p-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-md flex items-center justify-center"
        title="添加"
        onClick={onAddClick}
      >
        <Add fontSize="small" />
      </button>
      <button 
        className="p-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors shadow-md flex items-center justify-center"
        title="资产库"
        onClick={onAssetLibraryClick}
      >
        <ImageIcon fontSize="small" />
      </button>
    </div>
  );
}