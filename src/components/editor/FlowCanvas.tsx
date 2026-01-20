'use client';

import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  ReactFlow,
  Background,
  Controls,
  addEdge,
  type OnConnect,
  type Edge,
  type Node,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';


import { TextNode, ImageNode, VideoNode, FabricImageEditor, NodeInteractionDialog } from '@/components/editor';
import LeftSidebar from '@/components/layout/LeftSidebar';
import { useNodeOperations } from '@/hooks/editor/useNodeOperations';
import { useCropOperations } from '@/hooks/utils/useCropOperations';
import { usePaneInteractions } from '@/hooks/editor/usePaneInteractions';
import { useNodeAddition } from '@/hooks/editor/useNodeAddition';
import { useNodeCentering } from '@/hooks/editor/useNodeCentering';
import { useBackgroundRemoval } from '@/hooks/editor/useBackgroundRemoval'; 
import { useImageNodesStore } from '@/lib/stores/imageNodesStore';
import { useVideoNodesStore } from '@/lib/stores/videoNodesStore';
import { useEdgesStore } from '@/lib/stores/edgesStore';

import FloatingMenu from '@/components/ui/FloatingMenu';
import MenuButton from '@/components/ui/MenuButton';
import { Type, Image, Video } from 'lucide-react';

export interface FlowCanvasProps {
  projectId: string | null;
}

