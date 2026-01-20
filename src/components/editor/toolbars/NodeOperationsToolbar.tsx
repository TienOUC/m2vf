import { Close, Check } from '@mui/icons-material';
import { Tooltip, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import { ASPECT_RATIOS, type AspectRatioOption } from '@/lib/types/crop';

interface ToolbarProps {
  onCancel: () => void;
  onCrop: () => void;
  currentAspectRatio?: number | null;
  onAspectRatioChange?: (aspectRatio: number | null) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onCancel,
  onCrop,
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

  // return (
  //   <div className="mt-2 flex justify-center items-center text-white gap-4">
  //     {/* 宽高比选择下拉菜单 */}
  //     <Tooltip title="宽高比" placement="top">
  //       <div className="relative">
  //         <Button
  //           id="aspect-ratio-button"
  //           aria-controls={open ? 'aspect-ratio-menu' : undefined}
  //           aria-haspopup="true"
  //           aria-expanded={open ? 'true' : undefined}
  //           onClick={handleMenuOpen}
  //           variant="text"
  //           className="text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
  //           sx={{
  //             minWidth: '100px',
  //             fontSize: '0.75rem',
  //             padding: '6px 12px',
  //           }}
  //         >
  //           {currentRatioOption.label}
  //         </Button>
  //         <Menu
  //           id="aspect-ratio-menu"
  //           anchorEl={anchorEl}
  //           open={open}
  //           onClose={handleMenuClose}
  //           MenuListProps={{
  //             'aria-labelledby': 'aspect-ratio-button',
  //           }}
  //           sx={{
  //             zIndex: 10000, // 设置高z-index确保菜单显示在最上层
  //           }}
  //         >
  //           {ASPECT_RATIOS.map((ratio) => (
  //             <MenuItem
  //               key={ratio.label}
  //               onClick={() => handleAspectRatioSelect(ratio)}
  //               selected={ratio.value === currentAspectRatio}
  //               className="text-xs"
  //             >
  //               {ratio.label}
  //             </MenuItem>
  //           ))}
  //         </Menu>
  //       </div>
  //     </Tooltip>
  //     <button
  //       onClick={onCancel}
  //       className="text-xs flex items-center justify-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
  //     >
  //       取消
  //     </button>
  //     <button
  //       onClick={onCrop}
  //       className="text-xs flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors font-medium"
  //     >
  //       确认
  //     </button>
  //   </div>
  // );

     return (
        <div className="flex justify-center items-center gap-2 bg-black bg-opacity-90 mt-2 p-2 rounded-full">
          {/* 关闭按钮 */}
          <button
            onClick={onCancel}
            className="flex items-center justify-center w-10 h-10 bg-black rounded-full text-white hover:bg-gray-800 transition-colors"
            aria-label="关闭"
          >
            <Close fontSize="small" />
          </button>
          
          {/* 宽高比选择下拉菜单 */}
          <Tooltip title="宽高比" placement="top">
            <div className="relative">
              <button
                id="aspect-ratio-button"
                aria-controls={open ? 'aspect-ratio-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleMenuOpen}
                className=" flex items-center justify-center min-w-[80px] text-white bg-gray-800 hover:bg-gray-700 transition-colors text-xs rounded-full px-4 py-3 font-medium"
              >
                {currentRatioOption.label}
              </button>

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
                  '& .MuiMenu-paper': {
                    backgroundColor: '#111',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  },
                  '& .MuiMenuItem-root': {
                    color: '#fff',
                    fontSize: '0.75rem',
                    '&:hover': {
                      backgroundColor: '#333',
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#444',
                    },
                  },
                }}
              >
                {ASPECT_RATIOS.map((ratio) => (
                  <MenuItem
                    key={ratio.label}
                    onClick={() => handleAspectRatioSelect(ratio)}
                    selected={ratio.value === currentAspectRatio}
                  >
                    {ratio.label}
                  </MenuItem>
                ))}
              </Menu>
            </div>
          </Tooltip>
      
          {/* 确认裁剪按钮 */}
          <button
            onClick={onCrop}
            className="flex items-center justify-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors text-xs font-medium"
          >
            <Check fontSize="small" />
            确认裁剪
          </button>
        </div>
      );
};

export default Toolbar;