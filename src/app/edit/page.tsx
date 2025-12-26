// app/edit/page.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile } from '@/lib/api/auth';
import { isUserLoggedIn } from '@/lib/utils/token';
import { ROUTES } from '@/lib/config/api.config';
import Navbar from '@/components/layout/Navbar';
import LeftSidebar from '@/components/layout/LeftSidebar';
import { TextNode, ImageNode, VideoNode } from '@/components/nodes';
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
import { Add, TextFields, Image as ImageIcon, VideoFile } from '@mui/icons-material';

// 初始节点（空数组，画布初始为空）
const initialNodes: Node[] = [];

// 初始边
const initialEdges: Edge[] = [];

// ReactFlow 包装组件
function FlowCanvas() {
  // ReactFlow 状态管理
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeId, setNodeId] = useState(1); // 用于生成唯一节点ID（从1开始）
  const { screenToFlowPosition } = useReactFlow();

  // 节点删除回调
  const handleDelete = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    },
    [setNodes, setEdges]
  );

  // 节点类型切换回调
  const handleTypeChange = useCallback(
    (nodeId: string, newType: 'text' | 'image' | 'video') => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            const baseData = {
              ...node.data,
              label: newType === 'text' ? '文本节点'
                    : newType === 'image' ? '图片节点'
                    : '视频节点',
              onTypeChange: handleTypeChange,
              onDelete: handleDelete,
            };
            
            // 为图片和视频节点添加onReplace回调
            if (newType === 'image' || newType === 'video') {
              return {
                ...node,
                type: newType,
                data: {
                  ...baseData,
                  onReplace: (id: string) => {
                    // 这里可以添加具体的替换逻辑
                    console.log(`替换节点 ${id} 的文件`);
                  },
                },
              };
            }
            
            // 文本节点不需要onReplace回调
            return {
              ...node,
              type: newType,
              data: baseData,
            };
          }
          return node;
        })
      );
    },
    [setNodes, handleDelete]
  );

  // 注册自定义节点类型
  const nodeTypes = useMemo(
    () => ({
      text: TextNode,
      image: ImageNode,
      video: VideoNode,
    }),
    []
  );

  // 连接节点回调
  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // 添加文本节点函数
  const addTextNode = useCallback(
    (position?: { x: number; y: number }) => {
      // 如果没有提供位置，使用画布中心作为默认位置
      const pos = position || screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      
      const newNode: Node = {
        id: `node-${nodeId}`,
        type: 'text',
        position: pos,
        data: { 
          label: '文本节点',
          onTypeChange: handleTypeChange,
          onDelete: handleDelete,
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setNodeId((id) => id + 1);
    },
    [nodeId, setNodes, screenToFlowPosition, handleTypeChange, handleDelete]
  );

  // 双击画布添加节点（默认添加文本节点）
  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      // 检查是否是双击事件
      if (event.detail === 2) {
        // 将屏幕坐标转换为流程图坐标（考虑缩放和平移）
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        
        addTextNode(position);
      }
    },
    [addTextNode, screenToFlowPosition]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onPaneClick={handlePaneClick}
      nodeTypes={nodeTypes}
      fitView
      proOptions={{ hideAttribution: true }}
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
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md border border-gray-200 z-10 flex items-center gap-2">
        <Add fontSize="small" />
        <span className="text-sm text-gray-600">
          双击画布添加文本节点，点击节点右上角按钮可切换类型或删除
        </span>
      </div>
      
      {/* 左侧悬浮工具栏 */}
      <LeftSidebar onAddTextNode={addTextNode} />
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
    // 绕过认证检查，直接设置一个模拟用户
    // 在登录接口可用后，可将此部分替换回原始认证逻辑
    setUser({
      name: 'Demo User',
      email: 'demo@example.com'
    });
    setIsLoading(false);
    
    // 原始认证逻辑（注释）：
    /*
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
    */
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
