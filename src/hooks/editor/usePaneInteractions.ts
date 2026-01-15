import { useCallback, useState } from 'react';
import { Node, NodeChange } from '@xyflow/react';
import { useTextNodesStore } from '@/lib/stores/textNodesStore';

export interface PaneInteractions {
  handlePaneClick: (event: React.MouseEvent) => void;
  onNodesChangeWithDragControl: (changes: NodeChange[]) => void;
  doubleClickPosition: { x: number; y: number } | null;
  setDoubleClickPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
}

export const usePaneInteractions = (
  editingNodeIds: React.MutableRefObject<Set<string>>,
  nodesRef: React.MutableRefObject<Node[]>,
  onNodesChange: (changes: NodeChange[]) => void
): PaneInteractions => {
  const [doubleClickPosition, setDoubleClickPosition] = useState<{ x: number; y: number } | null>(null);

  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.detail === 2) {
        // 直接使用鼠标事件的clientX和clientY作为双击位置，不转换为画布坐标
        const position = {
          x: event.clientX,
          y: event.clientY
        };
        setDoubleClickPosition(position);
      }
    },
    []
  );

  const onNodesChangeWithDragControl = useCallback((changes: NodeChange[]) => {
    const filteredChanges = changes.map(change => {
      if (change.type === 'position' && change.dragging) {
        const nodeId = change.id;
        const isCurrentlyEditing = editingNodeIds.current.has(nodeId);
        if (isCurrentlyEditing) {
          const node = nodesRef.current.find(n => n.id === nodeId);
          return { ...change, position: node ? node.position : change.position };
        }
      }
      return change;
    });
    
    // 处理节点删除操作
    const deletedNodeIds = filteredChanges
      .filter(change => change.type === 'remove')
      .map(change => change.id);
    
    // 从全局状态中删除对应的节点数据
    if (deletedNodeIds.length > 0) {
      const textNodesStore = useTextNodesStore.getState();
      
      // 处理多个节点删除，确保每个删除操作的稳定性
      deletedNodeIds.forEach(nodeId => {
        try {
          textNodesStore.deleteTextNode(nodeId);
          console.log(`节点 ${nodeId} 删除成功`);
        } catch (error) {
          console.error(`删除节点 ${nodeId} 失败:`, error);
          // 这里可以添加用户错误提示，例如通过 toast 通知
          // 由于 React Flow 已经删除了节点，我们需要重新添加回来以保持一致性
          // 但考虑到获取完整节点数据的复杂性，这里仅记录错误
        }
      });
    }
    
    onNodesChange(filteredChanges);
  }, [onNodesChange, editingNodeIds, nodesRef]);

  return {
    handlePaneClick,
    onNodesChangeWithDragControl,
    doubleClickPosition,
    setDoubleClickPosition
  };
};