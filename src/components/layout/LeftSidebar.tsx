'use client';

import { useState } from 'react';
import {
  Add,
  Folder,
  TextFields,
  Image as ImageIcon,
  VideoFile,
  Audiotrack,
  UploadFile,
  Collections
} from '@mui/icons-material';
import { FloatingMenu, MenuButton, SidebarButton } from '../common';

interface LeftSidebarProps {
  onAddClick?: () => void;
  onAssetLibraryClick?: () => void;
  onAddTextNode?: () => void;
  onAddImageNode?: () => void;
  onAddVideoNode?: () => void;
  onAddAudioNode?: () => void;
  onUploadFile?: () => void;
  onUploadImage?: () => void;
  onUploadVideo?: () => void;
  onUploadAudio?: () => void;
  onViewAllAssets?: () => void;
}

export default function LeftSidebar({
  onAddClick,
  onAssetLibraryClick,
  onAddTextNode,
  onAddImageNode,
  onAddVideoNode,
  onAddAudioNode,
  onUploadFile,
  onUploadImage,
  onUploadVideo,
  onUploadAudio,
  onViewAllAssets
}: LeftSidebarProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAssetMenu, setShowAssetMenu] = useState(false);

  const handleAddClick = () => {
    if (onAddClick) {
      onAddClick();
    }
    setShowAddMenu(!showAddMenu);
    setShowAssetMenu(false);
  };

  const handleAssetClick = () => {
    if (onAssetLibraryClick) {
      onAssetLibraryClick();
    }
    setShowAssetMenu(!showAssetMenu);
    setShowAddMenu(false);
  };

  const closeAllMenus = () => {
    setShowAddMenu(false);
    setShowAssetMenu(false);
  };

  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-gray-200 z-10 flex flex-col items-center gap-3">
      {/* 添加按钮 */}
      <div className="relative">
        <SidebarButton
          icon={<Add fontSize="small" />}
          title="添加"
          onClick={handleAddClick}
          className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 shadow-md"
          animation="rotate"
        />

        <FloatingMenu
          isOpen={showAddMenu}
          onClose={closeAllMenus}
          title="添加节点"
          position="right"
          width="w-48"
        >
          <MenuButton
            icon={<TextFields fontSize="small" />}
            label="文本"
            onClick={() => {
              onAddTextNode?.();
              closeAllMenus();
            }}
          />
          <MenuButton
            icon={<ImageIcon fontSize="small" />}
            label="图片"
            onClick={() => {
              onAddImageNode?.();
              closeAllMenus();
            }}
          />
          <MenuButton
            icon={<VideoFile fontSize="small" />}
            label="视频"
            onClick={() => {
              onAddVideoNode?.();
              closeAllMenus();
            }}
          />
          <MenuButton
            icon={<Audiotrack fontSize="small" />}
            label="音频"
            onClick={() => {
              onAddAudioNode?.();
              closeAllMenus();
            }}
          />
        </FloatingMenu>
      </div>

      {/* 资产库按钮 */}
      <div className="relative">
        <SidebarButton
          icon={<Folder fontSize="small" />}
          title="资产库"
          onClick={handleAssetClick}
          animation="scale"
        />

        <FloatingMenu
          isOpen={showAssetMenu}
          onClose={closeAllMenus}
          title="资产库"
          position="right"
          width="w-48"
        >
          <MenuButton
            icon={<Collections fontSize="small" />}
            label="所有资产"
            onClick={() => {
              onViewAllAssets?.();
              closeAllMenus();
            }}
          />

          {/* 分割线 */}
          <div className="border-t border-gray-200 my-2"></div>

          <MenuButton
            icon={<UploadFile fontSize="small" />}
            label="上传文件"
            onClick={() => {
              onUploadFile?.();
              closeAllMenus();
            }}
          />
          <MenuButton
            icon={<ImageIcon fontSize="small" />}
            label="上传图片"
            onClick={() => {
              onUploadImage?.();
              closeAllMenus();
            }}
          />
          <MenuButton
            icon={<VideoFile fontSize="small" />}
            label="上传视频"
            onClick={() => {
              onUploadVideo?.();
              closeAllMenus();
            }}
          />
          <MenuButton
            icon={<Audiotrack fontSize="small" />}
            label="上传音频"
            onClick={() => {
              onUploadAudio?.();
              closeAllMenus();
            }}
          />
        </FloatingMenu>
      </div>
    </div>
  );
}
