import React from 'react';
import { Button } from '@/components/ui/button';
import { Undo, Redo, X, Check, RotateCcw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface EraseOperationsToolbarProps {
  onCancel: () => void;
  onApply: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onClear?: () => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  isProcessing?: boolean;
}

export const EraseOperationsToolbar: React.FC<EraseOperationsToolbarProps> = ({
  onCancel,
  onApply,
  onUndo,
  onRedo,
  onClear,
  brushSize,
  onBrushSizeChange,
  canUndo = false,
  canRedo = false,
  isProcessing = false
}) => {
  return (
    <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm border border-neutral-200 rounded-full shadow-lg z-50">
      {/* 笔刷大小调节 */}
      <div className="flex items-center gap-2 mr-2 border-r border-neutral-200 pr-4">
        <span className="text-xs text-neutral-500 font-medium w-12">笔刷大小</span>
        <input
          type="range"
          min="5"
          max="100"
          value={brushSize}
          onChange={(e) => onBrushSizeChange(parseInt(e.target.value))}
          className="w-32 h-2 bg-neutral-300 rounded-lg appearance-none cursor-pointer accent-black"
          disabled={isProcessing}
        />
        <span className="text-xs text-neutral-500 w-6">{brushSize}px</span>
      </div>

      {/* 撤销/重做/清空 */}
      <div className="flex items-center gap-1 border-r border-neutral-200 pr-2 mr-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onUndo}
              disabled={!canUndo || isProcessing}
              className="h-8 w-8 hover:bg-neutral-100 rounded-full"
            >
              <Undo size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="z-[10000]">撤销</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRedo}
              disabled={!canRedo || isProcessing}
              className="h-8 w-8 hover:bg-neutral-100 rounded-full"
            >
              <Redo size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="z-[10000]">重做</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              disabled={isProcessing}
              className="h-8 w-8 hover:bg-red-50 text-red-500 rounded-full"
            >
              <RotateCcw size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="z-[10000]">清空画布</TooltipContent>
        </Tooltip>
      </div>

      {/* 确认/取消 */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isProcessing}
          className="rounded-full h-8 px-4 border-neutral-200 hover:bg-neutral-50"
        >
          <X size={14} className="mr-1" />
          取消
        </Button>
        <Button
          size="sm"
          onClick={onApply}
          disabled={isProcessing}
          className="rounded-full h-8 px-4 bg-black hover:bg-neutral-800 text-white"
        >
          {isProcessing ? (
            <>
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              处理中...
            </>
          ) : (
            <>
              <Check size={14} className="mr-1" />
              确认擦除
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
