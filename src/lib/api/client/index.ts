// API 请求客户端 - 核心请求函数

import type { ApiRequestOptions } from '../shared/types';
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

  // 开发环境下的 Mock 逻辑（仅在客户端执行）
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    try {
      // 使用静态导入而不是动态导入，避免路径问题
      const { shouldUseMock, executeMock } = await import('@/lib/api/client/mock');
      if (shouldUseMock(url, options)) {
        return executeMock(url, options);
      }
    } catch (error) {
      console.error('Mock handler import error:', error);
      // Mock导入失败时，继续使用真实API，而不是中断整个流程
    }
  }

  // 设置超时时间（默认使用配置文件中的值）
  const timeout = options.timeout || DEFAULT_CONFIG.REQUEST_TIMEOUT;
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, timeout);

  // 添加缓存策略和重验证机制
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    signal: abortController.signal,
    // 默认使用缓存策略
    cache: options.cache || 'force-cache',
    // 添加Next.js特定的fetch选项
    next: options.next || {
      revalidate: 60, // 默认缓存1分钟
    },
  };

  // 发起请求
  let response: Response;
  try {
    response = await fetch(url, fetchOptions);
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
      // 刷新失败，重定向到登录页（仅客户端执行）
      if (typeof window !== 'undefined') {
        window.location.href = ROUTES.LOGIN;
      }
      return response;
    }
  }

  // 如果仍然是401，清除本地存储并重定向到登录页（仅客户端执行）
  if (response.status === 401) {
    clearTokens();
    if (typeof window !== 'undefined') {
      window.location.href = ROUTES.LOGIN;
    }
  }

  // 处理响应，检查是否是标准化的错误响应
  try {
    // 仅处理JSON响应
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      const responseData = await response.clone().json();
      
      // 检查是否是标准化的错误响应
      if (!response.ok && responseData.success === false && responseData.error) {
        const error = new Error(responseData.error.message);
        // 添加额外的错误信息
        (error as any).code = responseData.error.code;
        (error as any).details = responseData.error.details;
        (error as any).status = response.status;
        throw error;
      }
    }
  } catch (jsonError) {
    // 如果解析JSON失败，忽略这个错误，继续返回原始响应
    console.debug('解析响应JSON失败:', jsonError);
  }

  return response;
};
