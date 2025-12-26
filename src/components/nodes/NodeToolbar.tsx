import { NodeToolbar as ReactFlowNodeToolbar, Position } from '@xyflow/react';
import { SwapHoriz, Close, TextFields, Image as ImageIcon, VideoFile, Audiotrack } from '@mui/icons-material';
import { memo } from 'react';

export interface NodeToolbarProps {
  nodeId: string;
  onTypeChange?: (nodeId: string, newType: 'text' | 'image' | 'video' | 'audio') => void;
  onDelete?: (nodeId: string) => void;
  onReplace?: (nodeId: string) => void;
  selected?: boolean;
  type?: 'text' | 'image' | 'video' | 'audio';
}

const NodeToolbar = ({ 
  nodeId, 
  onTypeChange, 
  onDelete, 
  onReplace,
  selected = false, 
  type = 'text' 
}: NodeToolbarProps) => {
  const handleTypeChange = (newType: 'text' | 'image' | 'video' | 'audio') => {
    if (onTypeChange) {
      onTypeChange(nodeId, newType);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(nodeId);
    }
  };

  const handleReplace = () => {
    if (onReplace) {
      onReplace(nodeId);
    }
  };

  // 根据当前节点类型确定可切换的类型
  const getAvailableTypes = () => {
    switch (type) {
      case 'text':
        return [
          { type: 'image' as const, label: '图片', icon: <ImageIcon fontSize="small" /> },
          { type: 'video' as const, label: '视频', icon: <VideoFile fontSize="small" /> },
          { type: 'audio' as const, label: '音频', icon: <Audiotrack fontSize="small" /> },
        ];
      case 'image':
        return [
          { type: 'text' as const, label: '文本', icon: <TextFields fontSize="small" /> },
          { type: 'video' as const, label: '视频', icon: <VideoFile fontSize="small" /> },
          { type: 'audio' as const, label: '音频', icon: <Audiotrack fontSize="small" /> },
        ];
      case 'video':
        return [
          { type: 'text' as const, label: '文本', icon: <TextFields fontSize="small" /> },
          { type: 'image' as const, label: '图片', icon: <ImageIcon fontSize="small" /> },
          { type: 'audio' as const, label: '音频', icon: <Audiotrack fontSize="small" /> },
        ];
      case 'audio':
        return [
          { type: 'text' as const, label: '文本', icon: <TextFields fontSize="small" /> },
          { type: 'image' as const, label: '图片', icon: <ImageIcon fontSize="small" /> },
          { type: 'video' as const, label: '视频', icon: <VideoFile fontSize="small" /> },
        ];
      default:
        return [];
    }
  };

  return (
    <ReactFlowNodeToolbar
      nodeId={nodeId}
      position={Position.TopRight}
      offset={10}
      isVisible={selected}
      className="bg-white shadow-md rounded-md border border-gray-200 p-1 flex items-center gap-1"
    >
      {/* 类型切换按钮 */}
      <div className="relative group">
        <button
          className="w-8 h-8 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="切换节点类型"
        >
          <SwapHoriz fontSize="small" />
        </button>
        
        {/* 类型选择菜单 - 作为下拉菜单实现 */}
        <div className="absolute left-0 top-9 bg-white rounded-md shadow-sm border border-gray-200 py-1 z-20 min-w-[120px] w-32 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
          {getAvailableTypes().map(({ type: newType, label, icon }) => (
            <button
              key={newType}
              onClick={() => handleTypeChange(newType)}
              className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* 更换文件按钮 - 仅对图片、视频和音频节点显示 */}
      {(type === 'image' || type === 'video' || type === 'audio') && (
        <button
          onClick={handleReplace}
          className="w-8 h-8 p-1 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
          aria-label="更换文件"
        >
          {type === 'image' ? <ImageIcon fontSize="small" /> : type === 'video' ? <VideoFile fontSize="small" /> : <Audiotrack fontSize="small" />}
        </button>
      )}
      
      {/* 删除按钮 */}
      <button
        onClick={handleDelete}
        className="w-8 h-8 p-1 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
        aria-label="删除节点"
      >
        <Close fontSize="small" />
      </button>
    </ReactFlowNodeToolbar>
  );
};

export default memo(NodeToolbar);