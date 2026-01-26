// AI 模型相关 API

import { api } from './index';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/config/api.config';
import type { AIModelListResponse, AIModelParamsResponse } from '@/lib/types/ai';

// 获取AI模型列表
export const getAIModels = async (): Promise<AIModelListResponse> => {
  const modelsUrl = buildApiUrl(API_ENDPOINTS.AI.MODELS);
  return api.get<AIModelListResponse>(modelsUrl);
};

// 获取AI模型参数配置
export const getAIModelParams = async (
  modelId: string,
  category?: 'text' | 'image' | 'video' | 'video_search' | '3d'
): Promise<AIModelParamsResponse> => {
  const baseUrl = buildApiUrl(API_ENDPOINTS.AI.MODEL_PARAMS(modelId));
  const params = new URLSearchParams();
  
  if (category) {
    params.append('category', category);
  }
  
  const paramsUrl = `${baseUrl}${params.toString() ? '?' + params.toString() : ''}`;
  
  return api.get<AIModelParamsResponse>(paramsUrl);
};

// 去除图片背景
// Remove background from image
export const removeImageBackground = async (imageUrl: string): Promise<string> => {
  const removeBgUrl = buildApiUrl('/v1/ai/remove-background');
  
  const data = await api.post<{ processed_image_url: string }>(removeBgUrl, {
    image_url: imageUrl,
    prompt: '去除图片背景'
  });
  
  return data.processed_image_url;
};
