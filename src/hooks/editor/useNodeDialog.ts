import { useState, useCallback, useEffect } from 'react';
import { type Node } from '@xyflow/react';
import { useDialogPosition } from './useDialogPosition';

interface UseNodeDialogProps {
  nodes: Node[];
  edges: any[];
  paneInteractions: any;
  handleDialogClose: () => void;
}

interface UseNodeDialogReturn {
  selectedNode: Node | null;
  isDialogVisible: boolean;
  dialogPosition: { x: number; y: number };
  handleMoveEnd: () => void;
  handleNodesChange: (changes: any[]) => void;
  handlePaneClick: (event: React.MouseEvent) => void;
}

export const useNodeDialog = ({ 
  nodes, 
  edges, 
  paneInteractions, 
  handleDialogClose 
}: UseNodeDialogProps): UseNodeDialogReturn => {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  
  const { dialogPosition, handleMoveEnd } = useDialogPosition({
    selectedNode,
    isVisible: isDialogVisible
  });
  
  // 处理节点选择变化
  const handleNodesChange = useCallback((changes: any[]) => {
    const selectedChanges = changes.filter(change => change.type === 'select' && change.selected);
    const unselectedChanges = changes.filter(change => change.type === 'select' && !change.selected);
    
    if (selectedChanges.length > 0) {
      const selectedChange = selectedChanges[0];
      const node = nodes.find(n => n.id === selectedChange.id);
      if (node) {
        setSelectedNode(node);
        setIsDialogVisible(true);
      }
    } else if (unselectedChanges.length > 0) {
      setIsDialogVisible(false);
      setSelectedNode(null);
    }
    
    paneInteractions.onNodesChangeWithDragControl(changes);
  }, [nodes, paneInteractions.onNodesChangeWithDragControl]);
  
  // 处理画布点击事件
  const handlePaneClick = useCallback((event: React.MouseEvent) => {
    paneInteractions.handlePaneClick(event);
    handleDialogClose();
  }, [paneInteractions.handlePaneClick, handleDialogClose]);
  
  // 监听nodes数组变化，检查选中的节点是否仍然存在
  useEffect(() => {
    if (selectedNode) {
      // 检查选中的节点是否仍然存在于nodes数组中
      const nodeExists = nodes.some(node => node.id === selectedNode.id);
      if (!nodeExists) {
        // 节点已被删除，关闭对话框
        setIsDialogVisible(false);
        setSelectedNode(null);
        handleDialogClose();
      }
    }
  }, [nodes, selectedNode, handleDialogClose]);
  
  return {
    selectedNode,
    isDialogVisible,
    dialogPosition,
    handleMoveEnd,
    handleNodesChange,
    handlePaneClick
  };
};