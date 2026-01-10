import { useCallback, useState, useRef } from 'react';
import { Node, Edge, useNodesState, useEdgesState } from '@xyflow/react';
import { NodeOperations, NodeType, FontType } from './types/nodeOperations';

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

  const handleTypeChange = useCallback((nodeId: string, newType: NodeType) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const baseData = {
            ...node.data,
            label:
              newType === 'text'
                ? '文本节点'
                : newType === 'image'
                ? '图片节点'
                : '视频节点',
            onTypeChange: handleTypeChange,
            onDelete: handleDelete,
            ...(node.type === 'text' && newType !== 'text' && { backgroundColor: undefined, onBackgroundColorChange: undefined }),
            ...(node.type !== 'text' && newType === 'text' && { backgroundColor: '#ffffff', onBackgroundColorChange: handleBackgroundColorChange }),
          };

          if (newType === 'image' || newType === 'video') {
            return {
              ...node,
              type: newType,
              data: {
                ...baseData,
                onReplace: handleReplace,
                ...(newType === 'image' && { onImageUpdate: handleImageUpdate })
              }
            };
          }

          return {
            ...node,
            type: newType,
            data: baseData
          };
        }
        return node;
      })
    );
  }, [setNodes, handleDelete, handleBackgroundColorChange, handleReplace, handleImageUpdate]);

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
    handleTypeChange,
    handleEditingChange,
    handleCropComplete,
    isAnyEditing,
    editingNodeIds
  };
};