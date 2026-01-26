// 连线管理相关 API

import { api } from './index';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/config/api.config';

// 获取连线列表
export const getEdges = async (projectId: string | number) => {
  const params = new URLSearchParams();
  params.append('project_id', String(projectId));
  
  const url = `${buildApiUrl(API_ENDPOINTS.EDGES.LIST)}?${params.toString()}`;
  return api.get(url);
};

// 批量创建连线
export const batchCreateEdges = async (edgesData: any) => {
  const url = buildApiUrl(API_ENDPOINTS.EDGES.BATCH_CREATE);
  return api.post(url, edgesData);
};

// 同步连线
export const syncEdges = async (projectId: string | number, edgesData: any) => {
  const params = new URLSearchParams();
  params.append('project_id', String(projectId));
  
  const url = `${buildApiUrl(API_ENDPOINTS.EDGES.SYNC)}?${params.toString()}`;
  return api.put(url, edgesData);
};

// 获取连线详情
export const getEdgeDetail = async (edgeId: string | number) => {
  const url = buildApiUrl(API_ENDPOINTS.EDGES.DETAIL(edgeId));
  return api.get(url);
};
