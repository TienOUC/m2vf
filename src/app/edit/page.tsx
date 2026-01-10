'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/lib/config/api.config';
import Navbar from '@/components/layout/Navbar';
import LeftSidebar from '@/components/layout/LeftSidebar';
import { TextNode, ImageNode, VideoNode } from '@/components/nodes';
import FabricImageEditor from '@/components/nodes/FabricImageEditor';
import { useNodeAddition } from '@/hooks/useNodeAddition';
import { useNodeCentering } from '@/hooks/useNodeCentering';
import { 
  useProjectEditingStore,
  useProjectManagementStore,
  useAuthStore
} from '@/lib/stores';
import ProjectEditModal from '@/components/common/ProjectEditModal';
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
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Add,
  SwapHoriz
} from '@mui/icons-material';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];



function FlowCanvas({ projectId }: { projectId: string | null }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeId, setNodeId] = useState(1);
  const reactFlowInstance = useReactFlow();
  const { screenToFlowPosition } = reactFlowInstance;

  const nodesRef = useRef(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  const centerNode = useNodeCentering(reactFlowInstance);
  const [croppingNode, setCroppingNode] = useState<{id: string, imageUrl: string} | null>(null);

  // 处理裁剪开始 - 居中画布
  const handleEditStart = useCallback((nodeId: string) => {
    centerNode(nodeId);
  }, [centerNode]);

  // 处理裁剪开始 - 打开裁剪编辑器
  const handleCropStart = useCallback((nodeId: string, imageUrl: string) => {
    setCroppingNode({ id: nodeId, imageUrl });
  }, []);

  const handleReplace = useCallback(
    (nodeId: string) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                needsUpdate: true
              }
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const handleImageUpdate = useCallback(
    (nodeId: string, imageUrl: string) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                imageUrl: imageUrl
              }
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const handleDelete = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
    },
    [setNodes, setEdges]
  );

  const handleBackgroundColorChange = useCallback((nodeId: string, color: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              backgroundColor: color,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const handleFontTypeChange = useCallback((nodeId: string, fontType: 'h1' | 'h2' | 'h3' | 'p') => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              fontType: fontType,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const handleTypeChange = useCallback(
    (nodeId: string, newType: 'text' | 'image' | 'video') => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            const baseData = {
              ...node.data,
              label:
                newType === 'text'
                  ? '文本节点'
                  : newType === 'image'
                  ? '图片节点'
                  : '视频节点',
              onTypeChange: handleTypeChange,
              onDelete: handleDelete,
              ...(node.type === 'text' && newType !== 'text' && { backgroundColor: undefined, onBackgroundColorChange: undefined }),
              ...(node.type !== 'text' && newType === 'text' && { backgroundColor: '#ffffff', onBackgroundColorChange: handleBackgroundColorChange }),
            };

            if (
              newType === 'image' ||
              newType === 'video'
            ) {
              return {
                ...node,
                type: newType,
                data: {
                  ...baseData,
                  onReplace: handleReplace,
                  ...(newType === 'image' && { onImageUpdate: handleImageUpdate })
                }
              };
            }

            return {
              ...node,
              type: newType,
              data: baseData
            };
          }
          return node;
        })
      );
    },
    [setNodes, handleDelete, handleBackgroundColorChange, handleReplace, handleImageUpdate]
  );

  const nodeContentMap = useRef<Record<string, string>>({});
  const nodeHtmlContentMap = useRef<Record<string, string>>({});
  const editingNodeIds = useRef<Set<string>>(new Set());
  const [isAnyEditing, setIsAnyEditing] = useState(false);

  const handleEditingChange = useCallback((nodeId: string, editing: boolean) => {
    if (editing) {
      editingNodeIds.current.add(nodeId);
    } else {
      editingNodeIds.current.delete(nodeId);
    }
    setIsAnyEditing(editingNodeIds.current.size > 0);
  }, []);

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const { addTextNode, addImageNode, addVideoNode } =
    useNodeAddition({
      nodeId,
      setNodeId,
      setNodes,
      handleTypeChange,
      handleDelete,
      handleBackgroundColorChange,
      handleImageUpdate,
      handleFontTypeChange,
      onEditingChange: handleEditingChange,
      onEditStart: handleEditStart,
      onCropStart: handleCropStart
    });


  const handleUploadImage = useCallback(() => {
    console.log('上传图片功能');
    alert('上传图片功能即将实现');
  }, []);

  const handleUploadVideo = useCallback(() => {
    console.log('上传视频功能');
    alert('上传视频功能即将实现');
  }, []);




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
  }, [onNodesChange]);

  const handleCropComplete = useCallback((nodeId: string, croppedImageUrl: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              imageUrl: croppedImageUrl,
            },
          };
        }
        return node;
      })
    );
    setCroppingNode(null);
  }, [setNodes]);

  const nodeTypes = useMemo(
    () => ({
      text: TextNode,
      image: ImageNode,
      video: VideoNode
    }),
    []
  );

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeWithDragControl}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
        zoomOnScroll={!isAnyEditing}
        zoomOnPinch={!isAnyEditing}
        proOptions={{ hideAttribution: true }}
      >
        {/* 点状背景 */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={12}
          size={1}
          color="var(--color-neutral-400)"
        />
        {/* 控制面板 */}
        <Controls />
        {/* 缩略图 */}
        <MiniMap />

        {/* 操作提示 */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md border border-neutral-200 z-10 flex items-center gap-2">
          <Add fontSize="small" />
          <span className="text-sm text-neutral-600">双击画布添加文本节点，点击节点工具栏 <SwapHoriz fontSize="small" /> 按钮切换节点类型</span>
        </div>

        {/* 左侧悬浮工具栏 */}
        <LeftSidebar
          onAddTextNode={addTextNode}
          onAddImageNode={addImageNode}
          onAddVideoNode={addVideoNode}
          onUploadImage={handleUploadImage}
          onUploadVideo={handleUploadVideo}
          projectId={projectId ? parseInt(projectId) : undefined}
        />
      </ReactFlow>

      {/* 裁剪编辑器 Overlay - 在 ReactFlow 外部渲染，确保全屏显示 */}
      {croppingNode && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <FabricImageEditor
              imageUrl={croppingNode.imageUrl}
              onCropComplete={(croppedImageUrl) => handleCropComplete(croppingNode.id, croppedImageUrl)}
              onCancel={() => setCroppingNode(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default function EditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  
  const { user, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [projectDetail, setProjectDetail] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const { 
    projectName: editProjectName, 
    setProjectName,
    projectDescription: editProjectDescription, 
    setProjectDescription,
    fetchProjectDetail,
    updateProjectInfo,
    resetForm,
  } = useProjectEditingStore();
  
  const { updateProject } = useProjectManagementStore();
  
  useEffect(() => {
    // 如果认证检查已经完成，不再重复执行
    if (authChecked) return;
    
    // 检查全局认证状态
    if (!isAuthenticated || !user) {
      // 只在第一次检查时输出警告，避免重复警告
      if (!authChecked) {
        console.warn('用户未认证，跳转到登录页');
      }
      router.replace(`${ROUTES.LOGIN}?redirect=${window.location.pathname}${window.location.search}`);
      setAuthChecked(true);
      return;
    }

    // 如果有项目ID参数，获取项目详情
    const fetchProjectData = async () => {
      if (projectId) {
        try {
          const projectData = await fetchProjectDetail(projectId);
          setProjectDetail(projectData);
        } catch (error) {
          console.error('获取项目详情失败:', error);
        }
      }
      setIsLoading(false);
      setAuthChecked(true);
    };

    fetchProjectData();
  }, [router, projectId, fetchProjectDetail, isAuthenticated, user, authChecked]);

  // 在认证检查完成前显示加载状态
  if (!authChecked) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">检查用户认证状态...</p>
        </div>
      </div>
    );
  }

  // 如果认证失败，显示错误信息（实际上应该已经重定向）
  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">认证失败，请重新登录</p>
          <button 
            onClick={() => router.replace(`${ROUTES.LOGIN}?redirect=${window.location.pathname}${window.location.search}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            前往登录
          </button>
        </div>
      </div>
    );
  }
  
  // 编辑项目信息的函数
  const handleEditProject = async () => {
    if (!projectId) return;
    
    try {
      await updateProjectInfo(projectId);
      
      alert('项目信息更新成功！');
      setShowEditModal(false);
    } catch (error: any) {
      console.error('更新项目信息错误:', error);
      alert(`更新项目信息失败: ${error.message}`);
    }
  };
  
  // 打开编辑模态框的函数
  const openEditModal = () => {
    if (projectDetail) {
      setProjectName(projectDetail.name);
      setProjectDescription(projectDetail.description);
      setShowEditModal(true);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* 顶部导航栏 */}
      <Navbar 
        user={user} 
      />

      {/* 主编辑器区域 - ReactFlow画布 */}
      <main className="flex-1 bg-neutral-50">
        <div className="w-full h-full">
          <ReactFlowProvider>
            <FlowCanvas projectId={projectId} />
          </ReactFlowProvider>
        </div>
      </main>
      
      {/* 编辑项目基础信息的模态框 */}
      <ProjectEditModal
        isOpen={showEditModal}
        projectName={editProjectName}
        projectDescription={editProjectDescription}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        onSave={handleEditProject}
        onProjectNameChange={setProjectName}
        onProjectDescriptionChange={setProjectDescription}
      />
    </div>
  );
}
