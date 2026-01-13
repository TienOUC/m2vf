import { useCallback, useState, useRef } from 'react';
import { Node, Edge, useNodesState, useEdgesState } from '@xyflow/react';
import { NodeOperations, FontType } from '@/lib/types/editor/nodeOperations';
import { downloadImage } from '@/lib/utils/image';
import { removeImageBackground } from '@/lib/api/client/ai';

export const useNodeOperations = (): NodeOperations => {
  // 使用类型断言来解决 React Flow 的类型推断问题
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);
  
  const editingNodeIds = useRef<Set<string>>(new Set());
  const [isAnyEditing, setIsAnyEditing] = useState(false);

  const handleReplace = useCallback((nodeId: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              needsUpdate: true
            }
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const handleImageUpdate = useCallback((nodeId: string, imageUrl: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              imageUrl: imageUrl
            }
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const handleDelete = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
    );
  }, [setNodes, setEdges]);

  const handleBackgroundColorChange = useCallback((nodeId: string, color: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              backgroundColor: color,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const handleFontTypeChange = useCallback((nodeId: string, fontType: FontType) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              fontType: fontType,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);



  const handleEditingChange = useCallback((nodeId: string, editing: boolean) => {
    if (editing) {
      editingNodeIds.current.add(nodeId);
    } else {
      editingNodeIds.current.delete(nodeId);
    }
    setIsAnyEditing(editingNodeIds.current.size > 0);
  }, []);

  const handleCropComplete = useCallback((nodeId: string, croppedImageUrl: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              imageUrl: croppedImageUrl,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // 新增：图片下载功能
  const handleDownload = useCallback((nodeId: string) => {
    setNodes((nds) => {
      const targetNode = nds.find((node) => node.id === nodeId);
      if (targetNode && targetNode.data.imageUrl) {
        // 触发下载
        downloadImage(targetNode.data.imageUrl as string);
      }
      return nds;
    });
  }, [setNodes]);

  // 新增：图片背景去除功能 - 改进版，支持即时创建空白节点和扫描动画
  const handleBackgroundRemove = useCallback(async (nodeId: string) => {
    console.log('开始处理背景去除，节点ID:', nodeId);
    
    // 步骤1: 立即创建空白节点并显示扫描动画
    let processingNodeId: string | null = null;
    
    setNodes((nds) => {
      const originalNode = nds.find((node) => node.id === nodeId);
      if (!originalNode || !originalNode.data.imageUrl) {
        console.warn('未找到图片节点或图片URL');
        return nds;
      }

      // 计算新节点的位置
      const existingTargetNodes = nds.filter(node => 
        node.id !== nodeId && 
        typeof node.data.label === 'string' && 
        node.data.label.includes('背景去除结果')
      );
      const nodeOffset = (existingTargetNodes.length + 1) * 200;
      
      // 创建处理中的空白节点
      processingNodeId = `image-processing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const processingNode: Node = {
        id: processingNodeId,
        type: 'image',
        position: {
          x: originalNode.position.x + originalNode.width! + nodeOffset,
          y: originalNode.position.y
        },
        data: {
          label: `处理中...`,
          imageUrl: '', // 空白图片URL
          onDelete: handleDelete,
          onReplace: handleReplace,
          onImageUpdate: handleImageUpdate,
          onDownload: handleDownload,
          onBackgroundRemove: handleBackgroundRemove,
          isLoading: true,
          isProcessing: true, // 新增：标记为处理中状态
          processingProgress: 0 // 新增：处理进度
        },
        width: originalNode.width,
        height: originalNode.height
      };

      // 创建连接边
      const newEdge: Edge = {
        id: `edge-${nodeId}-${processingNodeId}-${Date.now()}`,
        source: nodeId,
        target: processingNodeId,
        animated: true
      };

      // 更新节点和边
      setEdges((eds) => [...eds, newEdge]);
      return [...nds, processingNode];
    });

    try {
      // 步骤2: 发起API请求
      const currentNodes = nodes;
      const originalNode = currentNodes.find((node) => node.id === nodeId);
      if (!originalNode || originalNode.type !== 'image' || !originalNode.data.imageUrl || typeof originalNode.data.imageUrl !== 'string') {
        throw new Error('未找到图片节点或图片URL');
      }

      console.log('开始调用背景去除API，图片URL:', originalNode.data.imageUrl);
      
      // 步骤3: 同时进行API调用和动画更新
      const apiPromise = removeImageBackground(originalNode.data.imageUrl);
      
      // 模拟进度更新（实际应用中可以根据API响应进度更新）
      const progressInterval = setInterval(() => {
        if (processingNodeId) {
          setNodes((nds) => 
            nds.map((node) => {
              if (node.id === processingNodeId && node.data.isProcessing) {
                const currentProgress = typeof node.data.processingProgress === 'number' ? node.data.processingProgress : 0;
                const newProgress = Math.min(currentProgress + 10, 80); // 最大到80%，等待API完成
                return {
                  ...node,
                  data: {
                    ...node.data,
                    processingProgress: newProgress
                  }
                };
              }
              return node;
            })
          );
        }
      }, 300);

      // 等待API完成
      const processedImageUrl = await apiPromise;
      clearInterval(progressInterval);
      
      console.log('背景去除成功，处理后的图片URL:', processedImageUrl);

      // 步骤4: API完成后更新节点状态
      if (processingNodeId) {
        setNodes((nds) => 
          nds.map((node) => {
            if (node.id === processingNodeId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  label: `背景去除结果`,
                  imageUrl: processedImageUrl,
                  isLoading: false,
                  isProcessing: false,
                  processingProgress: 100
                }
              };
            }
            return node;
          })
        );
      }
    } catch (error) {
      console.error('去除背景失败:', error);

      // 处理错误：更新节点状态为错误
      if (processingNodeId) {
        setNodes((nds) => 
          nds.map((node) => {
            if (node.id === processingNodeId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  label: `处理失败`,
                  isLoading: false,
                  isProcessing: false,
                  error: error instanceof Error ? error.message : '去除背景失败',
                  processingProgress: 0
                }
              };
            }
            return node;
          })
        );
      }
    }
  }, [nodes, setNodes, setEdges, handleDelete, handleReplace, handleImageUpdate, handleDownload]);

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    handleReplace,
    handleImageUpdate,
    handleDelete,
    handleBackgroundColorChange,
    handleFontTypeChange,
    handleEditingChange,
    handleCropComplete,
    handleDownload,
    handleBackgroundRemove,
    isAnyEditing,
    editingNodeIds
  };
};