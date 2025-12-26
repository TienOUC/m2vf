'use client';

import { useState, useRef, useEffect } from 'react';
import { Add, Folder, TextFields, Image as ImageIcon, VideoFile, Audiotrack } from '@mui/icons-material';

interface LeftSidebarProps {
  onAddClick?: () => void;
  onAssetLibraryClick?: () => void;
  onAddTextNode?: () => void;
  onAddImageNode?: () => void;
  onAddVideoNode?: () => void;
  onAddAudioNode?: () => void;
}

export default function LeftSidebar({ onAddClick, onAssetLibraryClick, onAddTextNode, onAddImageNode, onAddVideoNode, onAddAudioNode }: LeftSidebarProps) {
  const [showMenu, setShowMenu] = useState(false);
  
  const handleAddClick = () => {
    if (onAddClick) {
      onAddClick();
    }
    setShowMenu(!showMenu);
  };
  
  // 点击外部区域关闭菜单
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-gray-200 z-10 flex flex-col items-center gap-3">
      <div className="relative">
        <button 
          className="w-12 h-12 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200 shadow-md flex items-center justify-center group"
          title="添加"
          onClick={handleAddClick}
        >
          <span className="transform transition-transform duration-200 group-hover:rotate-45">
            <Add fontSize="small" />
          </span>
        </button>
        
        {showMenu && (
          <div ref={menuRef} className="absolute left-full ml-3 top-0 bg-white rounded-lg shadow-xl border border-gray-200 w-48 z-20">
            <div className="p-2 bg-gray-100 rounded-t-lg">
              <span className="text-xs font-medium text-gray-600">添加节点</span>
            </div>
            <div className="py-1">
              <button 
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => {
                  if (onAddTextNode) {
                    onAddTextNode();
                  }
                  setShowMenu(false);
                }}
              >
                <TextFields fontSize="small" />
                <span>文本</span>
              </button>
              <button 
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => {
                  if (onAddImageNode) {
                    onAddImageNode();
                  }
                  setShowMenu(false);
                }}
              >
                <ImageIcon fontSize="small" />
                <span>图片</span>
              </button>
              <button 
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => {
                  if (onAddVideoNode) {
                    onAddVideoNode();
                  }
                  setShowMenu(false);
                }}
              >
                <VideoFile fontSize="small" />
                <span>视频</span>
              </button>
              <button 
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => {
                  if (onAddAudioNode) {
                    onAddAudioNode();
                  }
                  setShowMenu(false);
                }}
              >
                <Audiotrack fontSize="small" />
                <span>音频</span>
              </button>
            </div>
          </div>
        )}
      </div>
      
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