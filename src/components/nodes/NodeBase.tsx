import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import NodeToolbar from './NodeToolbar';
import { NodeData } from '../../hooks/useNodeBase';

export interface BaseNodeProps extends NodeProps {
  children: React.ReactNode;
  icon: React.ReactNode;
  title: string;
  nodeType: 'text' | 'image' | 'video';
}

export function NodeBase({ 
  data, 
  id, 
  selected, 
  children, 
  icon, 
  title, 
  nodeType,
  ...rest
}: BaseNodeProps) {
  const nodeData = data as NodeData;
  
  return (
    <div className="bg-white rounded-lg min-w-[200px] relative transition-colors duration-150 shadow-sm hover:shadow-md" {...rest}>
      {/* 输入连接点 */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-gray-400" />
      
      {/* 节点工具栏 */}
      <NodeToolbar
        nodeId={id}
        onTypeChange={nodeData?.onTypeChange}
        onDelete={nodeData?.onDelete}
        selected={selected}
        type={nodeType}
      />
      
      {/* 节点头部 */}
      <div className="bg-gray-50 text-gray-800 px-3 py-2 rounded-t-md text-sm font-medium flex justify-between items-center">
        <span className="flex items-center gap-1">
          {icon}
          {nodeData?.label || title}
        </span>
      </div>
      
      {/* 节点内容 */}
      <div className="p-3">
        {children}
      </div>
      
      {/* 输出连接点 */}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-gray-400" />
    </div>
  );
}