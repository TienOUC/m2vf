// 分享管理相关 API

import { api } from './index';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/config/api.config';

// 获取分享链接列表
export const getShareLinks = async (sessionId: string | number) => {
  const params = new URLSearchParams();
  params.append('session_id', String(sessionId));
  
  const url = `${buildApiUrl(API_ENDPOINTS.SHARES.LIST)}?${params.toString()}`;
  return api.get(url);
};

// 获取分享链接详情
export const getShareLinkDetail = async (shareId: string | number) => {
  const url = buildApiUrl(API_ENDPOINTS.SHARES.DETAIL(shareId));
  return api.get(url);
};
