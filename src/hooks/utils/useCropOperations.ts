import { useState, useCallback } from 'react';
import { useNodeCentering } from './useNodeCentering';

export interface CropOperations {
  isCropping: boolean;
  croppingError: string | null;
  croppingNode: { id: string; imageUrl: string } | null;
  handleEditStart: (nodeId: string) => Promise<boolean>;
  handleCropStart: (nodeId: string, imageUrl: string) => void;
  handleCropComplete: (nodeId: string, croppedImageUrl: string) => void;
  setCroppingNode: (node: { id: string; imageUrl: string } | null) => void;
}

export const useCropOperations = (centerNode: ReturnType<typeof useNodeCentering>): CropOperations => {
  const [isCropping, setIsCropping] = useState(false);
  const [croppingError, setCroppingError] = useState<string | null>(null);
  const [croppingNode, setCroppingNode] = useState<{ id: string; imageUrl: string } | null>(null);

  const handleEditStart = useCallback(async (nodeId: string) => {
    if (isCropping) {
      console.warn('裁剪操作正在进行中，请等待完成');
      return false;
    }

    setIsCropping(true);
    setCroppingError(null);

    try {
      await centerNode(nodeId, {
        onCenteringComplete: (centeredNodeId) => {
          console.log(`节点 ${centeredNodeId} 居中完成`);
        },
        onCenteringError: (centeredNodeId, error) => {
          console.error(`节点 ${centeredNodeId} 居中失败:`, error);
          setCroppingError(`画布居中失败: ${error.message}`);
        }
      });
      
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '居中操作失败';
      console.error('裁剪流程中的居中操作失败:', error);
      setCroppingError(errorMsg);
      return false;
    } finally {
      setIsCropping(false);
    }
  }, [centerNode, isCropping]);

  const handleCropStart = useCallback((nodeId: string, imageUrl: string) => {
    setCroppingNode({ id: nodeId, imageUrl });
  }, []);

  const handleCropComplete = useCallback((nodeId: string, croppedImageUrl: string) => {
    setCroppingNode(null);
  }, []);

  return {
    isCropping,
    croppingError,
    croppingNode,
    handleEditStart,
    handleCropStart,
    handleCropComplete,
    setCroppingNode
  };
};