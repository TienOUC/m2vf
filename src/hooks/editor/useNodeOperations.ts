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

  // 新增：图片背景去除功能
  const handleBackgroundRemove = useCallback(async (nodeId: string) => {
    console.log('开始处理背景去除，节点ID:', nodeId);
    
    setNodes((nds) => {
      const originalNode = nds.find((node) => node.id === nodeId);
      if (!originalNode || !originalNode.data.imageUrl) {
        console.warn('未找到图片节点或图片URL');
        return nds;
      }

      // 标记原始节点为加载中状态
      return nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              isLoading: true,
              error: undefined
            }
          };
        }
        return node;
      });
    });

    try {
      // 使用函数式更新获取最新的nodes和edges状态
      const currentNodes = nodes;
      const currentEdges = edges;
      
      // 找到原始节点
      const originalNode = currentNodes.find((node) => node.id === nodeId);
      if (!originalNode || originalNode.type !== 'image' || !originalNode.data.imageUrl || typeof originalNode.data.imageUrl !== 'string') {
        throw new Error('未找到图片节点或图片URL');
      }

      console.log('开始调用背景去除API，图片URL:', originalNode.data.imageUrl);
      
      // 调用API去除背景
      const processedImageUrl = await removeImageBackground(originalNode.data.imageUrl);
      
      console.log('背景去除成功，处理后的图片URL:', processedImageUrl);

      // 计算新节点的位置：根据已存在的目标节点数量确定偏移量
      const existingTargetNodes = currentEdges.filter(edge => edge.source === nodeId);
      const nodeOffset = (existingTargetNodes.length + 1) * 200; // 每个新节点向右偏移200px
      
      // 创建新的图片节点
      const newNodeId = `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newNode: Node = {
        id: newNodeId,
        type: 'image',
        position: {
          x: originalNode.position.x + originalNode.width! + nodeOffset,
          y: originalNode.position.y
        },
        data: {
          label: `背景去除结果 ${existingTargetNodes.length + 1}`,
          imageUrl: processedImageUrl,
          onDelete: handleDelete,
          onReplace: handleReplace,
          onImageUpdate: handleImageUpdate,
          onDownload: handleDownload,
          onBackgroundRemove: handleBackgroundRemove,
          onEditStart: originalNode.data.onEditStart,
          onCropStart: originalNode.data.onCropStart,
          isLoading: false
        },
        width: originalNode.width,
        height: originalNode.height
      };

      // 创建连接边
      const newEdge: Edge = {
        id: `edge-${nodeId}-${newNodeId}-${Date.now()}`,
        source: nodeId,
        target: newNodeId,
        animated: true
      };

      // 更新节点和边
      setNodes((nds) => [...nds, newNode]);
      setEdges((eds) => [...eds, newEdge]);

      // 移除原始节点的加载状态
      setNodes((nds) => 
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                isLoading: false
              }
            };
          }
          return node;
        })
      );
    } catch (error) {
      console.error('去除背景失败:', error);

      // 更新节点状态为错误
      setNodes((nds) => 
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                isLoading: false,
                error: error instanceof Error ? error.message : '去除背景失败'
              }
            };
          }
          return node;
        })
      );
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