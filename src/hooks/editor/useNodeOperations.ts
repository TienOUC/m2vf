import { useCallback, useState, useRef, useEffect } from 'react';
import { Node, Edge, useNodesState, useEdgesState } from '@xyflow/react';
import { NodeOperations, FontType } from '@/lib/types/editor/nodeOperations';
import { downloadImage } from '@/lib/utils/image';

import { useTextNodesStore, TextNodeState } from '@/lib/stores/textNodesStore';
import { useImageNodesStore, ImageNodeState } from '@/lib/stores/imageNodesStore';
import { useVideoNodesStore, VideoNodeState } from '@/lib/stores/videoNodesStore';
import { useEdgesStore } from '@/lib/stores/edgesStore';

export interface UseNodeOperationsOptions {
  onEditStart?: (nodeId: string) => void;
  onCropStart?: (nodeId: string, imageUrl: string) => void;
  onEraseStart?: (nodeId: string, imageUrl: string) => void;
  onBackgroundRemove?: (nodeId: string) => void;
}

export const useNodeOperations = (options: UseNodeOperationsOptions = {}): NodeOperations => {
  const { onEditStart = () => {}, onCropStart = () => {}, onEraseStart = () => {}, onBackgroundRemove = () => {} } = options;
  // 使用类型断言来解决 React Flow 的类型推断问题
  const [nodes, _setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);
  
  // 包装setNodes函数，确保不会添加重复ID的节点
  const setNodes = useCallback((updater: ((nodes: Node[]) => Node[]) | Node[]) => {
    _setNodes((prevNodes: Node[]) => {
      let nextNodes: Node[];
      
      // 处理函数式更新
      if (typeof updater === 'function') {
        nextNodes = updater(prevNodes);
      } else {
        nextNodes = updater;
      }
      
      // 过滤重复ID的节点，保留最后一个出现的节点
      const nodeIdMap = new Map<string, Node>();
      nextNodes.forEach(node => {
        nodeIdMap.set(node.id, node);
      });
      
      // 如果发现重复节点，记录警告
      if (nextNodes.length !== nodeIdMap.size) {
        console.warn('发现重复节点ID，已自动去重');
      }
      
      return Array.from(nodeIdMap.values());
    });
  }, [_setNodes]);
  
  const editingNodeIds = useRef<Set<string>>(new Set());
  const [isAnyEditing, setIsAnyEditing] = useState(false);
  
  // 跟踪组件是否已经初始化完成
  const [isInitialized, setIsInitialized] = useState(false);
  
  // 全局节点ID跟踪，防止重复添加节点
  const nodeIdsRef = useRef<Set<string>>(new Set());
  
  // 同步节点ID到ref
  useEffect(() => {
    const currentIds = new Set(nodes.map(node => node.id));
    nodeIdsRef.current = currentIds;
  }, [nodes]);

  // 定义节点操作函数
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
    
    // 同时更新全局状态
    useImageNodesStore.getState().updateImageNodeUrl(nodeId, imageUrl);
  }, [setNodes]);

  const handleDelete = useCallback((nodeId: string) => {
    try {
      // 获取当前所有节点和边，用于确定需要删除的相关节点
      const currentNodes = nodes;
      const currentEdges = edges;
      
      // 1. 立即从全局状态中删除节点数据
      const textNodesStore = useTextNodesStore.getState();
      textNodesStore.deleteTextNode(nodeId);
      
      const imageNodesStore = useImageNodesStore.getState();
      imageNodesStore.deleteImageNode(nodeId);
      
      // 2. 确定需要删除的节点ID列表
      const nodesToDelete = [nodeId];
      
      // 如果是视频节点，找到与之相连的首帧和尾帧图片节点
      const isVideoNode = currentNodes.some(node => node.id === nodeId && node.type === 'video');
      if (isVideoNode) {
        // 获取所有与该视频节点相连的图片节点
        const connectedImageNodes = currentNodes.filter(node => {
          return node.type === 'image' && 
                 currentEdges.some(edge => edge.target === nodeId && edge.source === node.id);
        });
        
        // 将这些图片节点添加到删除列表
        connectedImageNodes.forEach(imageNode => {
          nodesToDelete.push(imageNode.id);
          // 从全局状态中删除这些图片节点的数据
          imageNodesStore.deleteImageNode(imageNode.id);
        });
      }
      
      // 3. 使用函数式更新来确保获取最新的节点和边
      setNodes((prevNodes) => {
        // 删除所有标记的节点
        const updatedNodes = prevNodes.filter((node) => !nodesToDelete.includes(node.id));
        return updatedNodes;
      });
      
      // 4. 同步更新边，确保获取最新的边数据
      setEdges((prevEdges) => {
        // 删除所有与标记节点相关的边
        const updatedEdges = prevEdges.filter((edge) => 
          !nodesToDelete.includes(edge.source) && 
          !nodesToDelete.includes(edge.target)
        );
        
        // 5. 立即更新全局状态中的边
        useEdgesStore.getState().setEdges(updatedEdges);
        return updatedEdges;
      });
      
      console.log(`节点 ${nodeId} 删除成功`);
    } catch (error) {
      console.error(`删除节点 ${nodeId} 失败:`, error);
      // 这里可以添加用户错误提示，例如通过 toast 通知
      // 由于已经尝试修改节点和边，如果失败需要回滚
      // 但考虑到回滚的复杂性，这里仅记录错误
    }
  }, [setNodes, setEdges, nodes, edges]);

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
    // 同时更新全局状态
    useTextNodesStore.getState().updateTextNodeBackgroundColor(nodeId, color);
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
    // 同时更新全局状态
    useTextNodesStore.getState().updateTextNodeFontType(nodeId, fontType);
  }, [setNodes]);

  const handleEditingChange = useCallback((nodeId: string, editing: boolean) => {
    if (editing) {
      editingNodeIds.current.add(nodeId);
    } else {
      editingNodeIds.current.delete(nodeId);
    }
    setIsAnyEditing(editingNodeIds.current.size > 0);
  }, []);

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

  // 从持久化数据初始化节点列表和连线
  useEffect(() => {
    // 只在未初始化时执行
    if (!isInitialized) {
      // 获取持久化的文本节点数据
      const textNodesState = useTextNodesStore.getState();
      const persistedTextNodes = textNodesState.textNodes;
      
      // 获取持久化的图片节点数据
      const imageNodesState = useImageNodesStore.getState();
      const persistedImageNodes = imageNodesState.imageNodes;
      
      // 获取持久化的视频节点数据
      const videoNodesState = useVideoNodesStore.getState();
      const persistedVideoNodes = videoNodesState.videoNodes;
      
      // 如果有持久化的文本节点，将它们转换为 React Flow 节点
      let textFlowNodes: Node[] = [];
      if (Object.keys(persistedTextNodes).length > 0) {
        textFlowNodes = Object.values(persistedTextNodes).map((textNode) => ({
          id: textNode.id,
          type: 'text',
          position: textNode.position || { x: 100, y: 100 }, // 使用保存的位置或默认位置
          width: textNode.width,
          height: textNode.height,
          data: {
            label: '文本节点',
            content: textNode.content,
            editorStateJson: textNode.editorStateJson,
            backgroundColor: textNode.backgroundColor,
            fontType: textNode.fontType,
            onDelete: handleDelete,
            onBackgroundColorChange: handleBackgroundColorChange,
            onFontTypeChange: handleFontTypeChange,
            onEditingChange: handleEditingChange,
            getContent: (nodeId: string) => textNodesState.getTextNode(nodeId)?.content || '',
            getRichContent: (nodeId: string) => textNodesState.getTextNode(nodeId)?.richContent || '',
          },
        }));
      }
      
      // 如果有持久化的图片节点，将它们转换为 React Flow 节点
      let imageFlowNodes: Node[] = [];
      if (Object.keys(persistedImageNodes).length > 0) {
        imageFlowNodes = Object.values(persistedImageNodes).map((imageNode) => ({
          id: imageNode.id,
          type: 'image',
          position: imageNode.position || { x: 300, y: 100 }, // 使用保存的位置或默认位置
          width: imageNode.width,
          height: imageNode.height,
          data: {
            label: '图片节点',
            imageUrl: imageNode.imageUrl,
            frameType: imageNode.frameType,
            onDelete: handleDelete,
            onReplace: handleReplace,
            onImageUpdate: handleImageUpdate,
            onDownload: handleDownload,
            onEditStart: onEditStart,
            onCropStart: onCropStart,
            onEraseStart: onEraseStart,
            onBackgroundRemove: onBackgroundRemove,
          },
        }));
      }
      
      // 如果有持久化的视频节点，将它们转换为 React Flow 节点
      let videoFlowNodes: Node[] = [];
      if (Object.keys(persistedVideoNodes).length > 0) {
        videoFlowNodes = Object.values(persistedVideoNodes).map((videoNode) => ({
          id: videoNode.id,
          type: 'video',
          position: videoNode.position || { x: 500, y: 100 }, // 使用保存的位置或默认位置
          width: videoNode.width,
          height: videoNode.height,
          data: {
            label: '视频节点',
            onDelete: handleDelete,
          },
        }));
      }
      
      // 只在当前节点列表为空时添加持久化节点
      if (nodes.length === 0) {
        setNodes((prevNodes) => {
          // 确保不添加重复ID的节点
          const uniqueNodes = [...textFlowNodes, ...imageFlowNodes, ...videoFlowNodes].filter(newNode => 
            !prevNodes.some(existingNode => existingNode.id === newNode.id)
          );
          return [...prevNodes, ...uniqueNodes];
        });
      }
      
      // 从持久化数据初始化连线
      const edgesState = useEdgesStore.getState();
      const persistedEdges = edgesState.getAllEdges();
      
      // 只在当前连线列表为空时添加持久化连线
      if (edges.length === 0 && persistedEdges.length > 0) {
        setEdges((prevEdges) => [...prevEdges, ...persistedEdges]);
      }
      
      // 标记初始化完成
      setIsInitialized(true);
    }
  }, [setNodes, setEdges, handleDelete, handleBackgroundColorChange, handleFontTypeChange, handleEditingChange, handleReplace, handleImageUpdate, handleDownload, isInitialized, nodes.length, edges.length, onEditStart, onCropStart, onEraseStart, onBackgroundRemove]);



  // 监听节点变化，保存位置和宽高信息到全局状态
  useEffect(() => {
    // 只在组件初始化完成后处理
    if (isInitialized) {
      const currentNodeIds = new Set(nodes.map(node => node.id));
      
      // 处理文本节点
      const textNodes = nodes.filter(node => node.type === 'text');
      
      // 1. 删除全局存储中不存在于nodes数组中的文本节点
      const textNodesStore = useTextNodesStore.getState();
      const allTextNodes = textNodesStore.textNodes;
      for (const nodeId in allTextNodes) {
        if (!currentNodeIds.has(nodeId)) {
          textNodesStore.deleteTextNode(nodeId);
        }
      }
      
      // 2. 批量更新全局状态中的文本节点位置、宽高
      const textUpdates: Record<string, Partial<TextNodeState>> = {};
      
      textNodes.forEach(node => {
        textUpdates[node.id] = {
          position: node.position,
          width: node.width,
          height: node.height
        };
      });
      
      if (Object.keys(textUpdates).length > 0) {
        textNodesStore.batchUpdateTextNodes(textUpdates);
      }
      
      // 处理图片节点
      const imageNodes = nodes.filter(node => node.type === 'image');
      
      // 3. 删除全局存储中不存在于nodes数组中的图片节点
      const imageNodesStore = useImageNodesStore.getState();
      const allImageNodes = imageNodesStore.imageNodes;
      for (const nodeId in allImageNodes) {
        if (!currentNodeIds.has(nodeId)) {
          imageNodesStore.deleteImageNode(nodeId);
        }
      }
      
      // 4. 批量更新全局状态中的图片节点位置、宽高
      const imageUpdates: Record<string, Partial<ImageNodeState>> = {};
      
      imageNodes.forEach(node => {
        // 只更新当前存在于UI中的节点，避免重新创建已删除的节点
        imageUpdates[node.id] = {
          position: node.position,
          width: node.width,
          height: node.height
        };
      });
      
      if (Object.keys(imageUpdates).length > 0) {
        imageNodesStore.batchUpdateImageNodes(imageUpdates);
      }
      
      // 处理视频节点
      const videoNodes = nodes.filter(node => node.type === 'video');
      
      // 5. 删除全局存储中不存在于nodes数组中的视频节点
      const videoNodesStore = useVideoNodesStore.getState();
      const allVideoNodes = videoNodesStore.videoNodes;
      for (const nodeId in allVideoNodes) {
        if (!currentNodeIds.has(nodeId)) {
          videoNodesStore.deleteVideoNode(nodeId);
        }
      }
      
      // 6. 批量更新全局状态中的视频节点位置、宽高
      const videoUpdates: Record<string, Partial<VideoNodeState>> = {};
      
      videoNodes.forEach(node => {
        // 只更新当前存在于UI中的节点，避免重新创建已删除的节点
        videoUpdates[node.id] = {
          position: node.position,
          width: node.width,
          height: node.height
        };
      });
      
      if (Object.keys(videoUpdates).length > 0) {
        videoNodesStore.batchUpdateVideoNodes(videoUpdates);
      }
    }
  }, [nodes, isInitialized]);

  // 监听连线变化，保存到全局状态
  useEffect(() => {
    // 保存连线到全局状态
    useEdgesStore.getState().setEdges(edges);
  }, [edges]);

  return{
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
    handleDownload,
    isAnyEditing,
    editingNodeIds
  };
};