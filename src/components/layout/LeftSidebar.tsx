'use client';

import { useState } from 'react';
import {
  Plus,
  FolderOpen,
  Type,
  Image,
  Video,
  Upload,
  Images,
  Box
} from 'lucide-react';
import { FloatingMenu, MenuButton, SidebarButton } from '@/components/ui';
import { AssetDrawer } from '@/components/forms';
import UserAvatar from './UserAvatar';
import { useAuthStore } from '@/lib/stores';

interface LeftSidebarProps {
  onAddClick?: () => void;
  onAssetLibraryClick?: () => void;
  onAddTextNode?: () => void;
  onAddImageNode?: () => void;
  onAddVideoNode?: () => void;
  onUploadImage?: () => void;
  onUploadVideo?: () => void;
  projectId?: number;
}

export default function LeftSidebar({
  onAddClick,
  onAssetLibraryClick,
  onAddTextNode,
  onAddImageNode,
  onAddVideoNode,
  onUploadImage,
  onUploadVideo,
  projectId
}: LeftSidebarProps) {
  const { user } = useAuthStore();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAssetMenu, setShowAssetMenu] = useState(false);
  const [showAssetDrawer, setShowAssetDrawer] = useState(false);

  const handleAddClick = () => {
    onAddClick && onAddClick(); 
    setShowAddMenu(!showAddMenu);
    setShowAssetMenu(false);
  };

  const handleAssetClick = () => {
    onAssetLibraryClick && onAssetLibraryClick();
    setShowAssetMenu(!showAssetMenu);
    setShowAddMenu(false);
  };

  const closeAllMenus = () => {
    setShowAddMenu(false);
    setShowAssetMenu(false);
  };

  return (
    <div>
    <div
      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-lg border border-neutral-200 z-10 flex flex-col items-center gap-1.5 w-[54px]"
      // 阻止侧边栏容器上的点击事件冒泡
      onClick={(e) => e.stopPropagation()}
    >
      {/* 添加按钮 */}
      <div className="relative">
        <SidebarButton
          icon={<Plus size={20} />}
          title="添加"
          onClick={handleAddClick}
          className="rounded-full bg-gray-200 hover:bg-gray-300 shadow-md"
          animation="rotate"
        />

        <FloatingMenu
          isOpen={showAddMenu}
          onClose={closeAllMenus}
          position="right"
          width="w-48"
        >
          <MenuButton
            icon={<Type size={16} />}
            label="文本"
            onClick={() => {
              onAddTextNode?.();
              closeAllMenus();
            }}
          />
          <MenuButton
            icon={<Image size={16} />}
            label="图片"
            onClick={() => {
              onAddImageNode?.();
              closeAllMenus();
            }}
          />
          <MenuButton
            icon={<Video size={16} />}
            label="视频"
            onClick={() => {
              onAddVideoNode?.();
              closeAllMenus();
            }}
          />
        </FloatingMenu>
      </div>

      {/* 分割线 */}
      <div className="w-8 h-px bg-neutral-200"></div>

      {/* 资产库按钮 */}
      <div className="relative">
        <SidebarButton
          icon={<FolderOpen size={20} />}
          title="资产库"
          onClick={handleAssetClick}
          animation="scale"
        />

        <FloatingMenu
          isOpen={showAssetMenu}
          onClose={closeAllMenus}
          position="right"
          width="w-48"
        >
          <MenuButton
            icon={<Images size={16} />}
            label="所有资产"
            onClick={() => {
              closeAllMenus();
              // 显示资产抽屉，需要有项目ID
              if (projectId) {
                setShowAssetDrawer(true);
              }
            }}
          />

          {/* 分割线 */}
          <div className="border-t border-gray-200 my-2"></div>


          <MenuButton
            icon={<Image size={16} />}
            label="上传图片"
            onClick={() => {
              onUploadImage?.();
              closeAllMenus();
            }}
          />
          <MenuButton
            icon={<Video size={16} />}
            label="上传视频"
            onClick={() => {
              onUploadVideo?.();
              closeAllMenus();
            }}
          />
        </FloatingMenu>
      </div>

      {/* Box按钮 */}
      <SidebarButton
        icon={<Box size={20} />}
        title="Box"
        onClick={() => {
          alert('Box功能即将实现');
        }}
        animation="scale"
      />

      {/* 分割线 */}
      <div className="w-8 h-px bg-neutral-200"></div>

      {/* 底部用户头像 */}
      <div className="mt-auto">
        {user && <UserAvatar user={user} menuOffsetY={10} />}
      </div>
    </div>
    
    {/* 资产管理抽屉 */}
    {projectId && (
      <AssetDrawer
        isOpen={showAssetDrawer}
        onClose={() => setShowAssetDrawer(false)}
        projectId={projectId}
      />
    )}
  </div>
  );
}
