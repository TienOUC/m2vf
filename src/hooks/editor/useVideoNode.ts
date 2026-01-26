'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Node } from '@xyflow/react';
import { useImageNodesStore } from '@/lib/stores/imageNodesStore';
import { useVideoNodesStore } from '@/lib/stores/videoNodesStore';
import { useEdgesStore } from '@/lib/stores/edgesStore';

interface UseVideoNodeProps {
  nodes: Node[];
  setNodes: (nodes: Node[] | ((prevNodes: Node[]) => Node[])) => void;
  setEdges: (edges: any[] | ((prevEdges: any[]) => any[])) => void;
  nodeId: number;
  setNodeId: (nodeId: number | ((prevId: number) => number)) => void;
  handleDelete: (nodeId: string) => void;
  handleImageUpdate: (nodeId: string, imageUrl: string) => void;
  handleDownload: (nodeId: string) => void;
  handleEditStart: (nodeId: string) => void;
  handleCropStart: (nodeId: string, imageUrl: string) => void;
  handleEraseStart: (nodeId: string, imageUrl: string) => void;
  handleBackgroundRemove: (nodeId: string) => void;
}

export const useVideoNode = ({
  nodes,
  setNodes,
  setEdges,
  nodeId,
  setNodeId,
  handleDelete,
  handleImageUpdate,
  handleDownload,
  handleEditStart,
  handleCropStart,
  handleEraseStart,
  handleBackgroundRemove
}: UseVideoNodeProps) => {
  // 使用ref保存最新的回调函数，避免依赖循环
  const handleFirstLastFrameGenerateRef = useRef<(videoNodeId: string) => void>();
  const handleFirstFrameGenerateRef = useRef<(videoNodeId: string) => void>();

  // 处理首尾帧生成视频事件
  const handleFirstLastFrameGenerate = useCallback((videoNodeId: string) => {
    console.log('处理首尾帧生成视频事件', videoNodeId);
    // 找到触发事件的视频节点
    const videoNode = nodes.find(node => node.id === videoNodeId);
    if (!videoNode) return;

    // 计算新图片节点的位置（视频节点左侧，上下排列）
    const firstFramePos = {
      x: videoNode.position.x - 200,
      y: videoNode.position.y - 50
    };
    const lastFramePos = {
      x: videoNode.position.x - 200,
      y: videoNode.position.y + 100
    };

    // 生成唯一ID
    const timestampSuffix = Date.now().toString().slice(-4);
    const firstFrameNodeId = `node-${nodeId}-${timestampSuffix}-first`;
    const lastFrameNodeId = `node-${nodeId}-${timestampSuffix}-last`;

    // 创建首帧图片节点
    const firstFrameNode: Node = {
      id: firstFrameNodeId,
      type: 'image' as const,
      position: firstFramePos,
      data: {
        label: '图片节点',
        imageUrl: undefined,
        onDelete: handleDelete,
        onImageUpdate: handleImageUpdate,
        onDownload: handleDownload,
        onReplace: (id: string) => {
          console.log(`替换节点 ${id} 的文件`);
        },
        onEditStart: handleEditStart,
        onCropStart: handleCropStart,
        onEraseStart: handleEraseStart,
        onBackgroundRemove: handleBackgroundRemove,
        // 添加首尾帧标识
        frameType: 'first' as const
      }
    };

    // 创建尾帧图片节点
    const lastFrameNode: Node = {
      id: lastFrameNodeId,
      type: 'image' as const,
      position: lastFramePos,
      data: {
        label: '图片节点',
        imageUrl: undefined,
        onDelete: handleDelete,
        onImageUpdate: handleImageUpdate,
        onDownload: handleDownload,
        onReplace: (id: string) => {
          console.log(`替换节点 ${id} 的文件`);
        },
        onEditStart: handleEditStart,
        onCropStart: handleCropStart,
        onEraseStart: handleEraseStart,
        onBackgroundRemove: handleBackgroundRemove,
        // 添加首尾帧标识
        frameType: 'last' as const
      }
    };

    // 添加新节点
    setNodes(prevNodes => {
      // 添加新的图片节点
      return [...prevNodes, firstFrameNode, lastFrameNode];
    });

    // 添加连接
    const newEdges = [
      {
        id: `${firstFrameNodeId}-${videoNodeId}`,
        source: firstFrameNodeId,
        target: videoNodeId,
        type: 'simplebezier' as const
      },
      {
        id: `${lastFrameNodeId}-${videoNodeId}`,
        source: lastFrameNodeId,
        target: videoNodeId,
        type: 'simplebezier' as const
      }
    ];

    setEdges(prevEdges => [...prevEdges, ...newEdges]);

    // 更新全局存储
    setTimeout(() => {
      const imageNodesStore = useImageNodesStore.getState();
      imageNodesStore.setImageNode(firstFrameNodeId, {
        id: firstFrameNodeId,
        imageUrl: undefined,
        position: firstFramePos,
        frameType: 'first'
      });
      imageNodesStore.setImageNode(lastFrameNodeId, {
        id: lastFrameNodeId,
        imageUrl: undefined,
        position: lastFramePos,
        frameType: 'last'
      });
      
      // 更新视频节点的连接状态到全局状态
      const videoNodesStore = useVideoNodesStore.getState() as any;
      videoNodesStore.setVideoNode(videoNodeId, { hasConnectedFrameNodes: true });
      
      // 更新边存储
      const edgesStore = useEdgesStore.getState();
      edgesStore.setEdges([...edgesStore.getAllEdges(), ...newEdges]);
    }, 0);

    // 更新nodeId，确保后续节点ID唯一
    setNodeId(prevId => prevId + 1);
  }, [nodes, setNodes, setEdges, handleDelete, handleImageUpdate, handleDownload, handleEditStart, handleCropStart, handleEraseStart, handleBackgroundRemove, nodeId, setNodeId]);

  // 处理首帧生成视频事件
  const handleFirstFrameGenerate = useCallback((videoNodeId: string) => {
    console.log('处理首帧生成视频事件', videoNodeId);
    // 找到触发事件的视频节点
    const videoNode = nodes.find(node => node.id === videoNodeId);
    if (!videoNode) return;

    // 计算新图片节点的位置（视频节点左侧）
    const firstFramePos = {
      x: videoNode.position.x - 200,
      y: videoNode.position.y
    };

    // 生成唯一ID
    const timestampSuffix = Date.now().toString().slice(-4);
    const firstFrameNodeId = `node-${nodeId}-${timestampSuffix}-first`;

    // 创建首帧图片节点
    const firstFrameNode: Node = {
      id: firstFrameNodeId,
      type: 'image' as const,
      position: firstFramePos,
      data: {
        label: '图片节点',
        imageUrl: undefined,
        onDelete: handleDelete,
        onImageUpdate: handleImageUpdate,
        onDownload: handleDownload,
        onReplace: (id: string) => {
          console.log(`替换节点 ${id} 的文件`);
        },
        onEditStart: handleEditStart,
        onCropStart: handleCropStart,
        onEraseStart: handleEraseStart,
        onBackgroundRemove: handleBackgroundRemove,
        // 添加首帧标识
        frameType: 'first' as const
      }
    };

    // 添加新节点
    setNodes(prevNodes => {
      // 添加新的图片节点
      return [...prevNodes, firstFrameNode];
    });

    // 添加连接
    const newEdges = [
      {
        id: `${firstFrameNodeId}-${videoNodeId}`,
        source: firstFrameNodeId,
        target: videoNodeId,
        type: 'simplebezier' as const
      }
    ];

    setEdges(prevEdges => [...prevEdges, ...newEdges]);

    // 更新全局存储
    setTimeout(() => {
      const imageNodesStore = useImageNodesStore.getState();
      imageNodesStore.setImageNode(firstFrameNodeId, {
        id: firstFrameNodeId,
        imageUrl: undefined,
        position: firstFramePos,
        frameType: 'first'
      });
      
      // 更新视频节点的连接状态到全局状态
      const videoNodesStore = useVideoNodesStore.getState() as any;
      videoNodesStore.setVideoNode(videoNodeId, { hasConnectedFrameNodes: true });
      
      // 更新边存储
      const edgesStore = useEdgesStore.getState();
      edgesStore.setEdges([...edgesStore.getAllEdges(), ...newEdges]);
    }, 0);

    // 更新nodeId，确保后续节点ID唯一
    setNodeId(prevId => prevId + 1);
  }, [nodes, setNodes, setEdges, handleDelete, handleImageUpdate, handleDownload, handleEditStart, handleCropStart, handleEraseStart, handleBackgroundRemove, nodeId, setNodeId]);

  // 更新ref中的回调函数
  useEffect(() => {
    handleFirstLastFrameGenerateRef.current = handleFirstLastFrameGenerate;
    handleFirstFrameGenerateRef.current = handleFirstFrameGenerate;
  }, [handleFirstLastFrameGenerate, handleFirstFrameGenerate]);

  // 确保所有视频节点都有必要的回调函数
  const initializeVideoNodes = useCallback(() => {
    setNodes(prevNodes => {
      let hasUpdates = false;
      const updatedNodes = prevNodes.map(node => {
        if (node.type === 'video' && node.data) {
          // 检查是否需要更新回调函数
          const needsFirstLastFrameUpdate = typeof node.data.onFirstLastFrameGenerate !== 'function';
          const needsFirstFrameUpdateOnly = typeof node.data.onFirstFrameGenerate !== 'function';
          
          if (needsFirstLastFrameUpdate || needsFirstFrameUpdateOnly) {
            hasUpdates = true;
            return {
              ...node,
              data: {
                ...node.data,
                ...(needsFirstLastFrameUpdate && {
                  onFirstLastFrameGenerate: (videoNodeId: string) => {
                    // 调用ref中的最新回调函数
                    if (handleFirstLastFrameGenerateRef.current) {
                      handleFirstLastFrameGenerateRef.current(videoNodeId);
                    }
                  }
                }),
                ...(needsFirstFrameUpdateOnly && {
                  onFirstFrameGenerate: (videoNodeId: string) => {
                    // 调用ref中的最新回调函数
                    if (handleFirstFrameGenerateRef.current) {
                      handleFirstFrameGenerateRef.current(videoNodeId);
                    }
                  }
                })
              }
            };
          }
        }
        return node;
      });
      // 只有当确实需要更新节点时才返回新的节点列表，避免不必要的更新
      return hasUpdates ? updatedNodes : prevNodes;
    });
  }, [setNodes]);

  return {
    handleFirstLastFrameGenerate,
    handleFirstFrameGenerate,
    handleFirstLastFrameGenerateRef,
    handleFirstFrameGenerateRef,
    initializeVideoNodes
  };
};
