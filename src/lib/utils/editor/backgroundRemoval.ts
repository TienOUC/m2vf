// 背景去除功能相关工具函数
import type { Node, Edge } from '@xyflow/react';
import type { ImageNodeData } from '@/components/editor/nodes/ImageNode';
import {
  BackgroundRemovalNodeOptions,
  NodeIdCounterOptions
} from '@/lib/types/editor/backgroundRemoval';

/**
 * 生成唯一的新节点ID
 * @param nodes 当前节点列表
 * @returns 唯一的节点ID
 */
export const generateUniqueNodeId = (nodes: Node[]): string => {
  const maxNodeId = Math.max(
    ...nodes.map(node => {
      const match = node.id.match(/^node-(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    }),
    0 // 默认值，避免空数组时的错误
  );
  // 添加时间戳的最后4位，确保即使快速点击也能生成唯一ID
  const timestampSuffix = Date.now().toString().slice(-4);
  return `node-${maxNodeId + 1}-${timestampSuffix}`;
};

/**
 * 计算新节点的位置
 * @param originalNode 原始节点
 * @param offset 偏移量
 * @returns 新节点的位置
 */
export const calculateNewNodePosition = (
  originalNode: Node,
  offset: number = 250
): { x: number; y: number } => {
  return {
    x: originalNode.position.x + offset,
    y: originalNode.position.y
  };
};

/**
 * 创建新的背景去除节点
 * @param options 背景去除节点创建选项
 * @param newNodeId 新节点ID
 * @param position 新节点位置
 * @returns 新节点
 */
export const createBackgroundRemovalNode = (
  options: BackgroundRemovalNodeOptions,
  newNodeId: string,
  position: { x: number; y: number }
): Node<ImageNodeData> => {
  const { handleDelete, handleImageUpdate, handleEditStart, handleCropStart, handleDownload } = options;
  
  return {
    id: newNodeId,
    type: 'image',
    position,
    data: {
      label: '图片节点',
      imageUrl: undefined,
      isLoading: true,
      onDelete: handleDelete,
      onImageUpdate: handleImageUpdate,
      onReplace: () => {},
      onEditStart: handleEditStart,
      onCropStart: handleCropStart,
      onDownload: handleDownload,
      onBackgroundRemove: undefined // 避免循环引用
    }
  };
};

/**
 * 创建连接边
 * @param sourceId 源节点ID
 * @param targetId 目标节点ID
 * @returns 连接边
 */
export const createConnectionEdge = (
  sourceId: string,
  targetId: string
): Edge => {
  return {
    id: `edge-${sourceId}-${targetId}`,
    source: sourceId,
    target: targetId,
    type: 'default'
  };
};

/**
 * 更新节点ID计数器
 * @param options 节点ID计数器更新选项
 * @param nodes 当前节点列表
 * @param newNodeId 新节点ID
 */
export const updateNodeIdCounter = (
  options: NodeIdCounterOptions,
  nodes: Node[],
  newNodeId: string
): void => {
  const { setNodeIdCounter } = options;
  
  const maxNodeId = Math.max(
    ...nodes.map(node => {
      const match = node.id.match(/^node-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    }),
    parseInt(newNodeId.match(/^node-(\d+)/)?.[1] || '0', 10) // 确保包含新创建的节点ID
  );
  
  setNodeIdCounter(maxNodeId + 1);
};
