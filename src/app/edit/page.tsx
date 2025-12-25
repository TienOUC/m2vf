// app/edit/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile } from '@/lib/api/auth';
import { isUserLoggedIn } from '@/lib/utils/token';
import { ROUTES } from '@/lib/config/api.config';
import Navbar from '@/components/layout/Navbar';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  type Node,
  type Edge,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// 初始节点
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: '开始节点' },
    position: { x: 250, y: 25 },
  },
];

// 初始边
const initialEdges: Edge[] = [];

// ReactFlow 包装组件
function FlowCanvas() {
  // ReactFlow 状态管理
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeId, setNodeId] = useState(2); // 用于生成唯一节点ID
  const { screenToFlowPosition } = useReactFlow();

  // 连接节点回调
  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // 双击画布添加节点（使用 onDoubleClick 事件）
  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      // 检查是否是双击事件
      if (event.detail === 2) {
        // 将屏幕坐标转换为流程图坐标（考虑缩放和平移）
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        const newNode: Node = {
          id: `node-${nodeId}`,
          type: 'default',
          position,
          data: { label: `节点 ${nodeId}` },
        };

        setNodes((nds) => nds.concat(newNode));
        setNodeId((id) => id + 1);
      }
    },
    [nodeId, setNodes, screenToFlowPosition]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onPaneClick={handlePaneClick}
      fitView
    >
      {/* 点状背景 */}
      <Background
        variant={BackgroundVariant.Dots}
        gap={12}
        size={1}
        color="#94a3b8"
      />
      {/* 控制面板 */}
      <Controls />
      {/* 缩略图 */}
      <MiniMap />
      
      {/* 操作提示 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md border border-gray-200 z-10">
        <p className="text-sm text-gray-600">
          💡 双击画布任意位置可快速添加节点
        </p>
      </div>
    </ReactFlow>
  );
}

export default function EditPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 组件加载时检查用户是否已认证
    const checkAuth = async () => {
      // 先检查本地是否有 token
      if (!isUserLoggedIn()) {
        console.warn('未找到 token，跳转到登录页');
        router.replace(`${ROUTES.LOGIN}?redirect=${ROUTES.EDIT}`);
        return;
      }

      try {
        const response = await getUserProfile();
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          throw new Error('未认证');
        }
      } catch (error) {
        // 如果后端返回未认证，跳转到登录页
        console.warn('用户未认证，跳转到登录页');
        router.replace(`${ROUTES.LOGIN}?redirect=${ROUTES.EDIT}`);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* 顶部导航栏 */}
      <Navbar user={user} />

      {/* 主编辑器区域 - ReactFlow画布 */}
      <main className="flex-1 bg-gray-50">
        <div className="w-full h-full">
          <ReactFlowProvider>
            <FlowCanvas />
          </ReactFlowProvider>
        </div>
      </main>
    </div>
  );
}
