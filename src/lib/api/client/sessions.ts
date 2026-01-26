// 会话管理相关 API

import { api } from './index';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/config/api.config';

// 获取会话列表
export const getSessions = async (projectId: string | number, options?: {
  page?: number;
  page_size?: number;
}) => {
  const params = new URLSearchParams();
  params.append('project_id', String(projectId));
  
  if (options?.page) {
    params.append('page', options.page.toString());
  }
  
  if (options?.page_size) {
    params.append('page_size', options.page_size.toString());
  }
  
  const url = `${buildApiUrl(API_ENDPOINTS.SESSIONS.LIST)}?${params.toString()}`;
  return api.get(url);
};

// 获取会话详情
export const getSessionDetail = async (sessionId: string | number, messageLimit?: number) => {
  const params = new URLSearchParams();
  
  if (messageLimit) {
    params.append('message_limit', messageLimit.toString());
  }
  
  const url = `${buildApiUrl(API_ENDPOINTS.SESSIONS.DETAIL(sessionId))}${params.toString() ? '?' + params.toString() : ''}`;
  return api.get(url);
};

// 获取会话消息
export const getSessionMessages = async (sessionId: string | number, options?: {
  page?: number;
  page_size?: number;
}) => {
  const params = new URLSearchParams();
  
  if (options?.page) {
    params.append('page', options.page.toString());
  }
  
  if (options?.page_size) {
    params.append('page_size', options.page_size.toString());
  }
  
  const url = `${buildApiUrl(API_ENDPOINTS.SESSIONS.MESSAGES(sessionId))}?${params.toString()}`;
  return api.get(url);
};
