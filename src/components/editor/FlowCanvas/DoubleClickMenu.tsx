'use client';

import { Type, Image, Video } from 'lucide-react';
import FloatingMenu from '@/components/ui/FloatingMenu';
import MenuButton from '@/components/ui/MenuButton';

interface DoubleClickMenuProps {
  doubleClickPosition: { x: number; y: number } | null;
  onClose: () => void;
  addTextNode: (position: { x: number; y: number }) => void;
  addImageNode: (position: { x: number; y: number }) => void;
  addVideoNode: (position: { x: number; y: number }) => void;
  screenToFlowPosition: (position: { x: number; y: number }) => { x: number; y: number };
}

const DoubleClickMenu: React.FC<DoubleClickMenuProps> = ({
  doubleClickPosition,
  onClose,
  addTextNode,
  addImageNode,
  addVideoNode,
  screenToFlowPosition
}) => {
  if (!doubleClickPosition) {
    return null;
  }

  return (
    <div
      className="absolute"
      style={{
        left: doubleClickPosition.x,
        top: doubleClickPosition.y,
        transform: 'translate(-50%, -50%)',
        zIndex: 1000
      }}
    >
      <FloatingMenu
        isOpen={!!doubleClickPosition}
        onClose={onClose}
        width="w-48"
      >
        <MenuButton
          icon={<Type size={16} />}
          label="文本"
          onClick={() => {
            if (doubleClickPosition) {
              // 将屏幕坐标转换为画布坐标
              const flowPosition = screenToFlowPosition(doubleClickPosition);
              addTextNode(flowPosition);
              onClose();
            }
          }}
        />
        <MenuButton
          icon={<Image size={16} />}
          label="图片"
          onClick={() => {
            if (doubleClickPosition) {
              // 将屏幕坐标转换为画布坐标
              const flowPosition = screenToFlowPosition(doubleClickPosition);
              addImageNode(flowPosition);
              onClose();
            }
          }}
        />
        <MenuButton
          icon={<Video size={16} />}
          label="视频"
          onClick={() => {
            if (doubleClickPosition) {
              // 将屏幕坐标转换为画布坐标
              const flowPosition = screenToFlowPosition(doubleClickPosition);
              addVideoNode(flowPosition);
              onClose();
            }
          }}
        />
      </FloatingMenu>
    </div>
  );
};

export default DoubleClickMenu;