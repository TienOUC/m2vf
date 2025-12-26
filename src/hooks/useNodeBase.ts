import { useCallback } from 'react';
import type { NodeProps } from '@xyflow/react';

export interface NodeData {
  label?: string;
  onTypeChange?: (nodeId: string, newType: 'text' | 'image' | 'video') => void;
  onDelete?: (nodeId: string) => void;
}

export interface NodeType {
  type: 'text' | 'image' | 'video';
}

export function useNodeBase<T extends NodeData>(data: T, id: string) {
  const nodeData = data as NodeData;

  const handleTypeChange = useCallback((newType: 'text' | 'image' | 'video') => {
    if (nodeData?.onTypeChange && id) {
      nodeData.onTypeChange(id, newType);
    }
  }, [nodeData, id]);

  const handleDelete = useCallback(() => {
    if (nodeData?.onDelete && id) {
      nodeData.onDelete(id);
    }
  }, [nodeData, id]);

  return {
    handleTypeChange,
    handleDelete,
    nodeData
  };
}

export function useFileNodeBase<T extends NodeData>(data: T, id: string) {
  const { handleTypeChange, handleDelete, nodeData } = useNodeBase(data, id);
  
  return {
    handleTypeChange,
    handleDelete,
    nodeData
  };
}