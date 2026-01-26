// 资产管理相关 API

import { api } from './index';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/config/api.config';

// 获取资产列表
export const getAssets = async (sessionId: string | number, options?: {
  type?: string;
  page?: number;
  page_size?: number;
}) => {
  const params = new URLSearchParams();
  params.append('session_id', String(sessionId));
  
  if (options?.type) {
    params.append('type', options.type);
  }
  
  if (options?.page) {
    params.append('page', options.page.toString());
  }
  
  if (options?.page_size) {
    params.append('page_size', options.page_size.toString());
  }
  
  const url = `${buildApiUrl(API_ENDPOINTS.ASSETS.LIST)}?${params.toString()}`;
  return api.get(url);
};

// 上传资产
export const uploadAsset = async (projectId: string | number, file: File) => {
  const formData = new FormData();
  formData.append('project_id', String(projectId));
  formData.append('file', file);
  
  const url = buildApiUrl(API_ENDPOINTS.ASSETS.UPLOAD);
  return api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 批量获取资产状态
export const batchGetAssetStatus = async (assetIds: string[]) => {
  const url = buildApiUrl(API_ENDPOINTS.ASSETS.BATCH_STATUS);
  return api.post(url, { asset_ids: assetIds });
};

// 获取资产详情
export const getAssetDetail = async (assetId: string | number) => {
  const url = buildApiUrl(API_ENDPOINTS.ASSETS.DETAIL(assetId));
  return api.get(url);
};

// 获取资产状态
export const getAssetStatus = async (assetId: string | number) => {
  const url = buildApiUrl(API_ENDPOINTS.ASSETS.STATUS(assetId));
  return api.get(url);
};
