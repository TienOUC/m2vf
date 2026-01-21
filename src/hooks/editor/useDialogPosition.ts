'use client';

import { useState, useCallback, useEffect } from 'react';
import { type Node } from '@xyflow/react';

export interface DialogPosition {
  x: number;
  y: number;
}

interface UseDialogPositionProps {
  selectedNode: Node | null;
  isVisible: boolean;
}

export const useDialogPosition = ({ selectedNode, isVisible }: UseDialogPositionProps) => {
  const [dialogPosition, setDialogPosition] = useState<DialogPosition>({ x: 0, y: 0 });

  // 优化：直接从节点元素计算对话框位置，确保实时跟随
  const updateDialogPositionFromNodeData = useCallback(() => {
    if (!selectedNode) return;

    // 直接使用requestAnimationFrame更新位置，确保平滑跟随
    requestAnimationFrame(() => {
      setDialogPosition(prevPosition => {
        // 查找节点元素
        const nodeElement = document.querySelector(`[data-id="${selectedNode.id}"]`);
        if (nodeElement) {
          const rect = nodeElement.getBoundingClientRect();
          const newPosition = {
            x: rect.left + rect.width / 2,
            y: rect.bottom
          };
          
          // 只有位置变化超过1像素时才更新，减少不必要的重绘
          if (Math.abs(newPosition.x - prevPosition.x) > 1 || Math.abs(newPosition.y - prevPosition.y) > 1) {
            return newPosition;
          }
        }
        return prevPosition;
      });
    });
  }, [selectedNode]);

  // 监听节点位置变化，更新对话框位置
  useEffect(() => {
    if (selectedNode && isVisible) {
      updateDialogPositionFromNodeData();
    }
  }, [selectedNode, isVisible, updateDialogPositionFromNodeData]);

  // 添加节点拖动监听，实时更新对话框位置
  useEffect(() => {
    if (!selectedNode || !isVisible) return;

    let animationFrameId: number;
    
    // 持续监听节点位置变化
    const startMonitoring = () => {
      animationFrameId = requestAnimationFrame(() => {
        updateDialogPositionFromNodeData();
        startMonitoring(); // 递归调用，持续更新
      });
    };
    
    startMonitoring();
    
    // 清理函数
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [selectedNode, isVisible, updateDialogPositionFromNodeData]);

  // 监听画布移动，更新对话框位置
  const handleMoveEnd = useCallback(() => {
    if (selectedNode && isVisible) {
      updateDialogPositionFromNodeData();
    }
  }, [selectedNode, isVisible, updateDialogPositionFromNodeData]);

  return {
    dialogPosition,
    updateDialogPositionFromNodeData,
    handleMoveEnd
  };
};
