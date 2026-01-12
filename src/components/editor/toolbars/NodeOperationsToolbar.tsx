import { Refresh, Undo, Redo } from '@mui/icons-material';
import { Tooltip, Menu, MenuItem, Button } from '@mui/material';
import { useState } from 'react';
import { ASPECT_RATIOS, type AspectRatioOption } from '@/lib/types/crop';

interface ToolbarProps {
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCancel: () => void;
  onCrop: () => void;
  canUndo: boolean;
  canRedo: boolean;
  currentAspectRatio?: number | null;
  onAspectRatioChange?: (aspectRatio: number | null) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onReset,
  onUndo,
  onRedo,
  onCancel,
  onCrop,
  canUndo,
  canRedo,
  currentAspectRatio = null,
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
    if (onAspectRatioChange) {
      onAspectRatioChange(aspectRatio.value);
    }
    handleMenuClose();
  };
  
  // 获取当前选中的宽高比
  const currentRatioOption = ASPECT_RATIOS.find(option => option.value === currentAspectRatio) || ASPECT_RATIOS[0];

  return (
    <div className="mt-2 flex justify-center items-center text-white gap-4">
      <Tooltip title="重置" placement="top">
        <button
          onClick={onReset}
          className="text-xs flex items-center justify-center px-2 py-2 hover:bg-gray-600 rounded-md transition-colors"
          aria-label="重置"
        >
          <Refresh fontSize="small" />
        </button>
      </Tooltip>
      
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
            className="text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            sx={{
              minWidth: '100px',
              fontSize: '0.75rem',
              padding: '6px 12px',
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
      <Tooltip title="撤销" placement="top">
        <span>
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="text-xs flex items-center justify-center px-2 py-2 hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="撤销"
          >
            <Undo fontSize="small" />
          </button>
        </span>
      </Tooltip>
      <Tooltip title="重做" placement="top">
        <span>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="text-xs flex items-center justify-center px-2 py-2 hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="重做"
          >
            <Redo fontSize="small" />
          </button>
        </span>
      </Tooltip>
      <button
        onClick={onCancel}
        className="text-xs flex items-center justify-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
      >
        取消
      </button>
      <button
        onClick={onCrop}
        className="text-xs flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors font-medium"
      >
        确认
      </button>
    </div>
  );
};

export default Toolbar;