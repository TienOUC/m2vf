import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { ImageNodeData } from '@/components/editor/nodes/ImageNode';
import { removeImageBackground } from '@/lib/api/client/ai'; 
import { useRef, useEffect } from 'react';

interface BackgroundRemovalOptions {
  currentNodes: Node[];
  setNodes: (nodes: Node[] | ((prevNodes: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((prevEdges: Edge[]) => Edge[])) => void;
  handleDelete: (nodeId: string) => void;
  handleImageUpdate: (nodeId: string, imageUrl: string) => void;
  handleDownload: (nodeId: string) => void;
  handleEditStart: (nodeId: string) => void;
  handleCropStart: (nodeId: string, imageUrl: string) => void;
  setNodeIdCounter: React.Dispatch<React.SetStateAction<number>>;
  simulateBackendRequest?: boolean;
}

interface BackgroundRemovalResult {
  handleBackgroundRemove: (originalNodeId: string) => void;
}

export const useBackgroundRemoval = ({
  currentNodes,
  setNodes,
  setEdges,
  handleDelete,
  handleImageUpdate,
  handleDownload,
  handleEditStart,
  handleCropStart,
  setNodeIdCounter,
  simulateBackendRequest = true
}: BackgroundRemovalOptions): BackgroundRemovalResult => {
  const currentNodesRef = useRef(currentNodes);
  
  useEffect(() => {
    currentNodesRef.current = currentNodes;
  }, [currentNodes]);
  
  // 生成唯一的新节点ID
  const generateUniqueNodeId = useCallback(() => {
    const maxNodeId = Math.max(
      ...currentNodesRef.current.map(node => {
        const match = node.id.match(/^node-(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      }),
      0 // 默认值，避免空数组时的错误
    );
    return `node-${maxNodeId + 1}`;
  }, [currentNodesRef]);

  // 处理抠图功能
  const handleBackgroundRemove = useCallback((originalNodeId: string) => {
    console.log('开始抠图处理，节点ID:', originalNodeId);
    
    // 生成唯一的新节点ID
    const newNodeId = generateUniqueNodeId();
    
    // 找到原图片节点 - 使用ref获取最新的节点列表
    const originalNode = currentNodesRef.current.find(node => node.id === originalNodeId);
    
    if (!originalNode || !originalNode.data?.imageUrl) {
      console.error('找不到原图片节点或节点没有图片URL');
      return;
    }
    
    // 计算新节点的位置（在原节点右侧200px处）
    const newNodePosition = {
      x: originalNode.position.x + 200,
      y: originalNode.position.y
    };
    
    // 创建新节点
    const newNode: Node<ImageNodeData> = {
      id: newNodeId,
      type: 'image',
      position: newNodePosition,
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
    
    // 添加新节点到画布
    setNodes(nds => [...nds, newNode]);
    
    // 更新nodeId计数器
    const maxNodeId = Math.max(
      ...currentNodesRef.current.map(node => {
        const match = node.id.match(/^node-(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      }),
      parseInt(newNodeId.split('-')[1], 10) // 确保包含新创建的节点ID
    );
    setNodeIdCounter(maxNodeId + 1);
    
    // 创建连接线
    const newEdge: Edge = {
      id: `edge-${originalNodeId}-${newNodeId}`,
      source: originalNodeId,
      target: newNodeId,
      type: 'default'
    };
    setEdges(eds => [...eds, newEdge]);
    
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
          // 由于我们已经在之前检查过originalNode.data?.imageUrl，这里可以安全地使用非空断言
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
                  isLoading: false
                }
              };
            }
            return node;
          });
        });
        
        console.log('抠图处理完成，新节点ID:', newNodeId);
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
                  error: '抠图处理失败，请重试'
                }
              };
            }
            return node;
          });
        });
      }
    };
    
    processImage();
  }, [setNodes, setEdges, handleDelete, handleImageUpdate, handleDownload, handleEditStart, handleCropStart, setNodeIdCounter, generateUniqueNodeId, simulateBackendRequest]);

  return {
    handleBackgroundRemove
  };
};
