'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { type Node } from '@xyflow/react';
import { NodeInteractionDialog } from '@/components/editor';

interface NodeDialogManagerProps {
  nodes: Node[];
  edges: any[];
  onNodesChange: (changes: any[]) => void;
  onDialogClose: () => void;
  onDialogSend: (content: string, model: string, config?: Record<string, any>) => void;
  onPaneClick: (event: React.MouseEvent) => void;
}

const NodeDialogManager: React.FC<NodeDialogManagerProps> = ({
  nodes,
  edges,
  onNodesChange,
  onDialogClose,
  onDialogSend,
  onPaneClick
}) => {
  // 对话框状态管理
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [dialogPosition, setDialogPosition] = useState({ x: 0, y: 0 });
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  // 优化：直接从节点数据计算对话框位置，避免DOM查询
  const updateDialogPositionFromNodeData = useCallback(() => {
    if (selectedNode) {
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

  // 处理节点选择变化
  const handleNodesChange = useCallback((changes: any[]) => {
    // 收集所有变化，区分选中和取消选中
    const selectedChanges = changes.filter(change => change.type === 'select' && change.selected);
    const unselectedChanges = changes.filter(change => change.type === 'select' && !change.selected);
    
    // 处理选中的节点 - 优先处理选中变化，确保对话框能正常显示
    if (selectedChanges.length > 0) {
      const selectedChange = selectedChanges[0];
      const node = nodes.find(n => n.id === selectedChange.id);
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
    onNodesChange(changes);
  }, [nodes, onNodesChange]);

  // 处理对话框关闭
  const handleDialogClose = useCallback(() => {
    setIsDialogVisible(false);
    setSelectedNode(null);
    onDialogClose();
  }, [onDialogClose]);

  // 查找与视频节点相连的首帧和尾帧图片节点
  const findConnectedFrameNodes = useCallback(() => {
    if (!selectedNode || selectedNode.type !== 'video') {
      return { firstFrameUrl: undefined, lastFrameUrl: undefined };
    }

    // 查找所有指向当前视频节点的边
    const incomingEdges = edges.filter(edge => edge.target === selectedNode.id);
    
    // 查找首帧和尾帧图片节点
    let firstFrameUrl: string | undefined;
    let lastFrameUrl: string | undefined;

    for (const edge of incomingEdges) {
      // 查找边的源节点
      const sourceNode = nodes.find(node => node.id === edge.source);
      if (sourceNode && sourceNode.type === 'image' && sourceNode.data) {
        // 检查是否是首帧或尾帧节点
        const imageData = sourceNode.data as any;
        if (imageData.frameType === 'first') {
          firstFrameUrl = imageData.imageUrl;
        } else if (imageData.frameType === 'last') {
          lastFrameUrl = imageData.imageUrl;
        }
      }
    }

    return { firstFrameUrl, lastFrameUrl };
  }, [selectedNode, nodes, edges]);

  // 处理画布点击事件，关闭对话框
  const handlePaneClick = useCallback((event: React.MouseEvent) => {
    // 调用原始的paneClick处理函数
    onPaneClick(event);
    
    // 关闭对话框
    handleDialogClose();
  }, [onPaneClick, handleDialogClose]);

  // 监听节点删除，关闭对应对话框
  useEffect(() => {
    if (selectedNode) {
      const nodeExists = nodes.some(node => node.id === selectedNode.id);
      if (!nodeExists) {
        handleDialogClose();
      }
    }
  }, [nodes, selectedNode, handleDialogClose]);

  // 监听节点位置变化，更新对话框位置
  useEffect(() => {
    if (selectedNode && isDialogVisible) {
      updateDialogPositionFromNodeData();
    }
  }, [nodes, selectedNode, isDialogVisible, updateDialogPositionFromNodeData]);

  return (
    <>
      {/* 节点交互对话框 */}
      {selectedNode && (
        <NodeInteractionDialog
          isVisible={isDialogVisible}
          position={dialogPosition}
          nodeType={selectedNode.type as 'text' | 'image' | 'video'}
          onClose={handleDialogClose}
          onSend={onDialogSend}
          {...findConnectedFrameNodes()}
        />
      )}
    </>
  );
};

export default NodeDialogManager;