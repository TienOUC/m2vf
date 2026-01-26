import { X, Check, RotateCcw, Undo, Redo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { ASPECT_RATIOS, type AspectRatioOption } from '@/lib/types/crop';

interface ToolbarProps {
  onCancel: () => void;
  onCrop: () => void;
  currentAspectRatio?: number | null;
  onAspectRatioChange?: (aspectRatio: number | null) => void;
  onReset?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const CropOperationsToolbar: React.FC<ToolbarProps> = ({
  onCancel,
  onCrop,
  currentAspectRatio = null,
  onAspectRatioChange,
  onReset,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false
}) => {
  // 宽高比下拉菜单状态
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
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
        <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm border border-neutral-200 rounded-full shadow-lg z-50">
          
          {/* 撤销/重做/重置 */}
          <div className="flex items-center gap-1 border-r border-neutral-200 pr-2 mr-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onUndo}
                  disabled={!canUndo}
                  className="h-8 w-8 hover:bg-neutral-100 rounded-full text-neutral-500 hover:text-neutral-900 disabled:opacity-30"
                >
                  <Undo size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="z-[10000]">
                <p>撤销</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onRedo}
                  disabled={!canRedo}
                  className="h-8 w-8 hover:bg-neutral-100 rounded-full text-neutral-500 hover:text-neutral-900 disabled:opacity-30"
                >
                  <Redo size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="z-[10000]">
                <p>重做</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onReset}
                  className="h-8 w-8 hover:bg-neutral-100 rounded-full text-neutral-500 hover:text-neutral-900"
                >
                  <RotateCcw size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="z-[10000]">
                <p>重置裁剪框</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          {/* 宽高比选择下拉菜单 */}
          <div className="mr-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      id="aspect-ratio-button"
                      className="h-8 px-3 text-xs font-medium hover:bg-neutral-100 rounded-full text-neutral-700"
                    >
                      {currentRatioOption.label}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="bg-white border-neutral-200 rounded-lg shadow-md"
                    align="center"
                    style={{ zIndex: 100000 }}
                    portal={false}
                  >
                    {ASPECT_RATIOS.map((ratio) => (
                      <DropdownMenuItem
                        key={ratio.label}
                        onClick={() => handleAspectRatioSelect(ratio)}
                        className={`text-neutral-700 text-xs cursor-pointer ${ratio.value === currentAspectRatio ? 'bg-neutral-100' : 'hover:bg-neutral-50'}`}
                      >
                        {ratio.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent className="z-[10000]">
                <p>宽高比</p>
              </TooltipContent>
            </Tooltip>
          </div>
      
          {/* 确认/取消 */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="rounded-full h-8 px-4 border-neutral-200 hover:bg-neutral-50 text-neutral-700"
            >
              <X size={14} className="mr-1" />
              取消
            </Button>
            <Button
              size="sm"
              onClick={onCrop}
              className="rounded-full h-8 px-4 bg-black hover:bg-neutral-800 text-white"
            >
              <Check size={14} className="mr-1" />
              确认裁剪
            </Button>
          </div>
        </div>
      );
};

export default CropOperationsToolbar;
