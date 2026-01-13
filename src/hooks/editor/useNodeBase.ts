import { useCallback } from 'react';

export interface NodeData {
  label?: string;
  backgroundColor?: string;
  onDelete?: (nodeId: string) => void;
  onBackgroundColorChange?: (nodeId: string, color: string) => void;
  getContent?: (nodeId: string) => string;
  onDownload?: (nodeId: string) => void;
  onBackgroundRemove?: (nodeId: string) => void;
}

export interface NodeType {
  type: 'text' | 'image' | 'video';
}

export function useNodeBase<T extends NodeData>(data: T, id: string) {
  const nodeData = data as NodeData;



  const handleDelete = useCallback(() => {
    if (nodeData?.onDelete && id) {
      nodeData.onDelete(id);
    }
  }, [nodeData, id]);

  return {
    handleDelete,
    nodeData
  };
}

export function useFileNodeBase<T extends NodeData>(data: T, id: string) {
  const { handleDelete, nodeData } = useNodeBase(data, id);
  
  return {
    handleDelete,
    nodeData
  };
}