'use client';

import { useCallback } from 'react';
import { Edge, addEdge } from '@xyflow/react';

interface UseNodeConnectionProps {
  setEdges: (edges: Edge[] | ((prevEdges: Edge[]) => Edge[])) => void;
}

export const useNodeConnection = ({ setEdges }: UseNodeConnectionProps) => {
  // 处理节点连接
  const onConnect = useCallback(
    (params: any) => setEdges((eds: Edge[]) => addEdge(params, eds)),
    [setEdges]
  );

  return {
    onConnect
  };
};
