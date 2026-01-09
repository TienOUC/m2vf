import { Refresh, Undo, Redo } from '@mui/icons-material';
import { Tooltip } from '@mui/material';

interface CropToolbarProps {
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCancel: () => void;
  onCrop: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * 裁剪工具栏组件
 * 提供裁剪操作的各种控制按钮
 */
export const CropToolbar: React.FC<CropToolbarProps> = ({
  onReset,
  onUndo,
  onRedo,
  onCancel,
  onCrop,
  canUndo,
  canRedo
}) => {
  return (
    <div className="flex justify-center items-center gap-4 bg-gray-800/80 backdrop-blur-sm rounded-xl p-4">
      <Tooltip title="重置裁剪框" placement="top">
        <button
          onClick={onReset}
          className="flex items-center justify-center w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          aria-label="重置"
        >
          <Refresh className="text-white" fontSize="small" />
        </button>
      </Tooltip>
      
      <div className="flex gap-2">
        <Tooltip title="撤销操作" placement="top">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${
              canUndo 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
            aria-label="撤销"
          >
            <Undo fontSize="small" />
          </button>
        </Tooltip>
        
        <Tooltip title="重做操作" placement="top">
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${
              canRedo 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
            aria-label="重做"
          >
            <Redo fontSize="small" />
          </button>
        </Tooltip>
      </div>
      
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