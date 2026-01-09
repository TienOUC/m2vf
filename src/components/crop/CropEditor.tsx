import { useRef } from 'react';
import { useCropEditor } from '@/hooks/crop';
import type { FabricImageEditorProps } from '@/types/editor/fabric';
import { CropCanvas } from './CropCanvas';
import { CropToolbar } from './CropToolbar';
import LoadingState from '../nodes/LoadingState';
import ErrorState from '../nodes/ErrorState';

/**
 * 裁剪编辑器主组件
 * 负责整体布局和状态协调
 */
export const CropEditor: React.FC<FabricImageEditorProps> = ({ 
  imageUrl, 
  onCropComplete, 
  onCancel 
}) => {
  const canvasElementRef = useRef<HTMLCanvasElement>(null);

  const {
    // 状态
    fabricLoaded,
    loadingError,
    isProcessing,
    canUndo,
    canRedo,
    
    // 方法
    handleCrop,
    undo,
    redo,
    resetCropBox,
    destroyEditor
  } = useCropEditor({
    imageUrl,
    onCropComplete,
    onCancel
  });

  // 处理组件卸载
  const handleCleanup = () => {
    destroyEditor();
  };

  // 显示错误状态
  if (loadingError) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <ErrorState 
          error={loadingError} 
          onRetry={() => window.location.reload()} 
        />
      </div>
    );
  }

  // 显示加载状态
  if (!fabricLoaded || isProcessing) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <LoadingState message="正在加载图片编辑器..." />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-transparent">
      {/* 画布区域 */}
      <div className="flex-1 flex items-center justify-center overflow-auto">
        <CropCanvas 
          canvasRef={canvasElementRef}
          imageUrl={imageUrl}
        />
      </div>
      
      {/* 工具栏 */}
      <div className="p-4">
        <CropToolbar
          onReset={resetCropBox}
          onUndo={undo}
          onRedo={redo}
          onCancel={onCancel}
          onCrop={handleCrop}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      </div>
    </div>
  );
};