'use client';

import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  ReactFlow,
  Background,
  Controls,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import { MousePointerClick } from 'lucide-react';
import '@xyflow/react/dist/style.css';

import { TextNode, ImageNode, VideoNode, FabricImageEditor, NodeInteractionDialog } from '@/components/editor';
import LeftSidebar from '@/components/layout/LeftSidebar';
import { BackButton, DoubleClickMenu, NodeGenerator } from './FlowCanvas/index';
import { 
  useNodeOperations, 
  usePaneInteractions, 
  useNodeAddition, 
  useNodeCentering, 
  useBackgroundRemoval,
  useNodePosition,
  useNodeConnection,
  useVideoNode,
  useDialogSend,
  useNodeDialog
} from '@/hooks/editor';
import { useCropOperations } from '@/hooks/utils/useCropOperations';

export interface FlowCanvasProps {
  projectId: string | null;
}

const FlowCanvasContent: React.FC<FlowCanvasProps> = ({ projectId }) => {
  React.useEffect(() => {
    const handleResize = () => {
      window.dispatchEvent(new Event('resize'));
    };
    
    handleResize();
    
    return () => {
    };
  }, []);
  const reactFlowInstance = useReactFlow();
  const { screenToFlowPosition } = reactFlowInstance;

  const centerNode = useNodeCentering(reactFlowInstance);
  
  const cropOperations = useCropOperations(centerNode);
  
  const callbacksRef = useRef({
    onEditStart: cropOperations.handleEditStart,
    onCropStart: cropOperations.handleCropStart,
    onBackgroundRemove: (nodeId: string) => {}
  });

  const { nodeId, setNodeId } = useNodePosition({ nodes: [] });

  const nodeOperations = useNodeOperations({
    onEditStart: (nodeId: string) => callbacksRef.current.onEditStart(nodeId),
    onCropStart: (nodeId: string, imageUrl: string) => callbacksRef.current.onCropStart(nodeId, imageUrl),
    onBackgroundRemove: (nodeId: string) => callbacksRef.current.onBackgroundRemove(nodeId)
  });

  const { handleBackgroundRemove } = useBackgroundRemoval({
    setNodes: nodeOperations.setNodes,
    setEdges: nodeOperations.setEdges,
    handleDelete: nodeOperations.handleDelete,
    handleImageUpdate: nodeOperations.handleImageUpdate,
    handleDownload: nodeOperations.handleDownload,
    handleEditStart: cropOperations.handleEditStart,
    handleCropStart: cropOperations.handleCropStart,
    setNodeIdCounter: setNodeId,
    simulateBackendRequest: true
  });

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

  useEffect(() => {
  }, [nodeOperations.nodes]);

  const { initializeVideoNodes, handleFirstLastFrameGenerateRef, handleFirstFrameGenerateRef } = useVideoNode({
    nodes: nodeOperations.nodes,
    setNodes: nodeOperations.setNodes,
    setEdges: nodeOperations.setEdges,
    nodeId,
    setNodeId,
    handleDelete: nodeOperations.handleDelete,
    handleImageUpdate: nodeOperations.handleImageUpdate,
    handleDownload: nodeOperations.handleDownload,
    handleEditStart: cropOperations.handleEditStart,
    handleCropStart: cropOperations.handleCropStart,
    handleBackgroundRemove: handleBackgroundRemove
  });

  useEffect(() => {
    initializeVideoNodes();
  }, [initializeVideoNodes]);

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
    handleBackgroundRemove: handleBackgroundRemove,
    onFirstLastFrameGenerate: (id) => handleFirstLastFrameGenerateRef.current?.(id),
    onFirstFrameGenerate: (id) => handleFirstFrameGenerateRef.current?.(id)
  });

  const paneInteractions = usePaneInteractions(
    nodeOperations.editingNodeIds,
    nodesRef,
    nodeOperations.onNodesChange
  );
  
  // 处理对话框关闭
  const handleDialogClose = useCallback(() => {
    // 关闭对话框的逻辑由useNodeDialog hook内部管理
  }, []);
  
  // 使用节点对话框hook管理对话框和节点选择
  const { 
    selectedNode, 
    isDialogVisible, 
    dialogPosition, 
    handleMoveEnd, 
    handleNodesChange, 
    handlePaneClick
  } = useNodeDialog({
    nodes: nodeOperations.nodes,
    edges: nodeOperations.edges,
    paneInteractions,
    handleDialogClose
  });
  
  // 使用对话框发送hook处理对话框发送逻辑
  const { handleDialogSend, findConnectedFrameNodes } = useDialogSend({
    selectedNode,
    nodes: nodeOperations.nodes,
    edges: nodeOperations.edges,
    setNodes: nodeOperations.setNodes,
    handleDialogClose
  });
  
  useEffect(() => {
    if (selectedNode) {
      const nodeExists = nodeOperations.nodes.some(node => node.id === selectedNode.id);
      if (!nodeExists) {
        handleDialogClose();
      }
    }
  }, [nodeOperations.nodes, selectedNode, handleDialogClose]);

  const handleCloseMenu = () => {
    paneInteractions.setDoubleClickPosition(null);
  };

  const { onConnect } = useNodeConnection({ setEdges: nodeOperations.setEdges });

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
      <div style={{ width: '100%', height: '100vh', position: 'relative', display: 'block' }}>
        <BackButton />
        
        <ReactFlow
          nodes={nodeOperations.nodes}
          edges={nodeOperations.edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={nodeOperations.onEdgesChange}
          onConnect={onConnect}
          onPaneClick={handlePaneClick}
          onMoveEnd={handleMoveEnd}
          nodeTypes={nodeTypes}
          fitView
          zoomOnScroll={!nodeOperations.isAnyEditing}
          zoomOnPinch={!nodeOperations.isAnyEditing}
          zoomOnDoubleClick={false}
          proOptions={{ hideAttribution: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={12}
            size={1}
            color="var(--color-neutral-400)"
          />
          <Controls orientation="horizontal" className="custom-controls" />

          {nodeOperations.nodes.length === 0 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md border border-neutral-200 z-10 flex items-center gap-2">
              <MousePointerClick size={16} className="text-neutral-600" />
              <span className="text-sm text-neutral-600">双击画布添加节点</span>
            </div>
          )}

          <LeftSidebar
            onAddTextNode={addTextNode}
            onAddImageNode={addImageNode}
            onAddVideoNode={addVideoNode}
          />

          <DoubleClickMenu
            doubleClickPosition={paneInteractions.doubleClickPosition}
            onClose={handleCloseMenu}
            addTextNode={addTextNode}
            addImageNode={addImageNode}
            addVideoNode={addVideoNode}
            screenToFlowPosition={screenToFlowPosition}
          />
        </ReactFlow>
      </div>

      <NodeGenerator
        nodes={nodeOperations.nodes}
        setNodes={nodeOperations.setNodes}
        setEdges={nodeOperations.setEdges}
        handleDelete={nodeOperations.handleDelete}
        handleImageUpdate={nodeOperations.handleImageUpdate}
        handleDownload={nodeOperations.handleDownload}
        handleEditStart={cropOperations.handleEditStart}
        handleCropStart={cropOperations.handleCropStart}
        handleBackgroundRemove={handleBackgroundRemove}
        nodeId={nodeId}
        setNodeId={setNodeId}
      />

      {selectedNode && (
        <NodeInteractionDialog
          isVisible={isDialogVisible}
          position={dialogPosition}
          nodeType={selectedNode.type as 'text' | 'image' | 'video'}
          onClose={handleDialogClose}
          onSend={handleDialogSend}
          {...findConnectedFrameNodes()}
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