const FlowCanvasContent: React.FC<FlowCanvasProps> = ({ projectId }) => {
  const router = useRouter();
  
  // 确保React Flow组件能够正确获取尺寸信息
  React.useEffect(() => {
    // 强制重新计算布局
    const handleResize = () => {
      window.dispatchEvent(new Event('resize'));
    };
    
    // 初始化时触发一次
    handleResize();
    
    return () => {
      // 清理事件监听器（如果有的话）
    };
  }, []);
  const reactFlowInstance = useReactFlow();
  const { screenToFlowPosition } = reactFlowInstance;

  const centerNode = useNodeCentering(reactFlowInstance);
  
  // 初始化nodeId，考虑已有的节点和持久化节点，避免重复ID
  const [nodeId, setNodeId] = useState(() => {
    return 1;
  });
  
  const cropOperations = useCropOperations(centerNode);
  
  // 创建ref来保存回调函数，这样可以在useEffect中更新
  const callbacksRef = useRef({
    onEditStart: cropOperations.handleEditStart,
    onCropStart: cropOperations.handleCropStart,
    onBackgroundRemove: (nodeId: string) => {}
  });

  // 使用节点操作hook，传入回调函数（使用ref的current值）
  const nodeOperations = useNodeOperations({
    onEditStart: (nodeId: string) => callbacksRef.current.onEditStart(nodeId),
    onCropStart: (nodeId: string, imageUrl: string) => callbacksRef.current.onCropStart(nodeId, imageUrl),
    onBackgroundRemove: (nodeId: string) => callbacksRef.current.onBackgroundRemove(nodeId)
  });

  // 使用背景移除hook
  const { handleBackgroundRemove } = useBackgroundRemoval({
    setNodes: nodeOperations.setNodes,
    setEdges: nodeOperations.setEdges,
    handleDelete: nodeOperations.handleDelete,
    handleImageUpdate: nodeOperations.handleImageUpdate,
    handleDownload: nodeOperations.handleDownload,
    handleEditStart: cropOperations.handleEditStart,
    handleCropStart: cropOperations.handleCropStart,
    setNodeIdCounter: setNodeId,
    simulateBackendRequest: true // 启用模拟后端请求
  });

  // 更新ref中的回调函数
  useEffect(() => {
    callbacksRef.current = {
      onEditStart: cropOperations.handleEditStart,
      onCropStart: cropOperations.handleCropStart,
      onBackgroundRemove: handleBackgroundRemove
    };
  }, [cropOperations.handleEditStart, cropOperations.handleCropStart, handleBackgroundRemove]);
  
  const nodesRef = useRef(nodeOperations.nodes);
  useEffect(() => {
    nodesRef.current = nodeOperations.nodes;
  }, [nodeOperations.nodes]);

  // 监听节点变化，确保nodeId始终比现有节点的最大ID大1
  useEffect(() => {
    if (nodeOperations.nodes.length > 0) {
      // 从现有的节点中找出最大的ID值，支持带时间戳的ID格式：node-123-4567
      const maxId = nodeOperations.nodes.reduce((max, node) => {
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
  }, [nodeOperations.nodes]);

  // 使用ref保存最新的回调函数，避免依赖循环
  const handleFirstLastFrameGenerateRef = useRef<(videoNodeId: string) => void>();

  // 处理首尾帧生成视频事件
  const handleFirstLastFrameGenerate = useCallback((videoNodeId: string) => {
    console.log('处理首尾帧生成视频事件', videoNodeId);
    // 找到触发事件的视频节点
    const videoNode = nodeOperations.nodes.find(node => node.id === videoNodeId);
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
    const firstFrameNode = {
      id: firstFrameNodeId,
      type: 'image' as const,
      position: firstFramePos,
      data: {
        label: '图片节点',
        imageUrl: undefined,
        onDelete: nodeOperations.handleDelete,
        onImageUpdate: nodeOperations.handleImageUpdate,
        onDownload: nodeOperations.handleDownload,
        onReplace: (id: string) => {
          console.log(`替换节点 ${id} 的文件`);
        },
        onEditStart: cropOperations.handleEditStart,
        onCropStart: cropOperations.handleCropStart,
        onBackgroundRemove: handleBackgroundRemove,
        // 添加首尾帧标识
        frameType: 'first' as const
      }
    };

    // 创建尾帧图片节点
    const lastFrameNode = {
      id: lastFrameNodeId,
      type: 'image' as const,
      position: lastFramePos,
      data: {
        label: '图片节点',
        imageUrl: undefined,
        onDelete: nodeOperations.handleDelete,
        onImageUpdate: nodeOperations.handleImageUpdate,
        onDownload: nodeOperations.handleDownload,
        onReplace: (id: string) => {
          console.log(`替换节点 ${id} 的文件`);
        },
        onEditStart: cropOperations.handleEditStart,
        onCropStart: cropOperations.handleCropStart,
        onBackgroundRemove: handleBackgroundRemove,
        // 添加首尾帧标识
        frameType: 'last' as const
      }
    };

    // 添加新节点
    nodeOperations.setNodes(prevNodes => {
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

    nodeOperations.setEdges(prevEdges => [...prevEdges, ...newEdges]);

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
  }, [nodeOperations.nodes, nodeOperations.setNodes, nodeOperations.setEdges, nodeOperations.handleDelete, nodeOperations.handleImageUpdate, nodeOperations.handleDownload, cropOperations.handleEditStart, cropOperations.handleCropStart, handleBackgroundRemove, nodeId, setNodeId]);

  // 处理首帧生成视频事件
  const handleFirstFrameGenerate = useCallback((videoNodeId: string) => {
    console.log('处理首帧生成视频事件', videoNodeId);
    // 找到触发事件的视频节点
    const videoNode = nodeOperations.nodes.find(node => node.id === videoNodeId);
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
    const firstFrameNode = {
      id: firstFrameNodeId,
      type: 'image' as const,
      position: firstFramePos,
      data: {
        label: '图片节点',
        imageUrl: undefined,
        onDelete: nodeOperations.handleDelete,
        onImageUpdate: nodeOperations.handleImageUpdate,
        onDownload: nodeOperations.handleDownload,
        onReplace: (id: string) => {
          console.log(`替换节点 ${id} 的文件`);
        },
        onEditStart: cropOperations.handleEditStart,
        onCropStart: cropOperations.handleCropStart,
        onBackgroundRemove: handleBackgroundRemove,
        // 添加首帧标识
        frameType: 'first' as const
      }
    };

    // 添加新节点
    nodeOperations.setNodes(prevNodes => {
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

    nodeOperations.setEdges(prevEdges => [...prevEdges, ...newEdges]);

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
  }, [nodeOperations.nodes, nodeOperations.setNodes, nodeOperations.setEdges, nodeOperations.handleDelete, nodeOperations.handleImageUpdate, nodeOperations.handleDownload, cropOperations.handleEditStart, cropOperations.handleCropStart, handleBackgroundRemove, nodeId, setNodeId]);

  // 使用ref保存最新的首帧生成视频回调函数，避免依赖循环
  const handleFirstFrameGenerateRef = useRef<(videoNodeId: string) => void>();

  // 更新ref中的回调函数
  useEffect(() => {
    handleFirstLastFrameGenerateRef.current = handleFirstLastFrameGenerate;
    handleFirstFrameGenerateRef.current = handleFirstFrameGenerate;
  }, [handleFirstLastFrameGenerate, handleFirstFrameGenerate]);

  // 确保所有视频节点都有必要的回调函数
  // 只在组件初始化时运行一次，避免监听节点变化导致的无限循环
  useEffect(() => {
    nodeOperations.setNodes(prevNodes => {
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
  }, []); // 空依赖数组，只在组件挂载时运行一次

  const { addTextNode, addImageNode, addVideoNode } = useNodeAddition({
    nodeId,
    setNodeId,
    setNodes: nodeOperations.setNodes,
    handleDelete: nodeOperations.handleDelete,
    handleBackgroundColorChange: nodeOperations.handleBackgroundColorChange,
    handleImageUpdate: nodeOperations.handleImageUpdate,
    handleFontTypeChange: nodeOperations.handleFontTypeChange,
    onEditingChange: nodeOperations.handleEditingChange,
    onEditStart: cropOperations.handleEditStart,
    onCropStart: cropOperations.handleCropStart,
    handleDownload: nodeOperations.handleDownload,
    handleBackgroundRemove: handleBackgroundRemove,
    onFirstLastFrameGenerate: (id) => handleFirstLastFrameGenerateRef.current?.(id),
    onFirstFrameGenerate: (id) => handleFirstFrameGenerateRef.current?.(id)
  });

  const paneInteractions = usePaneInteractions(
    nodeOperations.editingNodeIds,
    nodesRef,
    nodeOperations.onNodesChange
  );
  
  // 对话框状态管理
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [dialogPosition, setDialogPosition] = useState({ x: 0, y: 0 });
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  
  // 优化：直接从节点数据计算对话框位置，避免DOM查询
  const updateDialogPositionFromNodeData = useCallback(() => {
    if (selectedNode) {
      // 计算节点在屏幕上的位置 - 直接使用节点数据，避免DOM查询
      // 这里需要考虑画布的缩放和位移，使用reactFlowInstance的project方法
      // 首先获取节点的中心底部位置
      const nodeCenterBottom = {
        x: selectedNode.position.x + (selectedNode.width || 0) / 2,
        y: selectedNode.position.y + (selectedNode.height || 0)
      };
      
      // 直接使用requestAnimationFrame更新位置，确保平滑跟随
      requestAnimationFrame(() => {
        setDialogPosition(prevPosition => {
          // 如果节点数据没有变化，就不更新位置，减少不必要的重绘
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
    }
  }, [selectedNode]);
  
  // 监听节点位置变化，更新对话框位置
  useEffect(() => {
    if (selectedNode && isDialogVisible) {
      updateDialogPositionFromNodeData();
    }
  }, [nodeOperations.nodes, selectedNode, isDialogVisible, updateDialogPositionFromNodeData]);
  
  // 处理节点选择变化
  const handleNodesChange = useCallback((changes: any[]) => {
    // 收集所有变化，区分选中和取消选中
    const selectedChanges = changes.filter(change => change.type === 'select' && change.selected);
    const unselectedChanges = changes.filter(change => change.type === 'select' && !change.selected);
    
    // 处理选中的节点 - 优先处理选中变化，确保对话框能正常显示
    if (selectedChanges.length > 0) {
      const selectedChange = selectedChanges[0];
      const node = nodeOperations.nodes.find(n => n.id === selectedChange.id);
      if (node) {
        setSelectedNode(node);
        setIsDialogVisible(true);
      }
    } 
    // 只有在没有选中变化时，才处理取消选中
    else if (unselectedChanges.length > 0) {
      // 节点被取消选中
      setIsDialogVisible(false);
      setSelectedNode(null);
    }
    
    // 调用原始的nodesChange处理函数
    paneInteractions.onNodesChangeWithDragControl(changes);
  }, [nodeOperations.nodes, paneInteractions.onNodesChangeWithDragControl]);
  
  // 处理对话框关闭
  const handleDialogClose = useCallback(() => {
    setIsDialogVisible(false);
    setSelectedNode(null);
  }, []);
  
  // 查找与视频节点相连的首帧和尾帧图片节点
  const findConnectedFrameNodes = useCallback(() => {
    if (!selectedNode || selectedNode.type !== 'video') {
      return { firstFrameUrl: undefined, lastFrameUrl: undefined };
    }

    // 查找所有指向当前视频节点的边
    const incomingEdges = nodeOperations.edges.filter(edge => edge.target === selectedNode.id);
    
    // 查找首帧和尾帧图片节点
    let firstFrameUrl: string | undefined;
    let lastFrameUrl: string | undefined;

    for (const edge of incomingEdges) {
      // 查找边的源节点
      const sourceNode = nodeOperations.nodes.find(node => node.id === edge.source);
      if (sourceNode && sourceNode.type === 'image' && sourceNode.data) {
        // 检查是否是首帧或尾帧节点
        const imageData = sourceNode.data as any;
        if (imageData.frameType === 'first') {
          firstFrameUrl = imageData.imageUrl;
        } else if (imageData.frameType === 'last') {
          lastFrameUrl = imageData.imageUrl;
        }
      }
    }

    return { firstFrameUrl, lastFrameUrl };
  }, [selectedNode, nodeOperations.nodes, nodeOperations.edges]);

  // 处理对话框发送
  const handleDialogSend = useCallback((content: string, model: string, config?: Record<string, any>) => {
    if (!selectedNode) return;

    // 如果是视频节点，处理视频生成逻辑
    if (selectedNode.type === 'video') {
      // 查找与视频节点相连的首帧和尾帧图片节点
      const { firstFrameUrl, lastFrameUrl } = findConnectedFrameNodes();
      
      // 确保首帧图片已上传（尾帧可选）
      if (!firstFrameUrl) {
        console.warn('首帧图片未上传');
        // 可以在这里添加用户提示
        return;
      }

      // 更新全局状态：清除旧视频、显示loading
      const videoNodesStore = useVideoNodesStore.getState() as any;
      videoNodesStore.setVideoNode(selectedNode.id, { 
        videoUrl: undefined, 
        isLoading: true 
      });

      // 构建请求参数
      const requestParams = {
        content,
        model,
        config: {
          ...config,
          firstFrameUrl,
          lastFrameUrl
        },
        nodeId: selectedNode.id
      };

      console.log('发送视频生成请求:', requestParams);

      // 模拟后端请求 - 实际项目中应该替换为真实的API调用
      setTimeout(() => {
        // 模拟生成的视频URL，添加时间戳参数确保每次URL都不同
        const mockVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4?timestamp=' + Date.now();

        // 更新全局状态，添加视频URL并关闭loading状态
        videoNodesStore.setVideoNode(selectedNode.id, { 
          videoUrl: mockVideoUrl, 
          isLoading: false 
        });
      }, 3000);
    } 
    // 如果是图片节点，处理图片生成逻辑
    else if (selectedNode.type === 'image') {
      // 更新节点状态：清除旧图片、显示loading和processing
      nodeOperations.setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === selectedNode.id
            ? { ...node, data: { ...node.data, isLoading: true, isProcessing: true, imageUrl: undefined } }
            : node
        )
      );

      // 构建请求参数
      const requestParams = {
        content,
        model,
        config: {
          ...config
        },
        nodeId: selectedNode.id
      };

      console.log('发送图片生成请求:', requestParams);

      // 模拟后端请求 - 实际项目中应该替换为真实的API调用
      setTimeout(() => {
        // 模拟生成的图片URL，添加时间戳参数确保每次URL都不同
        const mockImageUrl = 'https://picsum.photos/800/600?timestamp=' + Date.now();

        // 更新节点数据，添加图片URL并关闭loading和processing状态
        nodeOperations.setNodes((prevNodes) =>
          prevNodes.map((node) =>
            node.id === selectedNode.id
              ? { ...node, data: { ...node.data, imageUrl: mockImageUrl, isLoading: false, isProcessing: false } }
              : node
          )
        );

        // 更新全局存储
        setTimeout(() => {
          const imageNodesStore = useImageNodesStore.getState();
          imageNodesStore.setImageNode(selectedNode.id, {
            id: selectedNode.id,
            imageUrl: mockImageUrl,
            position: selectedNode.position
          });
        }, 0);
      }, 3000);

      // 真实API调用示例（注释部分）
      /*
      fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestParams),
      })
      .then(response => response.json())
      .then(data => {
        // 更新节点数据，添加图片URL并关闭loading和processing状态
        nodeOperations.setNodes((prevNodes) =>
          prevNodes.map((node) =>
            node.id === selectedNode.id
              ? { ...node, data: { ...node.data, imageUrl: data.imageUrl, isLoading: false, isProcessing: false } }
              : node
          )
        );

        // 更新全局存储
        setTimeout(() => {
          const imageNodesStore = useImageNodesStore.getState();
          imageNodesStore.setImageNode(selectedNode.id, {
            id: selectedNode.id,
            imageUrl: data.imageUrl,
            position: selectedNode.position
          });
        }, 0);
      })
      .catch(error => {
        console.error('图片生成失败:', error);
        // 出错时关闭loading和processing状态
        nodeOperations.setNodes((prevNodes) =>
          prevNodes.map((node) =>
            node.id === selectedNode.id
              ? { ...node, data: { ...node.data, isLoading: false, isProcessing: false, error: '图片生成失败' } }
              : node
          )
        );
      });
      */
    }

    handleDialogClose();
  }, [selectedNode, handleDialogClose, nodeOperations.setNodes, findConnectedFrameNodes]);
  
  // 处理画布点击事件，关闭对话框
  const handlePaneClick = useCallback((event: React.MouseEvent) => {
    // 调用原始的paneClick处理函数
    paneInteractions.handlePaneClick(event);
    
    // 关闭对话框
    handleDialogClose();
  }, [paneInteractions.handlePaneClick, handleDialogClose]);
  
  // 监听节点删除，关闭对应对话框
  useEffect(() => {
    if (selectedNode) {
      const nodeExists = nodeOperations.nodes.some(node => node.id === selectedNode.id);
      if (!nodeExists) {
        handleDialogClose();
      }
    }
  }, [nodeOperations.nodes, selectedNode, handleDialogClose]);

  // 关闭弹出菜单的处理函数
  const handleCloseMenu = () => {
    paneInteractions.setDoubleClickPosition(null);
  };

  const onConnect: OnConnect = useCallback(
    (params) => nodeOperations.setEdges((eds: Edge[]) => addEdge(params, eds)),
    [nodeOperations.setEdges]
  );

  const handleUploadImage = useCallback(() => {
    console.log('上传图片功能');
    alert('上传图片功能即将实现');
  }, []);

  const handleUploadVideo = useCallback(() => {
    console.log('上传视频功能');
    alert('上传视频功能即将实现');
  }, []);

  const nodeTypes = useMemo(
    () => ({
      text: TextNode,
      image: ImageNode,
      video: VideoNode
    }),
    []
  );

  const handleCropComplete = useCallback((croppedImageUrl: string) => {
    if (cropOperations.croppingNode) {
      nodeOperations.handleImageUpdate(cropOperations.croppingNode.id, croppedImageUrl);
      cropOperations.setCroppingNode(null);
    }
  }, [nodeOperations.handleImageUpdate, cropOperations.setCroppingNode, cropOperations.croppingNode]);

  return (
    <>
      {/* 为 ReactFlow 添加明确的高度和宽度设置 - 编辑页面没有navbar，直接使用100vh */}
      <div style={{ width: '100%', height: '100vh', position: 'relative', display: 'block' }}>
        {/* 返回按钮 */}
        <div 
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 1000,
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '50%',
            padding: '8px',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}
          onClick={() => router.back()}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
          }}
        >
          <ArrowLeft size={24} color="#333" />
        </div>
        
        <ReactFlow
          nodes={nodeOperations.nodes}
          edges={nodeOperations.edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={nodeOperations.onEdgesChange}
          onConnect={onConnect}
          onPaneClick={handlePaneClick}
          // 新增：监听画布变化，更新对话框位置
          onMoveEnd={() => {
            if (selectedNode && isDialogVisible) {
              updateDialogPositionFromNodeData();
            }
          }}
          nodeTypes={nodeTypes}
          fitView
          zoomOnScroll={!nodeOperations.isAnyEditing}
          zoomOnPinch={!nodeOperations.isAnyEditing}
          proOptions={{ hideAttribution: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={12}
            size={1}
            color="var(--color-neutral-400)"
          />
          <Controls orientation="horizontal" className="custom-controls" />


          {nodeOperations.nodes.length === 0 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md border border-neutral-200 z-10 flex items-center gap-2">
              <Plus size={16} />
              <span className="text-sm text-neutral-600">双击添加节点</span>
            </div>
          )}

          <LeftSidebar
            onAddTextNode={addTextNode}
            onAddImageNode={addImageNode}
            onAddVideoNode={addVideoNode}
            onUploadImage={handleUploadImage}
            onUploadVideo={handleUploadVideo}
            projectId={projectId ? parseInt(projectId) : undefined}
          />

          {/* 双击弹出的添加节点菜单 */}
          {paneInteractions.doubleClickPosition && (
            <div
              className="absolute"
              style={{
                left: paneInteractions.doubleClickPosition.x,
                top: paneInteractions.doubleClickPosition.y,
                transform: 'translate(-50%, -50%)',
                zIndex: 1000
              }}
            >
              <FloatingMenu
                isOpen={!!paneInteractions.doubleClickPosition}
                onClose={handleCloseMenu}
                title="添加节点"
                width="w-48"
              >
                <MenuButton
                  icon={<Type size={16} />}
                  label="文本"
                  onClick={() => {
                    if (paneInteractions.doubleClickPosition) {
                      // 将屏幕坐标转换为画布坐标
                      const flowPosition = screenToFlowPosition(paneInteractions.doubleClickPosition);
                      addTextNode(flowPosition);
                      handleCloseMenu();
                    }
                  }}
                />
                <MenuButton
                  icon={<Image size={16} />}
                  label="图片"
                  onClick={() => {
                    if (paneInteractions.doubleClickPosition) {
                      // 将屏幕坐标转换为画布坐标
                      const flowPosition = screenToFlowPosition(paneInteractions.doubleClickPosition);
                      addImageNode(flowPosition);
                      handleCloseMenu();
                    }
                  }}
                />
                <MenuButton
                  icon={<Video size={16} />}
                  label="视频"
                  onClick={() => {
                    if (paneInteractions.doubleClickPosition) {
                      // 将屏幕坐标转换为画布坐标
                      const flowPosition = screenToFlowPosition(paneInteractions.doubleClickPosition);
                      addVideoNode(flowPosition);
                      handleCloseMenu();
                    }
                  }}
                />
              </FloatingMenu>
            </div>
          )}
        </ReactFlow>
      </div>

      {/* 节点交互对话框 */}
      {selectedNode && (
        <NodeInteractionDialog
          isVisible={isDialogVisible}
          position={dialogPosition}
          nodeType={selectedNode.type as 'text' | 'image' | 'video'}
          onClose={handleDialogClose}
          onSend={handleDialogSend}
          {...findConnectedFrameNodes()}
        />
      )}

      {cropOperations.croppingNode && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <FabricImageEditor
              imageUrl={cropOperations.croppingNode.imageUrl}
              onCropComplete={(croppedImageUrl) => handleCropComplete(croppedImageUrl)}
              onCancel={() => cropOperations.setCroppingNode(null)}
            />
          </div>
        </div>
      )}
    </>
  );
};

const FlowCanvas: React.FC<FlowCanvasProps> = ({ projectId }) => {
  return (
    <ReactFlowProvider>
      <FlowCanvasContent projectId={projectId} />
    </ReactFlowProvider>
  );
};

export default FlowCanvas;