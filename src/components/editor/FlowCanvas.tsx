'use client';

import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { 
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  type OnConnect,
  type Edge,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Add, SwapHoriz } from '@mui/icons-material';

import { TextNode, ImageNode, VideoNode, FabricImageEditor } from '@/components/editor';
import LeftSidebar from '@/components/layout/LeftSidebar';
import { useNodeOperations } from '@/hooks/editor/useNodeOperations';
import { useCropOperations } from '@/hooks/utils/useCropOperations';
import { usePaneInteractions } from '@/hooks/editor/usePaneInteractions';
import { useNodeAddition } from '@/hooks/editor/useNodeAddition';
import { useNodeCentering } from '@/hooks/editor/useNodeCentering';

export interface FlowCanvasProps {
  projectId: string | null;
}

const FlowCanvasContent: React.FC<FlowCanvasProps> = ({ projectId }) => {
  const reactFlowInstance = useReactFlow();
  const { screenToFlowPosition } = reactFlowInstance;

  const centerNode = useNodeCentering(reactFlowInstance);
  
  const nodeOperations = useNodeOperations();
  const cropOperations = useCropOperations(centerNode);
  
  const nodesRef = useRef(nodeOperations.nodes);
  useEffect(() => {
    nodesRef.current = nodeOperations.nodes;
  }, [nodeOperations.nodes]);

  const [nodeId, setNodeId] = useState(1);
  
  const { addTextNode, addImageNode, addVideoNode } = useNodeAddition({
    nodeId,
    setNodeId,
    setNodes: nodeOperations.setNodes,
    handleTypeChange: nodeOperations.handleTypeChange,
    handleDelete: nodeOperations.handleDelete,
    handleBackgroundColorChange: nodeOperations.handleBackgroundColorChange,
    handleImageUpdate: nodeOperations.handleImageUpdate,
    handleFontTypeChange: nodeOperations.handleFontTypeChange,
    onEditingChange: nodeOperations.handleEditingChange,
    onEditStart: cropOperations.handleEditStart,
    onCropStart: cropOperations.handleCropStart
  });

  const paneInteractions = usePaneInteractions(
    addTextNode,
    nodeOperations.editingNodeIds,
    nodesRef,
    nodeOperations.onNodesChange
  );

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

  const handleCropComplete = useCallback((nodeId: string, croppedImageUrl: string) => {
    nodeOperations.handleImageUpdate(nodeId, croppedImageUrl);
    cropOperations.setCroppingNode(null);
  }, [nodeOperations.handleImageUpdate, cropOperations.setCroppingNode]);

  return (
    <>
      <ReactFlow
        nodes={nodeOperations.nodes}
        edges={nodeOperations.edges}
        onNodesChange={paneInteractions.onNodesChangeWithDragControl}
        onEdgesChange={nodeOperations.onEdgesChange}
        onConnect={onConnect}
        onPaneClick={paneInteractions.handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
        zoomOnScroll={!nodeOperations.isAnyEditing}
        zoomOnPinch={!nodeOperations.isAnyEditing}
        proOptions={{ hideAttribution: true }}
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
          <span className="text-sm text-neutral-600">双击画布添加文本节点，点击节点工具栏 <SwapHoriz fontSize="small" /> 按钮切换节点类型</span>
        </div>

        <LeftSidebar
          onAddTextNode={addTextNode}
          onAddImageNode={addImageNode}
          onAddVideoNode={addVideoNode}
          onUploadImage={handleUploadImage}
          onUploadVideo={handleUploadVideo}
          projectId={projectId ? parseInt(projectId) : undefined}
        />
      </ReactFlow>

      {cropOperations.croppingNode && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <FabricImageEditor
              imageUrl={cropOperations.croppingNode.imageUrl}
              onCropComplete={(croppedImageUrl) => handleCropComplete(cropOperations.croppingNode!.id, croppedImageUrl)}
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