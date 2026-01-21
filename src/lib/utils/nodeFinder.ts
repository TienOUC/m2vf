'use client';

import { Node, Edge } from '@xyflow/react';

/**
 * 查找与视频节点相连的首帧和尾帧图片节点
 * @param videoNode 视频节点
 * @param nodes 所有节点列表
 * @param edges 所有边列表
 * @returns 首帧和尾帧图片节点的URL
 */
export const findVideoFrameNodes = (
  videoNode: Node,
  nodes: Node[],
  edges: Edge[]
) => {
  // 查找所有指向当前视频节点的边
  const incomingEdges = edges.filter(edge => edge.target === videoNode.id);
  
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
};

/**
 * 查找特定ID的节点
 * @param nodes 节点列表
 * @param nodeId 节点ID
 * @returns 找到的节点，找不到则返回null
 */
export const findNodeById = (nodes: Node[], nodeId: string): Node | null => {
  return nodes.find(node => node.id === nodeId) || null;
};

/**
 * 查找所有指向特定节点的边
 * @param edges 边列表
 * @param targetNodeId 目标节点ID
 * @returns 指向目标节点的所有边
 */
export const findIncomingEdges = (edges: Edge[], targetNodeId: string): Edge[] => {
  return edges.filter(edge => edge.target === targetNodeId);
};

/**
 * 查找所有从特定节点出发的边
 * @param edges 边列表
 * @param sourceNodeId 源节点ID
 * @returns 从源节点出发的所有边
 */
export const findOutgoingEdges = (edges: Edge[], sourceNodeId: string): Edge[] => {
  return edges.filter(edge => edge.source === sourceNodeId);
};

/**
 * 查找与特定节点相连的所有节点
 * @param nodeId 节点ID
 * @param nodes 节点列表
 * @param edges 边列表
 * @returns 与特定节点相连的所有节点
 */
export const findConnectedNodes = (nodeId: string, nodes: Node[], edges: Edge[]): Node[] => {
  const connectedNodeIds = new Set<string>();

  // 查找所有与该节点相关的边
  const relatedEdges = edges.filter(edge => edge.source === nodeId || edge.target === nodeId);

  // 收集所有相连的节点ID
  relatedEdges.forEach(edge => {
    if (edge.source === nodeId) {
      connectedNodeIds.add(edge.target);
    }
    if (edge.target === nodeId) {
      connectedNodeIds.add(edge.source);
    }
  });

  // 根据ID查找节点
  return Array.from(connectedNodeIds)
    .map(id => findNodeById(nodes, id))
    .filter((node): node is Node => node !== null);
};
