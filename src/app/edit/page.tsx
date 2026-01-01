// app/edit/page.tsx
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getUserProfile } from '@/lib/api/auth';
import { isUserLoggedIn } from '@/lib/utils/token';
import { ROUTES } from '@/lib/config/api.config';
import Navbar from '@/components/layout/Navbar';
import LeftSidebar from '@/components/layout/LeftSidebar';
import { TextNode, ImageNode, VideoNode, AudioNode } from '@/components/nodes';
import { useNodeAddition } from '@/hooks/useNodeAddition';
import { 
  useProjectEditingStore,
  useProjectManagementStore 
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

// 初始节点（空数组，画布初始为空）
const initialNodes: Node[] = [];

// 初始边
const initialEdges: Edge[] = [];

// ReactFlow 包装组件
function FlowCanvas({ projectId }: { projectId: string | null }) {
  // ReactFlow 状态管理
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeId, setNodeId] = useState(1); // 用于生成唯一节点ID（从1开始）
  const { screenToFlowPosition } = useReactFlow();

  // 节点删除回调
  const handleDelete = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
    },
    [setNodes, setEdges]
  );

  // 处理节点背景色更改
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

  // 处理节点字体样式更改
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

  // 节点类型切换回调
  const handleTypeChange = useCallback(
    (nodeId: string, newType: 'text' | 'image' | 'video' | 'audio') => {
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
                  : newType === 'video'
                  ? '视频节点'
                  : '音频节点',
              onTypeChange: handleTypeChange,
              onDelete: handleDelete,
              // 如果是文本节点转换为其他类型，移除背景色相关属性
              ...(node.type === 'text' && newType !== 'text' && { backgroundColor: undefined, onBackgroundColorChange: undefined }),
              // 如果是其他类型转换为文本节点，添加背景色相关属性
              ...(node.type !== 'text' && newType === 'text' && { backgroundColor: '#ffffff', onBackgroundColorChange: handleBackgroundColorChange }),
            };

            // 为图片、视频和音频节点添加onReplace回调
            if (
              newType === 'image' ||
              newType === 'video' ||
              newType === 'audio'
            ) {
              return {
                ...node,
                type: newType,
                data: {
                  ...baseData,
                  onReplace: (id: string) => {
                    // 这里可以添加具体的替换逻辑
                    console.log(`替换节点 ${id} 的文件`);
                  }
                }
              };
            }

            // 文本节点不需要onReplace回调
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
    [setNodes, handleDelete, handleBackgroundColorChange]
  );

  // 节点内容管理
  const nodeContentMap = useRef<Record<string, string>>({});
  const nodeHtmlContentMap = useRef<Record<string, string>>({});
  
  // 注册自定义节点类型
  const nodeTypes = useMemo(
    () => ({
      text: (props: any) => {
        const nodeId = props.id;
        const nodeData = props.data;
        
        // 创建获取内容的函数
        const getContent = (id: string) => {
          return nodeContentMap.current[id] || '';
        };
        const getRichContent = (id: string) => {
          return nodeHtmlContentMap.current[id] || '';
        };
        
        // 更新内容的函数
        const updateContent = (id: string, content: string) => {
          nodeContentMap.current[id] = content;
        };
        const updateHtmlContent = (id: string, html: string) => {
          nodeHtmlContentMap.current[id] = html;
        };
        
        return (
          <TextNode
            {...props}
            data={{
              ...nodeData,
              fontType: nodeData.fontType,
              getContent,
              getRichContent,
              onContentChange: (content: string) => updateContent(nodeId, content),
              onRichContentChange: (html: string) => updateHtmlContent(nodeId, html),
              onFontTypeChange: handleFontTypeChange
            }}
          />
        );
      },
      image: ImageNode,
      video: VideoNode,
      audio: AudioNode
    }),
    [handleFontTypeChange]
  );

  // 连接节点回调
  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // 使用节点添加 hooks
  const { addTextNode, addImageNode, addVideoNode, addAudioNode } =
    useNodeAddition({
      nodeId,
      setNodeId,
      setNodes,
      handleTypeChange,
      handleDelete,
      handleBackgroundColorChange,
      handleFontTypeChange
    });


  const handleUploadImage = useCallback(() => {
    console.log('上传图片功能');
    // 这里可以添加图片上传逻辑
    alert('上传图片功能即将实现');
  }, []);

  const handleUploadVideo = useCallback(() => {
    console.log('上传视频功能');
    // 这里可以添加视频上传逻辑
    alert('上传视频功能即将实现');
  }, []);

  const handleUploadAudio = useCallback(() => {
    console.log('上传音频功能');
    // 这里可以添加音频上传逻辑
    alert('上传音频功能即将实现');
  }, []);


  // 双击画布添加节点（默认添加文本节点）
  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      // 检查是否是双击事件
      if (event.detail === 2) {
        // 将屏幕坐标转换为流程图坐标（考虑缩放和平移）
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY
        });

        addTextNode(position);
      }
      // 单击事件：不需要额外处理，因为 useClickOutside 应该能处理
      // 但如果 ReactFlow 阻止了事件冒泡，我们需要手动关闭菜单
    },
    [addTextNode, screenToFlowPosition]
  );

  // 自定义节点拖拽处理
  const onNodesChangeWithDragControl = useCallback((changes: any[]) => {
    // 对于文本节点，如果处于编辑模式，则不允许拖拽
    const filteredChanges = changes.map(change => {
      if (change.type === 'position' && change.dragging) {
        const node = nodes.find(n => n.id === change.id);
        if (node && node.type === 'text' && node.data?.isEditing) {
          // 如果是文本节点且正在编辑，则忽略位置变化
          return { ...change, type: 'position', position: node.position };
        }
      }
      return change;
    });
    
    onNodesChange(filteredChanges);
  }, [onNodesChange, nodes]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChangeWithDragControl}
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
        onAddAudioNode={addAudioNode}
        onUploadImage={handleUploadImage}
        onUploadVideo={handleUploadVideo}
        onUploadAudio={handleUploadAudio}
        projectId={projectId ? parseInt(projectId) : undefined}
      />
    </ReactFlow>
  );
}

