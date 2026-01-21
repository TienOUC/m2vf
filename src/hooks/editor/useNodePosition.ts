'use client';

import { useState, useEffect } from 'react';
import { type Node } from '@xyflow/react';

interface UseNodePositionProps {
  nodes: Node[];
}

interface UseNodePositionReturn {
  nodeId: number;
  setNodeId: (nodeId: number | ((prevId: number) => number)) => void;
  generateUniqueNodeId: (prefix?: string) => string;
  calculateNewNodePosition: (referenceNode: Node | null, position?: 'left' | 'right' | 'top' | 'bottom') => { x: number; y: number };
  calculateFrameNodePositions: (videoNode: Node) => { firstFramePos: { x: number; y: number }; lastFramePos: { x: number; y: number } };
}

export const useNodePosition = ({ nodes }: UseNodePositionProps): UseNodePositionReturn => {
  // 初始化nodeId，考虑已有的节点和持久化节点，避免重复ID
  const [nodeId, setNodeId] = useState(() => {
    return 1;
  });

  // 监听节点变化，确保nodeId始终比现有节点的最大ID大1
  useEffect(() => {
    if (nodes.length > 0) {
      // 从现有的节点中找出最大的ID值，支持带时间戳的ID格式：node-123-4567
      const maxId = nodes.reduce((max, node) => {
        const idMatch = node.id.match(/node-(\d+)(?:-\d+)?$/);
        if (idMatch) {
          const numId = parseInt(idMatch[1], 10);
          return numId > max ? numId : max;
        }
        return max;
      }, 0);
      // 更新nodeId，确保新节点ID唯一
      setNodeId(maxId + 1);
    } else {
      // 如果没有节点，重置为1
      setNodeId(1);
    }
  }, [nodes]);

  // 生成唯一ID的辅助函数
  const generateUniqueNodeId = (prefix: string = '') => {
    const timestampSuffix = Date.now().toString().slice(-4);
    const newId = `node-${nodeId}-${timestampSuffix}${prefix ? `-${prefix}` : ''}`;
    // 立即更新nodeId，确保下次生成的ID不同
    setNodeId(prevId => prevId + 1);
    return newId;
  };

  // 计算相对于现有节点的新位置
  const calculateNewNodePosition = (referenceNode: Node | null, position: 'left' | 'right' | 'top' | 'bottom' = 'right') => {
    if (!referenceNode) {
      return { x: 100, y: 100 }; // 默认位置
    }

    const offset = 200; // 节点间的偏移量
    const verticalOffset = 50; // 垂直方向的微调

    switch (position) {
      case 'left':
        return {
          x: referenceNode.position.x - offset,
          y: referenceNode.position.y
        };
      case 'right':
        return {
          x: referenceNode.position.x + offset,
          y: referenceNode.position.y
        };
      case 'top':
        return {
          x: referenceNode.position.x,
          y: referenceNode.position.y - offset
        };
      case 'bottom':
        return {
          x: referenceNode.position.x,
          y: referenceNode.position.y + offset
        };
      default:
        return {
          x: referenceNode.position.x + offset,
          y: referenceNode.position.y
        };
    }
  };

  // 计算视频节点首尾帧的位置
  const calculateFrameNodePositions = (videoNode: Node) => {
    // 计算新图片节点的位置（视频节点左侧，上下排列）
    const firstFramePos = {
      x: videoNode.position.x - 200,
      y: videoNode.position.y - 50
    };
    const lastFramePos = {
      x: videoNode.position.x - 200,
      y: videoNode.position.y + 100
    };

    return { firstFramePos, lastFramePos };
  };

  return {
    nodeId,
    setNodeId,
    generateUniqueNodeId,
    calculateNewNodePosition,
    calculateFrameNodePositions
  };
};
