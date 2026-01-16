import { useCallback, useState, useRef, useEffect } from 'react';
import { Node, Edge, useNodesState, useEdgesState } from '@xyflow/react';
import { NodeOperations, FontType } from '@/lib/types/editor/nodeOperations';
import { downloadImage } from '@/lib/utils/image';
import { removeImageBackground } from '@/lib/api/client/ai';
import { useTextNodesStore, TextNodeState } from '@/lib/stores/textNodesStore';
import { useImageNodesStore, ImageNodeState } from '@/lib/stores/imageNodesStore';
import { useEdgesStore } from '@/lib/stores/edgesStore';

export const useNodeOperations = (): NodeOperations => {
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
  }, [setNodes]);

  const handleDelete = useCallback((nodeId: string) => {
    try {
      // 1. 立即从全局状态中删除节点数据
      const textNodesStore = useTextNodesStore.getState();
      textNodesStore.deleteTextNode(nodeId);
      
      const imageNodesStore = useImageNodesStore.getState();
      imageNodesStore.deleteImageNode(nodeId);
      
      // 2. 使用函数式更新来确保获取最新的节点和边
      setNodes((prevNodes) => {
        const updatedNodes = prevNodes.filter((node) => node.id !== nodeId);
        return updatedNodes;
      });
      
      // 3. 同步更新边，确保获取最新的边数据
      setEdges((prevEdges) => {
        const updatedEdges = prevEdges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);
        
        // 4. 立即更新全局状态中的边
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
            onDelete: handleDelete,
            onReplace: handleReplace,
            onImageUpdate: handleImageUpdate,
            onDownload: handleDownload,
            onBackgroundRemove: handleBackgroundRemove,
            onEditStart: () => {}, // 空函数占位
            onCropStart: () => {}, // 空函数占位
          },
        }));
      }
      
      // 只在当前节点列表为空时添加持久化节点
      if (nodes.length === 0) {
        setNodes((prevNodes) => {
          // 确保不添加重复ID的节点
          const uniqueNodes = [...textFlowNodes, ...imageFlowNodes].filter(newNode => 
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
  }, [setNodes, setEdges, handleDelete, handleBackgroundColorChange, handleFontTypeChange, handleEditingChange, handleReplace, handleImageUpdate, isInitialized, nodes.length, edges.length]);

  // 注释掉这个useEffect，因为它会在删除最后一个节点时清空所有节点数据
  // 用户可能只是想删除最后一个节点，而不是清空所有数据
  /* useEffect(() => {
    // 只有在组件初始化完成后，当节点列表为空时才清空全局状态
    if (isInitialized && nodes.length === 0) {
      useTextNodesStore.getState().clearAllTextNodes();
      useImageNodesStore.getState().clearAllImageNodes();
    }
  }, [nodes, isInitialized]); */

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
    }
  }, [nodes, isInitialized]);

  // 监听连线变化，保存到全局状态
  useEffect(() => {
    // 保存连线到全局状态
    useEdgesStore.getState().setEdges(edges);
  }, [edges]);

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
        width: originalNode.width,
        height: originalNode.height,
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
      };
      
      // 保存到全局状态
      useImageNodesStore.getState().setImageNode(processingNodeId, {
        id: processingNodeId,
        position: processingNode.position,
        width: processingNode.width,
        height: processingNode.height,
        imageUrl: '',
        isLoading: true,
        isProcessing: true,
        processingProgress: 0
      });

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
        
        // 更新全局状态
        useImageNodesStore.getState().updateImageNodeUrl(processingNodeId, processedImageUrl);
        useImageNodesStore.getState().updateImageNodeLoadingState(processingNodeId, false);
        useImageNodesStore.getState().updateImageNodeProcessingState(processingNodeId, false, 100);
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