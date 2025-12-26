import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import NodeToolbar from './NodeToolbar';
import { NodeData } from '../../hooks/useNodeBase';

export interface BaseNodeProps extends NodeProps {
  children: React.ReactNode;
  nodeType: 'text' | 'image' | 'video';
}

export function NodeBase({ 
  data, 
  id, 
  selected, 
  children, 
  nodeType,
  ...rest
}: BaseNodeProps) {
  const nodeData = data as NodeData;
  
  return (
    <div className="bg-white rounded-lg w-[240px] h-[160px] relative transition-colors duration-150 shadow-sm hover:shadow-md" {...rest}>
      {/* 输入连接点 */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-800" />
      
      {/* 节点工具栏 */}
      <NodeToolbar
        nodeId={id}
        onTypeChange={nodeData?.onTypeChange}
        onDelete={nodeData?.onDelete}
        selected={selected}
        type={nodeType}
      />
      
      {/* 节点内容 */}
      <div className="w-full h-full p-1 flex items-center justify-center">
        {children}
      </div>
      
      {/* 输出连接点 */}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-gray-800" />
    </div>
  );
}