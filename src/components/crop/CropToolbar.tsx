import { Tooltip, Menu, MenuItem, Button } from '@mui/material';
import { useState } from 'react';
import { ASPECT_RATIOS, type AspectRatioOption } from '@/lib/types/crop';

interface CropToolbarProps {
  onCancel: () => void;
  onCrop: () => void;
  currentAspectRatio: number | null;
  onAspectRatioChange: (aspectRatio: number | null) => void;
}

/**
 * 裁剪工具栏组件
 * 提供裁剪操作的各种控制按钮
 */
export const CropToolbar: React.FC<CropToolbarProps> = ({
  onCancel,
  onCrop,
  currentAspectRatio,
  onAspectRatioChange
}) => {
  // 宽高比下拉菜单状态
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  // 处理菜单打开
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  // 处理菜单关闭
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // 处理宽高比选择
  const handleAspectRatioSelect = (aspectRatio: AspectRatioOption) => {
    onAspectRatioChange(aspectRatio.value);
    handleMenuClose();
  };
  
  // 获取当前选中的宽高比
  const currentRatioOption = ASPECT_RATIOS.find(option => option.value === currentAspectRatio) || ASPECT_RATIOS[0];
  return (
    <div className="flex justify-center items-center gap-4 bg-gray-800/80 backdrop-blur-sm rounded-xl p-4">
      {/* 宽高比选择下拉菜单 */}
      <Tooltip title="宽高比" placement="top">
        <div className="relative">
          <Button
            id="aspect-ratio-button"
            aria-controls={open ? 'aspect-ratio-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleMenuOpen}
            variant="text"
            className="text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            sx={{
              minWidth: '100px',
              fontSize: '0.75rem',
              padding: '8px 16px',
              height: '40px'
            }}
          >
            {currentRatioOption.label}
          </Button>
          <Menu
            id="aspect-ratio-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            MenuListProps={{
              'aria-labelledby': 'aspect-ratio-button',
            }}
            sx={{
              zIndex: 10000, // 设置高z-index确保菜单显示在最上层
              '& .MuiMenuItem-root': {
                fontSize: '0.75rem',
                padding: '8px 16px'
              }
            }}
          >
            {ASPECT_RATIOS.map((ratio) => (
              <MenuItem
                key={ratio.label}
                onClick={() => handleAspectRatioSelect(ratio)}
                selected={ratio.value === currentAspectRatio}
                className="text-xs"
              >
                {ratio.label}
              </MenuItem>
            ))}
          </Menu>
        </div>
      </Tooltip>
      
      <div className="h-6 w-px bg-gray-600 mx-2"></div>
      
      <button
        onClick={onCancel}
        className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium"
      >
        取消
      </button>
      
      <button
        onClick={onCrop}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center gap-2"
      >
        <span>确认裁剪</span>
      </button>
    </div>
  );
};