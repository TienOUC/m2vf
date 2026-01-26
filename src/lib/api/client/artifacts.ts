// 制品管理相关 API

import { api } from './index';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/config/api.config';

// 获取制品列表
export const getArtifacts = async (projectId: string | number) => {
  const params = new URLSearchParams();
  params.append('project_id', String(projectId));
  
  const url = `${buildApiUrl(API_ENDPOINTS.ARTIFACTS.LIST)}?${params.toString()}`;
  return api.get(url);
};

// 创建制品
export const createArtifact = async (artifactData: any) => {
  const url = buildApiUrl(API_ENDPOINTS.ARTIFACTS.CREATE);
  return api.post(url, artifactData);
};

// 批量更新制品
export const batchUpdateArtifacts = async (updateData: any) => {
  const url = buildApiUrl(API_ENDPOINTS.ARTIFACTS.BATCH_UPDATE);
  return api.put(url, updateData);
};

// 批量删除制品
export const batchDeleteArtifacts = async (deleteData: any) => {
  const url = buildApiUrl(API_ENDPOINTS.ARTIFACTS.BATCH_DELETE);
  return api.delete(url, { body: deleteData });
};

// 从帧生成视频
export const generateVideoFromFrames = async (videoData: any) => {
  const url = buildApiUrl(API_ENDPOINTS.ARTIFACTS.GENERATE_VIDEO_FROM_FRAMES);
  return api.post(url, videoData);
};

// 从图文生成视频
export const generateVideoGeneral = async (videoData: any) => {
  const url = buildApiUrl(API_ENDPOINTS.ARTIFACTS.GENERATE_VIDEO_GENERAL);
  return api.post(url, videoData);
};

// 获取制品详情
export const getArtifactDetail = async (artifactId: string | number) => {
  const url = buildApiUrl(API_ENDPOINTS.ARTIFACTS.DETAIL(artifactId));
  return api.get(url);
};

// 更新制品
export const updateArtifact = async (artifactId: string | number, artifactData: any) => {
  const url = buildApiUrl(API_ENDPOINTS.ARTIFACTS.UPDATE(artifactId));
  return api.put(url, artifactData);
};
