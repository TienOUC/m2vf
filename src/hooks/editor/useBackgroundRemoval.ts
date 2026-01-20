import { useCallback } from 'react';
import { removeImageBackground } from '@/lib/api/client/ai'; 
import {
  BackgroundRemovalOptions,
  BackgroundRemovalResult
} from '@/lib/types/editor/backgroundRemoval';
import {
  generateUniqueNodeId,
  calculateNewNodePosition,
  createBackgroundRemovalNode,
  createConnectionEdge,
  updateNodeIdCounter
} from '@/lib/utils/editor/backgroundRemoval';

/**
 * 图片背景去除功能Hook
 * 提供图片背景去除的完整逻辑，包括创建新节点、调用API、更新状态等
 */
export const useBackgroundRemoval = ({
  setNodes,
  setEdges,
  handleDelete,
  handleImageUpdate,
  handleDownload,
  handleEditStart,
  handleCropStart,
  setNodeIdCounter,
  simulateBackendRequest = false
}: BackgroundRemovalOptions): BackgroundRemovalResult => {
  /**
   * 处理图片背景去除
   * @param originalNodeId 原始图片节点ID
   */
  const handleBackgroundRemove = useCallback((originalNodeId: string) => {
    // 使用setNodes回调获取最新的节点列表
    setNodes(nds => {
      // 找到原图片节点
      const originalNode = nds.find(node => node.id === originalNodeId);
      
      if (!originalNode || !originalNode.data?.imageUrl) {
        console.error('找不到原图片节点或节点没有图片URL');
        return nds;
      }
      
      // 生成唯一的新节点ID
      const newNodeId = generateUniqueNodeId(nds);
      
      // 计算新节点的位置
      const newNodePosition = calculateNewNodePosition(originalNode);
      
      // 创建新节点
      const newNode = createBackgroundRemovalNode(
        { handleDelete, handleImageUpdate, handleEditStart, handleCropStart, handleDownload },
        newNodeId,
        newNodePosition
      );
      
      // 创建连接线
      const newEdge = createConnectionEdge(originalNodeId, newNodeId);
      
      // 添加新边，确保不重复
      setEdges(eds => {
        // 检查是否已经存在相同的边
        const edgeExists = eds.some(edge => edge.id === newEdge.id);
        if (!edgeExists) {
          return [...eds, newEdge];
        }
        return eds;
      });
      
      // 更新nodeId计数器
      updateNodeIdCounter({ setNodeIdCounter }, nds, newNodeId);
      
      // 模拟后端请求或调用真实API
      const processImage = async () => {
        try {
          let processedImageUrl: string;
          
          if (simulateBackendRequest) {
            // 模拟后端处理延迟
            await new Promise(resolve => setTimeout(resolve, 1000));
            // 返回模拟结果
            processedImageUrl = '/test-images/cat-no-bg.png';
          } else {
            // 调用真实的API
            processedImageUrl = await removeImageBackground(originalNode.data.imageUrl as string);
          }
          
          // 更新新节点的图片
          setNodes(nds => {
            return nds.map(node => {
              if (node.id === newNodeId) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    imageUrl: processedImageUrl,
                    isLoading: false,
                    isProcessing: false
                  }
                };
              }
              return node;
            });
          });
        } catch (error) {
          console.error('抠图处理失败:', error);
          // 更新节点状态为错误
          setNodes(nds => {
            return nds.map(node => {
              if (node.id === newNodeId) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    isLoading: false,
                    isProcessing: false,
                    error: '抠图处理失败，请重试'
                  }
                };
              }
              return node;
            });
          });
        }
      };
      
      // 开始处理图片
      processImage();
      
      // 返回更新后的节点列表
      return [...nds, newNode];
    });
  }, [setNodes, setEdges, handleDelete, handleImageUpdate, handleDownload, handleEditStart, handleCropStart, setNodeIdCounter, simulateBackendRequest]);

  return {
    handleBackgroundRemove
  };
};
