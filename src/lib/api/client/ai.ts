// AI 模型相关 API

import { apiRequest } from './index';
import type { AIModelListResponse, AIModelParamsResponse } from '@/lib/types/ai';

// 获取AI模型列表
export const getAIModels = async (): Promise<AIModelListResponse> => {
  const modelsUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/models/`
    : 'http://127.0.0.1:8000/api/ai/models/';

  const response = await apiRequest(modelsUrl, {
    method: 'GET'
  });

  if (!response.ok) {
    throw new Error(`获取模型列表失败: ${response.status}`);
  }

  const data: AIModelListResponse = await response.json();
  return data;
};

// 获取AI模型参数配置
export const getAIModelParams = async (
  modelId: string,
  category?: 'text' | 'image' | 'video' | 'video_search' | '3d'
): Promise<AIModelParamsResponse> => {
  let paramsUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/models/${modelId}/params/`
    : `http://127.0.0.1:8000/api/ai/models/${modelId}/params/`;

  // 如果提供了 category，添加到查询参数
  if (category) {
    paramsUrl += `?category=${category}`;
  }

  const response = await apiRequest(paramsUrl, {
    method: 'GET'
  });

  if (!response.ok) {
    throw new Error(`获取模型参数失败: ${response.status}`);
  }

  const data: AIModelParamsResponse = await response.json();
  return data;
};

// 去除图片背景
// Remove background from image
export const removeImageBackground = async (imageUrl: string): Promise<string> => {
  const removeBgUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/remove-background/`
    : 'http://127.0.0.1:8000/api/ai/remove-background/';

  const response = await apiRequest(removeBgUrl, {
    method: 'POST',
    body: JSON.stringify({
      image_url: imageUrl,
      prompt: '去除图片背景'
    })
  });

  if (!response.ok) {
    throw new Error(`去除背景失败: ${response.status}`);
  }

  const data = await response.json();
  return data.processed_image_url;
};
