import { DeleteOutline } from '@mui/icons-material';
import { Tooltip, Menu, MenuItem, Button} from '@mui/material';
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
  currentAspectRatio: number | null;
  onAspectRatioChange: (aspectRatio: number | null) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onReset,
  onUndo,
  onRedo,
  onCancel,
  onCrop,
  canUndo,
  canRedo,
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
    <div className="mt-2 flex justify-center items-center text-white gap-4">
      <button
        onClick={onCancel}
        className="text-xs flex items-center justify-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
      >
        <DeleteOutline fontSize="small" />
      </button>
      
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
  
      <button
        onClick={onCrop}
        className="text-xs flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors font-medium"
      >
        确认裁剪
      </button>
    </div>
  );
};

export default Toolbar;