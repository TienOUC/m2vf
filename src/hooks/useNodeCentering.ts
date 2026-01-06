import { useCallback } from 'react';
import type { ReactFlowInstance } from '@xyflow/react';

/**
 * Hook to center a node on the canvas
 * @param reactFlowInstance - The ReactFlow instance
 * @returns A function to center a node by its ID
 */
export const useNodeCentering = (reactFlowInstance: ReactFlowInstance | null) => {
  return useCallback((nodeId: string) => {
    if (!reactFlowInstance) return;
    
    const reactFlowNode = reactFlowInstance.getNode(nodeId);
    if (!reactFlowNode) return;
    
    const nodeWidth = reactFlowNode.width || reactFlowNode.measured?.width || 200;
    const nodeHeight = reactFlowNode.height || reactFlowNode.measured?.height || 150;
    
    const nodeCenterX = reactFlowNode.position.x + nodeWidth / 2;
    const nodeCenterY = reactFlowNode.position.y + nodeHeight / 2;
    
    const viewport = reactFlowInstance.getViewport();
    
    if (typeof reactFlowInstance.setCenter === 'function') {
      reactFlowInstance.setCenter(nodeCenterX, nodeCenterY, {
        duration: 500,
        zoom: viewport.zoom
      });
    } else {
      const { flowToScreenPosition } = reactFlowInstance;
      const viewportCenterScreenX = window.innerWidth / 2;
      const viewportCenterScreenY = window.innerHeight / 2;
      
      const nodeCenterScreen = flowToScreenPosition({
        x: nodeCenterX,
        y: nodeCenterY
      });
      
      const offsetScreenX = viewportCenterScreenX - nodeCenterScreen.x;
      const offsetScreenY = viewportCenterScreenY - nodeCenterScreen.y;
      
      const offsetFlowX = offsetScreenX / viewport.zoom;
      const offsetFlowY = offsetScreenY / viewport.zoom;
      
      reactFlowInstance.setViewport({
        x: viewport.x + offsetFlowX,
        y: viewport.y + offsetFlowY,
        zoom: viewport.zoom
      }, {
        duration: 500,
      });
    }
  }, [reactFlowInstance]);
};