export default function EditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    { name: 'Guest User', email: 'guest@example.com' } // 模拟用户数据
  );
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false); // 新增状态来跟踪认证检查是否完成
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
    const checkAuth = async () => {
      // 先检查本地是否有 token
      if (!isUserLoggedIn()) {
        console.warn('未找到 token，跳转到登录页');
        router.replace(`${ROUTES.LOGIN}?redirect=${window.location.pathname}${window.location.search}`);
        setAuthChecked(true); // 设置认证检查完成，避免显示页面内容
        return;
      }

      try {
        const response = await getUserProfile();
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          
          // 如果有项目ID参数，获取项目详情
          if (projectId) {
            const projectData = await fetchProjectDetail(projectId);
            setProjectDetail(projectData);
          }
        } else {
          throw new Error('未认证');
        }
      } catch (error) {
        console.log(error);
        // 如果后端返回未认证，跳转到登录页
        console.warn('用户未认证，跳转到登录页');
        router.replace(`${ROUTES.LOGIN}?redirect=${window.location.pathname}${window.location.search}`);
      } finally {
        setIsLoading(false);
        setAuthChecked(true); // 设置认证检查完成
      }
    };

    checkAuth();
  }, [router, projectId, fetchProjectDetail]);

  // 在认证检查完成前不渲染任何内容，让全局loading组件处理
  if (!authChecked) {
    return null; // 让Next.js的loading组件处理加载状态
  }

  // 如果认证失败，已经重定向，这里也返回null
  if (!isUserLoggedIn() || !authChecked) {
    return null;
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
