import { useCallback } from 'react';
import { Node, useReactFlow } from '@xyflow/react';
import { useTextNodesStore } from '@/lib/stores/textNodesStore';
import { useImageNodesStore } from '@/lib/stores/imageNodesStore';

interface UseNodeAdditionProps {
  nodeId: number;
  setNodeId: React.Dispatch<React.SetStateAction<number>>;
  setNodes: (nodes: Node[] | ((prevNodes: Node[]) => Node[])) => void;
  handleDelete: (nodeId: string) => void;
  handleBackgroundColorChange: (nodeId: string, color: string) => void;
  handleImageUpdate?: (nodeId: string, imageUrl: string) => void;
  handleFontTypeChange?: (nodeId: string, fontType: 'h1' | 'h2' | 'h3' | 'p') => void;
  handleDownload?: (nodeId: string) => void;
  handleBackgroundRemove?: (nodeId: string) => void;
  onEditingChange?: (nodeId: string, editing: boolean) => void;
  onEditStart?: (nodeId: string) => void;
  onCropStart?: (nodeId: string, imageUrl: string) => void;
  onFirstLastFrameGenerate?: (nodeId: string) => void;
  onFirstFrameGenerate?: (nodeId: string) => void;
}

export const useNodeAddition = ({
  nodeId,
  setNodeId,
  setNodes,
  handleDelete,
  handleBackgroundColorChange,
  handleImageUpdate,
  handleFontTypeChange,
  onEditingChange,
  onEditStart,
  onCropStart,
  handleDownload,
  handleBackgroundRemove,
  onFirstLastFrameGenerate,
  onFirstFrameGenerate,
}) => {
  const { screenToFlowPosition } = useReactFlow();

  // 添加文本节点函数
  const addTextNode = useCallback(
    (position?: { x: number; y: number }) => {
      const pos = position || screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      
      // 添加时间戳的最后4位，确保即使快速点击也能生成唯一ID
      const timestampSuffix = Date.now().toString().slice(-4);
      const newNodeId = `node-${nodeId}-${timestampSuffix}`;
      const newNode = {
        id: newNodeId,
        type: 'text',
        position: pos,
        data: { 
          label: '文本节点',
          backgroundColor: '#ffffff',
          fontType: 'p', // 默认为正文样式
          onDelete: handleDelete,
          onBackgroundColorChange: handleBackgroundColorChange,
          ...(handleFontTypeChange && { onFontTypeChange: handleFontTypeChange }),
          ...(onEditingChange && { onEditingChange }),
          content: '',
          editorStateJson: undefined, // 初始化为空
          getContent: (nodeId: string) => {
            // 从全局状态获取内容
            return useTextNodesStore.getState().getTextNode(nodeId)?.content || '';
          },
          getRichContent: (nodeId: string) => {
            // 从全局状态获取富文本内容
            return useTextNodesStore.getState().getTextNode(nodeId)?.richContent || '';
          },
        },
      };

      // 先更新React Flow节点列表
      setNodes((nds) => {
        // 检查是否已经存在相同ID的节点，避免重复添加
        if (!nds.some(node => node.id === newNode.id)) {
          return nds.concat(newNode);
        }
        // 如果节点已存在，不添加并记录警告
        console.warn(`节点ID ${newNode.id} 已存在，避免重复添加`);
        return nds;
      });
      
      // 然后在渲染完成后更新全局存储，避免在渲染过程中更新状态
      setTimeout(() => {
        useTextNodesStore.getState().setTextNode(newNodeId, {
          id: newNodeId,
          content: '',
          backgroundColor: '#ffffff',
          fontType: 'p',
          position: pos,
          editorStateJson: undefined
        });
      }, 0);
      
      setNodeId((prevId) => prevId + 1);
    },
    [nodeId, setNodes, screenToFlowPosition, handleDelete, handleBackgroundColorChange, handleFontTypeChange, onEditingChange, setNodeId]
  );

  // 添加图片节点函数
  const addImageNode = useCallback(
    (position?: { x: number; y: number }) => {
      const pos = position || screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      
      // 添加时间戳的最后4位，确保即使快速点击也能生成唯一ID
      const timestampSuffix = Date.now().toString().slice(-4);
      const newNodeId = `node-${nodeId}-${timestampSuffix}`;
      const newNode = {
        id: newNodeId,
        type: 'image',
        position: pos,
        data: { 
          label: '图片节点',
          imageUrl: undefined, // 明确初始化为undefined，确保一致的状态
          onDelete: handleDelete,
          ...(handleImageUpdate && { onImageUpdate: handleImageUpdate }),
          ...(handleDownload && { onDownload: handleDownload }),
          onReplace: (id: string) => {
            console.log(`替换节点 ${id} 的文件`);
          },
          // 添加裁剪功能相关回调
          ...(onEditStart && { onEditStart }),
          ...(onCropStart && { onCropStart }),
          // 添加抠图功能相关回调
          ...(handleBackgroundRemove && { onBackgroundRemove: handleBackgroundRemove }),
        },
      };

      // 先更新React Flow节点列表
      setNodes((nds) => nds.concat(newNode));
      
      // 然后在渲染完成后更新全局存储，避免在渲染过程中更新状态
      setTimeout(() => {
        useImageNodesStore.getState().setImageNode(newNodeId, {
          id: newNodeId,
          imageUrl: undefined,
          position: pos
        });
      }, 0);
      
      setNodeId((prevId) => prevId + 1);
    },
    [nodeId, setNodes, screenToFlowPosition, handleDelete, handleImageUpdate, onEditStart, onCropStart, handleDownload, handleBackgroundRemove, setNodeId]
  );

  // 添加视频节点函数
  const addVideoNode = useCallback(
    (position?: { x: number; y: number }) => {
      const pos = position || screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      
      // 添加时间戳的最后4位，确保即使快速点击也能生成唯一ID
      const timestampSuffix = Date.now().toString().slice(-4);
      const newNode = {
        id: `node-${nodeId}-${timestampSuffix}`,
        type: 'video',
        position: pos,
        data: { 
          label: '视频节点',
          onDelete: handleDelete,
          onReplace: (id: string) => {
            console.log(`替换节点 ${id} 的文件`);
          },
          ...(onFirstLastFrameGenerate && { onFirstLastFrameGenerate }),
          ...(onFirstFrameGenerate && { onFirstFrameGenerate }),
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setNodeId((prevId) => prevId + 1);
    },
    [nodeId, setNodes, screenToFlowPosition, handleDelete, onFirstLastFrameGenerate, onFirstFrameGenerate, setNodeId]
  );

  return {
    addTextNode,
    addImageNode,
    addVideoNode,
  };
};