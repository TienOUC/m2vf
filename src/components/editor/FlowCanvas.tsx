'use client';

import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { Add } from '@mui/icons-material';
import { 
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  type OnConnect,
  type Edge,
  type Node,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';


import { TextNode, ImageNode, VideoNode, FabricImageEditor, NodeInteractionDialog } from '@/components/editor';
import LeftSidebar from '@/components/layout/LeftSidebar';
import { useNodeOperations } from '@/hooks/editor/useNodeOperations';
import { useCropOperations } from '@/hooks/utils/useCropOperations';
import { usePaneInteractions } from '@/hooks/editor/usePaneInteractions';
import { useNodeAddition } from '@/hooks/editor/useNodeAddition';
import { useNodeCentering } from '@/hooks/editor/useNodeCentering';
import { useBackgroundRemoval } from '@/hooks/editor/useBackgroundRemoval'; // 新增：导入背景移除hook

import FloatingMenu from '@/components/ui/FloatingMenu';
import MenuButton from '@/components/ui/MenuButton';
import { TextFields, Image as ImageIcon, VideoFile } from '@mui/icons-material';

export interface FlowCanvasProps {
  projectId: string | null;
}

const FlowCanvasContent: React.FC<FlowCanvasProps> = ({ projectId }) => {
  // 确保React Flow组件能够正确获取尺寸信息
  React.useEffect(() => {
    // 强制重新计算布局
    const handleResize = () => {
      window.dispatchEvent(new Event('resize'));
    };
    
    // 初始化时触发一次
    handleResize();
    
    return () => {
      // 清理事件监听器（如果有的话）
    };
  }, []);
  const reactFlowInstance = useReactFlow();
  const { screenToFlowPosition } = reactFlowInstance;

  const centerNode = useNodeCentering(reactFlowInstance);
  
  // 初始化nodeId，考虑已有的节点和持久化节点，避免重复ID
  const [nodeId, setNodeId] = useState(() => {
    return 1;
  });
  
  const cropOperations = useCropOperations(centerNode);
  
  // 创建ref来保存回调函数，这样可以在useEffect中更新
  const callbacksRef = useRef({
    onEditStart: cropOperations.handleEditStart,
    onCropStart: cropOperations.handleCropStart,
    onBackgroundRemove: (nodeId: string) => {}
  });

  // 使用节点操作hook，传入回调函数（使用ref的current值）
  const nodeOperations = useNodeOperations({
    onEditStart: (nodeId: string) => callbacksRef.current.onEditStart(nodeId),
    onCropStart: (nodeId: string, imageUrl: string) => callbacksRef.current.onCropStart(nodeId, imageUrl),
    onBackgroundRemove: (nodeId: string) => callbacksRef.current.onBackgroundRemove(nodeId)
  });

  // 使用背景移除hook
  const { handleBackgroundRemove } = useBackgroundRemoval({
    setNodes: nodeOperations.setNodes,
    setEdges: nodeOperations.setEdges,
    handleDelete: nodeOperations.handleDelete,
    handleImageUpdate: nodeOperations.handleImageUpdate,
    handleDownload: nodeOperations.handleDownload,
    handleEditStart: cropOperations.handleEditStart,
    handleCropStart: cropOperations.handleCropStart,
    setNodeIdCounter: setNodeId,
    simulateBackendRequest: true // 启用模拟后端请求
  });

  // 更新ref中的回调函数
  useEffect(() => {
    callbacksRef.current = {
      onEditStart: cropOperations.handleEditStart,
      onCropStart: cropOperations.handleCropStart,
      onBackgroundRemove: handleBackgroundRemove
    };
  }, [cropOperations.handleEditStart, cropOperations.handleCropStart, handleBackgroundRemove]);
  
  const nodesRef = useRef(nodeOperations.nodes);
  useEffect(() => {
    nodesRef.current = nodeOperations.nodes;
  }, [nodeOperations.nodes]);

  // 监听节点变化，确保nodeId始终比现有节点的最大ID大1
  useEffect(() => {
    if (nodeOperations.nodes.length > 0) {
      // 从现有的节点中找出最大的ID值，支持带时间戳的ID格式：node-123-4567
      const maxId = nodeOperations.nodes.reduce((max, node) => {
        const idMatch = node.id.match(/node-(\d+)(?:-\d+)?$/);
        if (idMatch) {
          const numId = parseInt(idMatch[1], 10);
          return numId > max ? numId : max;
        }
        return max;
      }, 0);
      // 更新nodeId，确保新节点ID唯一
      setNodeId(maxId + 1);
    } else {
      // 如果没有节点，重置为1
      setNodeId(1);
    }
  }, [nodeOperations.nodes]);

  const { addTextNode, addImageNode, addVideoNode } = useNodeAddition({
    nodeId,
    setNodeId,
    setNodes: nodeOperations.setNodes,
    handleDelete: nodeOperations.handleDelete,
    handleBackgroundColorChange: nodeOperations.handleBackgroundColorChange,
    handleImageUpdate: nodeOperations.handleImageUpdate,
    handleFontTypeChange: nodeOperations.handleFontTypeChange,
    onEditingChange: nodeOperations.handleEditingChange,
    onEditStart: cropOperations.handleEditStart,
    onCropStart: cropOperations.handleCropStart,
    handleDownload: nodeOperations.handleDownload,
    handleBackgroundRemove: handleBackgroundRemove
  });

  const paneInteractions = usePaneInteractions(
    nodeOperations.editingNodeIds,
    nodesRef,
    nodeOperations.onNodesChange
  );
  
  // 对话框状态管理
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [dialogPosition, setDialogPosition] = useState({ x: 0, y: 0 });
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  
  // 优化：直接从节点数据计算对话框位置，避免DOM查询
  const updateDialogPositionFromNodeData = useCallback(() => {
    if (selectedNode) {
      // 计算节点在屏幕上的位置 - 直接使用节点数据，避免DOM查询
      // 这里需要考虑画布的缩放和位移，使用reactFlowInstance的project方法
      // 首先获取节点的中心底部位置
      const nodeCenterBottom = {
        x: selectedNode.position.x + (selectedNode.width || 0) / 2,
        y: selectedNode.position.y + (selectedNode.height || 0)
      };
      
      // 直接使用requestAnimationFrame更新位置，确保平滑跟随
      requestAnimationFrame(() => {
        setDialogPosition(prevPosition => {
          // 如果节点数据没有变化，就不更新位置，减少不必要的重绘
          const nodeElement = document.querySelector(`[data-id="${selectedNode.id}"]`);
          if (nodeElement) {
            const rect = nodeElement.getBoundingClientRect();
            const newPosition = {
              x: rect.left + rect.width / 2,
              y: rect.bottom
            };
            
            // 只有位置变化超过1像素时才更新，减少不必要的重绘
            if (Math.abs(newPosition.x - prevPosition.x) > 1 || Math.abs(newPosition.y - prevPosition.y) > 1) {
              return newPosition;
            }
          }
          return prevPosition;
        });
      });
    }
  }, [selectedNode]);
  
  // 监听节点位置变化，更新对话框位置
  useEffect(() => {
    if (selectedNode && isDialogVisible) {
      updateDialogPositionFromNodeData();
    }
  }, [nodeOperations.nodes, selectedNode, isDialogVisible, updateDialogPositionFromNodeData]);
  
  // 处理节点选择变化
  const handleNodesChange = useCallback((changes: any[]) => {
    // 收集所有变化，区分选中和取消选中
    const selectedChanges = changes.filter(change => change.type === 'select' && change.selected);
    const unselectedChanges = changes.filter(change => change.type === 'select' && !change.selected);
    
    // 处理选中的节点 - 优先处理选中变化，确保对话框能正常显示
    if (selectedChanges.length > 0) {
      const selectedChange = selectedChanges[0];
      const node = nodeOperations.nodes.find(n => n.id === selectedChange.id);
      if (node) {
        setSelectedNode(node);
        setIsDialogVisible(true);
      }
    } 
    // 只有在没有选中变化时，才处理取消选中
    else if (unselectedChanges.length > 0) {
      // 节点被取消选中
      setIsDialogVisible(false);
      setSelectedNode(null);
    }
    
    // 调用原始的nodesChange处理函数
    paneInteractions.onNodesChangeWithDragControl(changes);
  }, [nodeOperations.nodes, paneInteractions.onNodesChangeWithDragControl]);
  
  // 处理对话框关闭
  const handleDialogClose = useCallback(() => {
    setIsDialogVisible(false);
    setSelectedNode(null);
  }, []);
  
  // 处理对话框发送
  const handleDialogSend = useCallback((content: string, model: string, config?: Record<string, any>) => {
    console.log('Dialog send:', { content, model, config, nodeId: selectedNode?.id });
    // 这里可以添加发送逻辑，例如调用API或更新节点内容
    handleDialogClose();
  }, [selectedNode?.id, handleDialogClose]);
  
  // 处理画布点击事件，关闭对话框
  const handlePaneClick = useCallback((event: React.MouseEvent) => {
    // 调用原始的paneClick处理函数
    paneInteractions.handlePaneClick(event);
    
    // 关闭对话框
    handleDialogClose();
  }, [paneInteractions.handlePaneClick, handleDialogClose]);
  
  // 监听节点删除，关闭对应对话框
  useEffect(() => {
    if (selectedNode) {
      const nodeExists = nodeOperations.nodes.some(node => node.id === selectedNode.id);
      if (!nodeExists) {
        handleDialogClose();
      }
    }
  }, [nodeOperations.nodes, selectedNode, handleDialogClose]);

  // 关闭弹出菜单的处理函数
  const handleCloseMenu = () => {
    paneInteractions.setDoubleClickPosition(null);
  };

  const onConnect: OnConnect = useCallback(
    (params) => nodeOperations.setEdges((eds: Edge[]) => addEdge(params, eds)),
    [nodeOperations.setEdges]
  );

  const handleUploadImage = useCallback(() => {
    console.log('上传图片功能');
    alert('上传图片功能即将实现');
  }, []);

  const handleUploadVideo = useCallback(() => {
    console.log('上传视频功能');
    alert('上传视频功能即将实现');
  }, []);

  const nodeTypes = useMemo(
    () => ({
      text: TextNode,
      image: ImageNode,
      video: VideoNode
    }),
    []
  );

  const handleCropComplete = useCallback((croppedImageUrl: string) => {
    if (cropOperations.croppingNode) {
      nodeOperations.handleImageUpdate(cropOperations.croppingNode.id, croppedImageUrl);
      cropOperations.setCroppingNode(null);
    }
  }, [nodeOperations.handleImageUpdate, cropOperations.setCroppingNode, cropOperations.croppingNode]);

  return (
    <>
      {/* 为 ReactFlow 添加明确的高度和宽度设置 - 使用视口高度减去navbar高度（padding + content + border）*/}
      <div style={{ width: '100%', height: 'calc(100vh - 70px)', position: 'relative', display: 'block' }}>
        <ReactFlow
          nodes={nodeOperations.nodes}
          edges={nodeOperations.edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={nodeOperations.onEdgesChange}
          onConnect={onConnect}
          onPaneClick={handlePaneClick}
          // 新增：监听画布变化，更新对话框位置
          onMoveEnd={() => {
            if (selectedNode && isDialogVisible) {
              updateDialogPositionFromNodeData();
            }
          }}
          nodeTypes={nodeTypes}
          fitView
          zoomOnScroll={!nodeOperations.isAnyEditing}
          zoomOnPinch={!nodeOperations.isAnyEditing}
          proOptions={{ hideAttribution: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={12}
            size={1}
            color="var(--color-neutral-400)"
          />
          <Controls />
          <MiniMap />

          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md border border-neutral-200 z-10 flex items-center gap-2">
            <Add fontSize="small" />
            <span className="text-sm text-neutral-600">双击添加节点</span>
          </div>

          <LeftSidebar
            onAddTextNode={addTextNode}
            onAddImageNode={addImageNode}
            onAddVideoNode={addVideoNode}
            onUploadImage={handleUploadImage}
            onUploadVideo={handleUploadVideo}
            projectId={projectId ? parseInt(projectId) : undefined}
          />

          {/* 双击弹出的添加节点菜单 */}
          {paneInteractions.doubleClickPosition && (
            <div
              className="absolute"
              style={{
                left: paneInteractions.doubleClickPosition.x,
                top: paneInteractions.doubleClickPosition.y,
                transform: 'translate(-50%, -50%)',
                zIndex: 1000
              }}
            >
              <FloatingMenu
                isOpen={!!paneInteractions.doubleClickPosition}
                onClose={handleCloseMenu}
                title="添加节点"
                width="w-48"
              >
                <MenuButton
                  icon={<TextFields fontSize="small" />}
                  label="文本"
                  onClick={() => {
                    if (paneInteractions.doubleClickPosition) {
                      // 将屏幕坐标转换为画布坐标
                      const flowPosition = screenToFlowPosition(paneInteractions.doubleClickPosition);
                      addTextNode(flowPosition);
                      handleCloseMenu();
                    }
                  }}
                />
                <MenuButton
                  icon={<ImageIcon fontSize="small" />}
                  label="图片"
                  onClick={() => {
                    if (paneInteractions.doubleClickPosition) {
                      // 将屏幕坐标转换为画布坐标
                      const flowPosition = screenToFlowPosition(paneInteractions.doubleClickPosition);
                      addImageNode(flowPosition);
                      handleCloseMenu();
                    }
                  }}
                />
                <MenuButton
                  icon={<VideoFile fontSize="small" />}
                  label="视频"
                  onClick={() => {
                    if (paneInteractions.doubleClickPosition) {
                      // 将屏幕坐标转换为画布坐标
                      const flowPosition = screenToFlowPosition(paneInteractions.doubleClickPosition);
                      addVideoNode(flowPosition);
                      handleCloseMenu();
                    }
                  }}
                />
              </FloatingMenu>
            </div>
          )}
        </ReactFlow>
      </div>

      {/* 节点交互对话框 */}
      {selectedNode && (
        <NodeInteractionDialog
          isVisible={isDialogVisible}
          position={dialogPosition}
          nodeType={selectedNode.type as 'text' | 'image' | 'video'}
          onClose={handleDialogClose}
          onSend={handleDialogSend}
        />
      )}

      {cropOperations.croppingNode && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <FabricImageEditor
              imageUrl={cropOperations.croppingNode.imageUrl}
              onCropComplete={(croppedImageUrl) => handleCropComplete(croppedImageUrl)}
              onCancel={() => cropOperations.setCroppingNode(null)}
            />
          </div>
        </div>
      )}
    </>
  );
};

const FlowCanvas: React.FC<FlowCanvasProps> = ({ projectId }) => {
  return (
    <ReactFlowProvider>
      <FlowCanvasContent projectId={projectId} />
    </ReactFlowProvider>
  );
};

export default FlowCanvas;