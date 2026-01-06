import { useCallback } from 'react';
import { Node, useReactFlow } from '@xyflow/react';

interface UseNodeAdditionProps {
  nodeId: number;
  setNodeId: React.Dispatch<React.SetStateAction<number>>;
  setNodes: (nodes: Node[] | ((prevNodes: Node[]) => Node[])) => void;
  handleTypeChange: (nodeId: string, newType: 'text' | 'image' | 'video' | 'audio') => void;
  handleDelete: (nodeId: string) => void;
  handleBackgroundColorChange: (nodeId: string, color: string) => void;
  handleFontTypeChange?: (nodeId: string, fontType: 'h1' | 'h2' | 'h3' | 'p') => void;
}

export const useNodeAddition = ({
  nodeId,
  setNodeId,
  setNodes,
  handleTypeChange,
  handleDelete,
  handleBackgroundColorChange,
  handleFontTypeChange,
}: UseNodeAdditionProps) => {
  const { screenToFlowPosition } = useReactFlow();

  // 添加文本节点函数
  const addTextNode = useCallback(
    (position?: { x: number; y: number }) => {
      const pos = position || screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      
      const newNode = {
        id: `node-${nodeId}`,
        type: 'text',
        position: pos,
        data: { 
          label: '文本节点',
          backgroundColor: '#ffffff',
          fontType: 'p', // 默认为正文样式
          onTypeChange: handleTypeChange,
          onDelete: handleDelete,
          onBackgroundColorChange: handleBackgroundColorChange,
          ...(handleFontTypeChange && { onFontTypeChange: handleFontTypeChange }),
          content: '',
          editorStateJson: undefined, // 初始化为空
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setNodeId((prevId) => prevId + 1);
    },
    [nodeId, setNodes, screenToFlowPosition, handleTypeChange, handleDelete, handleBackgroundColorChange, handleFontTypeChange, setNodeId]
  );

  // 添加图片节点函数
  const addImageNode = useCallback(
    (position?: { x: number; y: number }) => {
      const pos = position || screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      
      const newNode = {
        id: `node-${nodeId}`,
        type: 'image',
        position: pos,
        data: { 
          label: '图片节点',
          imageUrl: undefined, // 明确初始化为undefined，确保一致的状态
          onTypeChange: handleTypeChange,
          onDelete: handleDelete,
          onReplace: (id: string) => {
            console.log(`替换节点 ${id} 的文件`);
          },
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setNodeId((prevId) => prevId + 1);
    },
    [nodeId, setNodes, screenToFlowPosition, handleTypeChange, handleDelete, setNodeId]
  );

  // 添加视频节点函数
  const addVideoNode = useCallback(
    (position?: { x: number; y: number }) => {
      const pos = position || screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      
      const newNode = {
        id: `node-${nodeId}`,
        type: 'video',
        position: pos,
        data: { 
          label: '视频节点',
          onTypeChange: handleTypeChange,
          onDelete: handleDelete,
          onReplace: (id: string) => {
            console.log(`替换节点 ${id} 的文件`);
          },
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setNodeId((prevId) => prevId + 1);
    },
    [nodeId, setNodes, screenToFlowPosition, handleTypeChange, handleDelete, setNodeId]
  );

  // 添加音频节点函数
  const addAudioNode = useCallback(
    (position?: { x: number; y: number }) => {
      const pos = position || screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      
      const newNode = {
        id: `node-${nodeId}`,
        type: 'audio',
        position: pos,
        data: { 
          label: '音频节点',
          onTypeChange: handleTypeChange,
          onDelete: handleDelete,
          onReplace: (id: string) => {
            console.log(`替换节点 ${id} 的文件`);
          },
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setNodeId((prevId) => prevId + 1);
    },
    [nodeId, setNodes, screenToFlowPosition, handleTypeChange, handleDelete, setNodeId]
  );

  return {
    addTextNode,
    addImageNode,
    addVideoNode,
    addAudioNode,
  };
};