'use client';

/**
 * 构建图片生成请求参数
 * @param content 生成内容描述
 * @param model 模型名称
 * @param config 额外配置参数
 * @param nodeId 节点ID
 * @returns 图片生成请求参数
 */
export const buildImageGenerateRequest = (
  content: string,
  model: string,
  config?: Record<string, any>,
  nodeId?: string
) => {
  return {
    content,
    model,
    config: {
      ...config
    },
    nodeId
  };
};

/**
 * 构建视频生成请求参数
 * @param content 生成内容描述
 * @param model 模型名称
 * @param firstFrameUrl 首帧图片URL
 * @param lastFrameUrl 尾帧图片URL（可选）
 * @param config 额外配置参数
 * @param nodeId 节点ID
 * @returns 视频生成请求参数
 */
export const buildVideoGenerateRequest = (
  content: string,
  model: string,
  firstFrameUrl: string,
  lastFrameUrl?: string,
  config?: Record<string, any>,
  nodeId?: string
) => {
  return {
    content,
    model,
    config: {
      ...config,
      firstFrameUrl,
      lastFrameUrl
    },
    nodeId
  };
};

/**
 * 构建背景移除请求参数
 * @param imageUrl 图片URL
 * @param model 模型名称
 * @param config 额外配置参数
 * @param nodeId 节点ID
 * @returns 背景移除请求参数
 */
export const buildBackgroundRemoveRequest = (
  imageUrl: string,
  model: string,
  config?: Record<string, any>,
  nodeId?: string
) => {
  return {
    imageUrl,
    model,
    config: {
      ...config
    },
    nodeId
  };
};
