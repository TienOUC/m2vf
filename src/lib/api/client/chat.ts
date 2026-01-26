// 聊天相关 API

import { api } from './index';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/config/api.config';
import { StreamChatRequest, SSEEvent, SSEEventType } from './sessions';

// 实现 POST /v1/chat/stream 接口
export const chatStream = async (
  data: StreamChatRequest,
  onEvent: (event: SSEEvent) => void,
  onError?: (error: Error) => void,
  abortController?: AbortController
) => {
  const url = buildApiUrl(API_ENDPOINTS.CHAT.STREAM);
  
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
            if (['thought', 'data', 'message', 'asset', 'generate_request', 'artifact', 'error', 'done'].includes(typeValue)) {
              eventType = typeValue as SSEEventType;
            } else {
              eventType = 'message';
            }
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
    console.error('Chat stream error:', error);
    onError?.(error as Error);
    return false;
  }
};
