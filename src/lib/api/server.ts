// 服务器端API调用工具函数

import { cookies } from 'next/headers';

export const fetchServerApi = async (url: string, options: RequestInit = {}) => {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  const headers = new Headers(options.headers || {});
  
  // 如果有访问令牌，添加到请求头
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  // 默认内容类型
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
    // 默认使用缓存策略
    next: {
      revalidate: 60, // 缓存1分钟
    },
  });

  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status}`);
  }

  return response.json();
};
