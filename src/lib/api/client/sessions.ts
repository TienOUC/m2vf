// 会话管理相关 API

import { api } from './index';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/config/api.config';

// 创建会话请求参数类型
export interface CreateSessionRequest {
  project_id: string;
  title?: string;
  config?: {
    model?: string;
    system_prompt?: string;
    temperature?: number;
    thinking_mode?: boolean;
    web_search?: boolean;
    max_tokens?: number;
  };
}

// 更新会话请求参数类型
export interface UpdateSessionRequest {
  title?: string;
  config?: {
    model?: string;
    system_prompt?: string;
    temperature?: number;
    thinking_mode?: boolean;
    web_search?: boolean;
    max_tokens?: number;
  };
}

// 发送消息请求参数类型
export interface SendMessageRequest {
  content: string;
  asset_ids?: string[];
}

// 流式对话请求参数类型
export interface StreamChatRequest {
  content: string;
  asset_ids?: string[];
  model?: string;
  max_tokens?: number;
  temperature?: number;
  thinking_mode?: boolean;
  web_search?: boolean;
}

// 导入并重新导出SSE类型
import type { SSEEvent, SSEEventType } from '@/lib/utils/sseManager';
export type { SSEEvent, SSEEventType };

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

// 发送消息
export const sendMessage = async (sessionId: string | number, data: SendMessageRequest) => {
  const url = buildApiUrl(API_ENDPOINTS.SESSIONS.MESSAGES(sessionId));
  return api.post(url, data);
};

// 导入SSE管理器
import { createSSEConnection } from '@/lib/utils/sseManager';

// 流式对话
export const streamChat = async (
  data: StreamChatRequest,
  onEvent: (event: SSEEvent) => void,
  onError?: (error: Error) => void,
  abortController?: AbortController
) => {
  // 创建SSE连接配置
  const options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    signal: abortController?.signal,
  };

  // 创建SSE管理器实例
  const sseManager = createSSEConnection(
    API_ENDPOINTS.CHAT.STREAM,
    options,
    onEvent,
    onError,
    {
      maxRetries: 3,
      retryDelay: 1000
    }
  );

  // 启动SSE连接
  try {
    await sseManager.start();
    return true;
  } catch (error) {
    console.error('Stream chat error:', error);
    onError?.(error as Error);
    return false;
  }
};

// 创建会话
export const createSession = async (data: CreateSessionRequest) => {
  const url = buildApiUrl(API_ENDPOINTS.SESSIONS.CREATE);
  return api.post(url, data);
};

// 更新会话
export const updateSession = async (sessionId: string | number, data: UpdateSessionRequest) => {
  const url = buildApiUrl(API_ENDPOINTS.SESSIONS.UPDATE(sessionId));
  return api.put(url, data);
};

// 删除会话
export const deleteSession = async (sessionId: string | number) => {
  const url = buildApiUrl(API_ENDPOINTS.SESSIONS.DELETE(sessionId));
  return api.delete(url);
};
