// AI 模型相关 API

import { apiRequest } from './client';
import type { AIModelListResponse, AIModelParamsResponse } from '../types/ai';

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
