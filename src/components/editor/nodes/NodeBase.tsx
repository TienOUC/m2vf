import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { forwardRef } from 'react';
import NodeToolbar from './NodeToolbar';
import { NodeData } from '@/hooks/editor/useNodeBase';

export interface BaseNodeProps extends Pick<NodeProps, 'id' | 'data' | 'selected'> {
  children: React.ReactNode;
  nodeType: 'text' | 'image' | 'video';
  icon?: React.ReactNode;
  title?: string;
  onReplace?: (nodeId: string) => void;
  onBackgroundColorChange?: (nodeId: string, color: string) => void;
  onFontTypeChange?: (nodeId: string, fontType: 'h1' | 'h2' | 'h3' | 'p') => void;
  backgroundColor?: string;
  fontType?: 'h1' | 'h2' | 'h3' | 'p';
  // 新增：文本格式化功能
  onBoldToggle?: (nodeId: string) => void;
  onItalicToggle?: (nodeId: string) => void;
  onBulletListToggle?: (nodeId: string) => void;
  onNumberedListToggle?: (nodeId: string) => void;
  onHorizontalRuleInsert?: (nodeId: string) => void;
  getRichContent?: (nodeId: string) => string;
  onToggleFullscreen?: (nodeId: string) => void;
  onEditStart?: (nodeId: string) => void;
  // 新增：图片节点状态控制
  hasImage?: boolean;
}

export const NodeBase = forwardRef<HTMLDivElement, BaseNodeProps>(({
  data,
  id,
  selected,
  children,
  nodeType,
  onReplace,
  onBackgroundColorChange,
  onFontTypeChange,
  onBoldToggle,
  onItalicToggle,
  onBulletListToggle,
  onNumberedListToggle,
  onHorizontalRuleInsert,
  backgroundColor,
  fontType,
  getRichContent,
  onToggleFullscreen,
  onEditStart,
  hasImage = false
}, ref) => {
  const nodeData = data as NodeData;

  return (
    <div
      ref={ref}
      className="rounded-lg w-full h-full relative transition-colors duration-150 shadow-sm hover:shadow-md"
      style={{ 
        backgroundColor: backgroundColor || 'white',
        minWidth: '180px', 
        minHeight: '120px' 
      }}
    >
      {/* 输入连接点 */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-gray-800"
      />

      {/* 节点工具栏 */}
      <NodeToolbar
        nodeId={id}
        onTypeChange={nodeData?.onTypeChange}
        onDelete={nodeData?.onDelete}
        onReplace={onReplace}
        onBackgroundColorChange={onBackgroundColorChange}
        onFontTypeChange={onFontTypeChange}
        onBoldToggle={onBoldToggle}
        onItalicToggle={onItalicToggle}
        onBulletListToggle={onBulletListToggle}
        onNumberedListToggle={onNumberedListToggle}
        onHorizontalRuleInsert={onHorizontalRuleInsert}
        backgroundColor={backgroundColor}
        selected={selected}
        type={nodeType}
        fontType={fontType}
        getContent={nodeData?.getContent}
        getRichContent={getRichContent}
        onToggleFullscreen={onToggleFullscreen}
        onEditStart={onEditStart}
        hasImage={hasImage}
      />

      {/* 节点内容 */}
      <div className="w-full h-full p-2 flex items-center justify-center">
        {children}
      </div>

      {/* 输出连接点 */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-gray-800"
      />
    </div>
  );
});

NodeBase.displayName = 'NodeBase';
