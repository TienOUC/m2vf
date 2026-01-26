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

// SSE事件类型
export type SSEEventType = 'thought' | 'data' | 'message' | 'asset' | 'generate_request' | 'artifact' | 'error' | 'done';

// SSE事件数据类型
export interface SSEEvent {
  type: SSEEventType;
  data: any;
}

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

// 流式对话
export const streamChat = async (
  sessionId: string | number,
  data: StreamChatRequest,
  onEvent: (event: SSEEvent) => void,
  onError?: (error: Error) => void,
  abortController?: AbortController
) => {
  const url = buildApiUrl(API_ENDPOINTS.SESSIONS.STREAM_CHAT(sessionId));
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: abortController?.signal,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }
    
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      
      // 处理SSE事件
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';
      
      for (const event of events) {
        if (!event.trim()) continue;
        
        const eventLines = event.split('\n');
        let eventType = 'message';
        let eventData = '';
        
        for (const line of eventLines) {
          if (line.startsWith('event:')) {
            const typeValue = line.slice(6).trim();
            // 确保eventType是有效的SSEEventType
            let validType: SSEEventType = 'message';
            if (typeValue === 'thought' || typeValue === 'data' || typeValue === 'message' || typeValue === 'asset' || typeValue === 'generate_request' || typeValue === 'artifact' || typeValue === 'error' || typeValue === 'done') {
              validType = typeValue as SSEEventType;
            }
            eventType = validType;
          } else if (line.startsWith('data:')) {
            eventData += line.slice(5).trim();
          }
        }
        
        if (eventData) {
          try {
            const parsedData = JSON.parse(eventData);
            // 直接断言整个事件对象为SSEEvent类型
            onEvent({ type: eventType, data: parsedData } as SSEEvent);
          } catch (parseError) {
            console.error('Failed to parse SSE data:', parseError);
            onError?.(new Error('Failed to parse server response'));
          }
        }
      }
    }
    
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
