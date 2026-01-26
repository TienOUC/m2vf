import { useState, useCallback } from 'react';
import { useNodeCentering } from '@/hooks/editor/useNodeCentering';

export interface EraseOperations {
  isErasing: boolean;
  erasingError: string | null;
  erasingNode: { id: string; imageUrl: string } | null;
  handleEraseEditStart: (nodeId: string) => Promise<boolean>;
  handleEraseStart: (nodeId: string, imageUrl: string) => void;
  setErasingNode: (node: { id: string; imageUrl: string } | null) => void;
}

export const useEraseOperations = (centerNode: ReturnType<typeof useNodeCentering>): EraseOperations => {
  const [isErasing, setIsErasing] = useState(false);
  const [erasingError, setErasingError] = useState<string | null>(null);
  const [erasingNode, setErasingNode] = useState<{ id: string; imageUrl: string } | null>(null);

  const handleEraseEditStart = useCallback(async (nodeId: string) => {
    if (isErasing) {
      console.warn('擦除操作正在进行中，请等待完成');
      return false;
    }

    setIsErasing(true);
    setErasingError(null);

    try {
      await centerNode(nodeId, {
        onCenteringComplete: (centeredNodeId) => {
          console.log(`节点 ${centeredNodeId} 居中完成`);
        },
        onCenteringError: (centeredNodeId, error) => {
          console.error(`节点 ${centeredNodeId} 居中失败:`, error);
          setErasingError(`画布居中失败: ${error.message}`);
        }
      });
      
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '居中操作失败';
      console.error('擦除流程中的居中操作失败:', error);
      setErasingError(errorMsg);
      return false;
    } finally {
      setIsErasing(false);
    }
  }, [centerNode, isErasing]);

  const handleEraseStart = useCallback((nodeId: string, imageUrl: string) => {
    setErasingNode({ id: nodeId, imageUrl });
  }, []);

  return {
    isErasing,
    erasingError,
    erasingNode,
    handleEraseEditStart,
    handleEraseStart,
    setErasingNode
  };
};
