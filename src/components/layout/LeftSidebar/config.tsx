import { Plus, Type, Image, Video, Box, FolderOpen } from 'lucide-react';
import { MenuButton } from '@/components/ui';
import { AssetLibraryMenu } from '@/components/editor/FlowCanvas/AssetLibraryMenu';
import { SidebarButtonConfig } from './types';

export const getSidebarButtons = (props: {
  onAddClick?: () => void;
  onAddTextNode?: () => void;
  onAddImageNode?: () => void;
  onAddVideoNode?: () => void;
}): SidebarButtonConfig[] => {
  return [
    {
      id: 'add',
      icon: <Plus size={20} />,
      title: '添加',
      animation: 'scale',
      onClick: () => props.onAddClick?.(),
      menu: (
        <>
          <MenuButton
            icon={<Type size={16} />}
            label="文本"
            onClick={() => props.onAddTextNode?.()}
          />
          <MenuButton
            icon={<Image size={16} />}
            label="图片"
            onClick={() => props.onAddImageNode?.()}
          />
          <MenuButton
            icon={<Video size={16} />}
            label="视频"
            onClick={() => props.onAddVideoNode?.()}
          />
        </>
      ),
      menuWidth: 'w-48'
    },
    {
      id: 'assets',
      icon: <FolderOpen size={20} />,
      title: '资产库',
      animation: 'scale',
      onClick: () => {},
      menu: <AssetLibraryMenu />,
      useDefaultMenuStyles: false,
      menuWidth: 'w-[384px]'
    },
    {
      id: 'box',
      icon: <Box size={20} />,
      title: 'Box',
      animation: 'scale',
      onClick: () => {
        window.location.href = '/3d';
      }
    }
  ];
};
