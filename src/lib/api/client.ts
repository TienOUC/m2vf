// API 请求客户端 - 核心请求函数

import type { ApiRequestOptions } from '@/lib/types/auth';
import {
  getAccessToken,
  refreshAccessToken,
  clearTokens
} from '@/lib/utils/token';
import { DEFAULT_CONFIG, ROUTES } from '@/lib/config/api.config';

// API 工具函数，用于处理需要认证的请求
export const apiRequest = async (
  url: string,
  options: ApiRequestOptions = {}
): Promise<Response> => {
  // 获取存储的 access_token
  const accessToken = getAccessToken();

  // 设置默认请求头
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {})
  };

  // 只有当没有设置 Content-Type 且不是 FormData 时才设置默认值
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // 如果有 access_token，添加到请求头
  if (accessToken) {
    (headers as Record<string, string>).Authorization = `Bearer ${accessToken}`;
  }

  // 设置超时时间（默认使用配置文件中的值）
  const timeout = options.timeout || DEFAULT_CONFIG.REQUEST_TIMEOUT;
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, timeout);

  // 发起请求
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      signal: abortController.signal
    });
  } catch (error: any) {
    clearTimeout(timeoutId);
    // 如果是超时错误
    if (error.name === 'AbortError') {
      throw new Error(`请求超时（${timeout / 1000} 秒）`);
    }
    throw error;
  }

  clearTimeout(timeoutId);

  // 如果返回 401 未授权，尝试刷新token
  if (response.status === 401 && accessToken) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      // 使用新token重试请求，也需要应用超时
      const retryAbortController = new AbortController();
      const retryTimeoutId = setTimeout(() => {
        retryAbortController.abort();
      }, timeout);

      try {
        (
          headers as Record<string, string>
        ).Authorization = `Bearer ${newAccessToken}`;
        response = await fetch(url, {
          ...options,
          headers,
          signal: retryAbortController.signal
        });
        clearTimeout(retryTimeoutId);
      } catch (retryError: any) {
        clearTimeout(retryTimeoutId);
        // 如果是超时错误
        if (retryError.name === 'AbortError') {
          throw new Error(`请求超时（${timeout / 1000} 秒）`);
        }
        throw retryError;
      }
    } else {
      // 刷新失败，重定向到登录页
      window.location.href = ROUTES.LOGIN;
      return response;
    }
  }

  // 如果仍然是401，清除本地存储并重定向到登录页
  if (response.status === 401) {
    clearTokens();
    window.location.href = ROUTES.LOGIN;
  }

  return response;
};
