import { useCallback } from 'react';
import type { ReactFlowInstance } from '@xyflow/react';

interface UseNodeCenteringOptions {
  onCenteringComplete?: (nodeId: string) => void;
  onCenteringError?: (nodeId: string, error: Error) => void;
}

/**
 * Hook to center a node on the canvas with async coordination support
 * @param reactFlowInstance - The ReactFlow instance
 * @returns A function to center a node by its ID with completion callbacks
 */
export const useNodeCentering = (reactFlowInstance: ReactFlowInstance | null) => {
  return useCallback((nodeId: string, options?: UseNodeCenteringOptions) => {
    if (!reactFlowInstance) {
      options?.onCenteringError?.(nodeId, new Error('ReactFlow实例不可用'));
      return Promise.reject(new Error('ReactFlow实例不可用'));
    }
    
    const reactFlowNode = reactFlowInstance.getNode(nodeId);
    if (!reactFlowNode) {
      options?.onCenteringError?.(nodeId, new Error(`节点 ${nodeId} 不存在`));
      return Promise.reject(new Error(`节点 ${nodeId} 不存在`));
    }
    
    return new Promise<void>((resolve, reject) => {
      try {
        const nodeWidth = reactFlowNode.width || reactFlowNode.measured?.width || 200;
        const nodeHeight = reactFlowNode.height || reactFlowNode.measured?.height || 150;
        
        const nodeCenterX = reactFlowNode.position.x + nodeWidth / 2;
        const nodeCenterY = reactFlowNode.position.y + nodeHeight / 2;
        
        const viewport = reactFlowInstance.getViewport();
        
        const centeringComplete = () => {
          options?.onCenteringComplete?.(nodeId);
          resolve();
        };
        
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
        
        // 使用setTimeout模拟动画完成，因为ReactFlow没有提供onComplete回调
        setTimeout(() => {
          centeringComplete();
        }, 600); // 比动画时长稍长，确保动画完成
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error : new Error('居中操作失败');
        options?.onCenteringError?.(nodeId, errorMsg);
        reject(errorMsg);
      }
    });
  }, [reactFlowInstance]);
};
