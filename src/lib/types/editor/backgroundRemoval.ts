// 背景去除功能相关类型定义
import type { Node, Edge } from '@xyflow/react';
import type { ImageNodeData } from '@/components/editor/nodes/ImageNode';

/**
 * 背景去除选项配置
 */
export interface BackgroundRemovalOptions {
  /** 当前节点列表 */
  currentNodes: Node[];
  /** 设置节点列表的函数 */
  setNodes: (nodes: Node[] | ((prevNodes: Node[]) => Node[])) => void;
  /** 设置边列表的函数 */
  setEdges: (edges: Edge[] | ((prevEdges: Edge[]) => Edge[])) => void;
  /** 删除节点的函数 */
  handleDelete: (nodeId: string) => void;
  /** 更新图片的函数 */
  handleImageUpdate: (nodeId: string, imageUrl: string) => void;
  /** 下载图片的函数 */
  handleDownload: (nodeId: string) => void;
  /** 开始编辑的函数 */
  handleEditStart: (nodeId: string) => void;
  /** 开始裁剪的函数 */
  handleCropStart: (nodeId: string, imageUrl: string) => void;
  /** 设置节点ID计数器的函数 */
  setNodeIdCounter: React.Dispatch<React.SetStateAction<number>>;
  /** 是否模拟后端请求 */
  simulateBackendRequest?: boolean;
}

/**
 * 背景去除结果
 */
export interface BackgroundRemovalResult {
  /** 处理背景去除的函数 */
  handleBackgroundRemove: (originalNodeId: string) => void;
}

/**
 * 节点ID计数器更新选项
 */
export interface NodeIdCounterOptions {
  /** 设置节点ID计数器的函数 */
  setNodeIdCounter: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * 背景去除节点创建选项
 */
export interface BackgroundRemovalNodeOptions {
  /** 删除节点的函数 */
  handleDelete: (nodeId: string) => void;
  /** 更新图片的函数 */
  handleImageUpdate: (nodeId: string, imageUrl: string) => void;
  /** 开始编辑的函数 */
  handleEditStart: (nodeId: string) => void;
  /** 开始裁剪的函数 */
  handleCropStart: (nodeId: string, imageUrl: string) => void;
  /** 下载图片的函数 */
  handleDownload: (nodeId: string) => void;
}

/**
 * 背景去除处理状态
 */
export interface BackgroundRemovalProcessState {
  /** 是否正在处理中 */
  isProcessing: boolean;
  /** 处理进度（0-100） */
  processingProgress: number;
  /** 错误信息 */
  error?: string;
}

/**
 * 背景去除节点数据扩展
 */
export interface BackgroundRemovalNodeData extends ImageNodeData {
  /** 背景去除处理状态 */
  backgroundRemovalState?: BackgroundRemovalProcessState;
}

/**
 * 背景去除API请求参数
 */
export interface RemoveBackgroundRequest {
  /** 图片URL */
  image_url: string;
  /** 提示词 */
  prompt: string;
}

/**
 * 背景去除API响应结果
 */
export interface RemoveBackgroundResponse {
  /** 处理后的图片URL */
  processed_image_url: string;
}
