import { Refresh, Undo, Redo } from '@mui/icons-material';
import { Tooltip } from '@mui/material';

interface ToolbarProps {
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCancel: () => void;
  onCrop: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onReset,
  onUndo,
  onRedo,
  onCancel,
  onCrop,
  canUndo,
  canRedo
}) => {
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