import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';

export interface PaneInteractions {
  handlePaneClick: (event: React.MouseEvent) => void;
  onNodesChangeWithDragControl: (changes: any[]) => void;
}

export const usePaneInteractions = (
  addTextNode: (position: { x: number; y: number }) => void,
  editingNodeIds: React.MutableRefObject<Set<string>>,
  nodesRef: React.MutableRefObject<any[]>,
  onNodesChange: (changes: any[]) => void
): PaneInteractions => {
  const { screenToFlowPosition } = useReactFlow();

  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.detail === 2) {
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY
        });

        addTextNode(position);
      }
    },
    [addTextNode, screenToFlowPosition]
  );

  const onNodesChangeWithDragControl = useCallback((changes: any[]) => {
    const filteredChanges = changes.map(change => {
      if (change.type === 'position' && change.dragging) {
        const nodeId = change.id;
        const isCurrentlyEditing = editingNodeIds.current.has(nodeId);
        if (isCurrentlyEditing) {
          const node = nodesRef.current.find(n => n.id === nodeId);
          return { ...change, type: 'position', position: node ? node.position : change.position };
        }
      }
      return change;
    });
    
    onNodesChange(filteredChanges);
  }, [onNodesChange, editingNodeIds, nodesRef]);

  return {
    handlePaneClick,
    onNodesChangeWithDragControl
  };
};