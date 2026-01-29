// SSE连接管理工具

import { buildApiUrl } from '@/lib/config/api.config';

// SSE事件类型
export type SSEEventType = 'thought' | 'data' | 'message' | 'asset' | 'generate_request' | 'artifact' | 'artifact_status' | 'error' | 'done';

// SSE事件数据类型
export interface SSEEvent {
  type: SSEEventType;
  data: any;
}

// SSE管理器配置接口
interface SSEManagerConfig {
  maxRetries?: number;
  retryDelay?: number;
}

// SSE管理器类
export class SSEManager {
  private url: string;
  private options: RequestInit;
  private onEvent: (event: SSEEvent) => void;
  private onError?: (error: Error) => void;
  private abortController: AbortController;
  private maxRetries: number;
  private retryDelay: number;
  private retries: number = 0;
  private isConnected: boolean = false;
  private isRetrying: boolean = false;

  constructor(
    url: string,
    options: RequestInit,
    onEvent: (event: SSEEvent) => void,
    onError?: (error: Error) => void,
    config?: SSEManagerConfig
  ) {
    this.url = url;
    this.options = options;
    this.onEvent = onEvent;
    this.onError = onError;
    this.abortController = new AbortController();
    this.maxRetries = config?.maxRetries || 3;
    this.retryDelay = config?.retryDelay || 1000;
  }

  // 启动SSE连接
  async start(): Promise<void> {
    this.isRetrying = false;
    await this.connect();
  }

  // 连接SSE服务器
  private async connect(): Promise<void> {
    try {
      this.isConnected = true;
      const response = await fetch(this.url, {
        ...this.options,
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      await this.processStream(reader);
    } catch (error) {
      this.isConnected = false;
      this.handleError(error as Error);
    }
  }

  // 处理SSE流
  private async processStream(reader: ReadableStreamDefaultReader<Uint8Array>): Promise<void> {
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        buffer = await this.processBuffer(buffer);
      }
    } finally {
      reader.releaseLock();
      this.isConnected = false;
    }
  }

  // 处理缓冲区数据
  private async processBuffer(buffer: string): Promise<string> {
    const events = buffer.split('\n\n');
    const leftover = events.pop() || '';

    for (const event of events) {
      if (!event.trim()) continue;
      await this.parseEvent(event);
    }

    return leftover;
  }

  // 解析SSE事件
  private async parseEvent(eventString: string): Promise<void> {
    const eventLines = eventString.split('\n');
    let eventType: SSEEventType = 'message';
    let eventData = '';

    for (const line of eventLines) {
      if (line.startsWith('event:')) {
        const typeValue = line.slice(6).trim();
        eventType = this.validateEventType(typeValue);
      } else if (line.startsWith('data:')) {
        eventData += line.slice(5).trim();
      }
    }

    if (eventData) {
      try {
        const parsedData = JSON.parse(eventData);
        this.onEvent({ type: eventType, data: parsedData });
      } catch (parseError) {
        console.error('Failed to parse SSE data:', parseError);
        this.onError?.(new Error('Failed to parse server response'));
      }
    }
  }

  // 验证事件类型
  private validateEventType(type: string): SSEEventType {
    const validTypes: SSEEventType[] = ['thought', 'data', 'message', 'asset', 'generate_request', 'artifact', 'error', 'done'];
    return validTypes.includes(type as SSEEventType) ? (type as SSEEventType) : 'message';
  }

  // 处理错误
  private handleError(error: Error): void {
    if (this.abortController.signal.aborted) {
      // 如果是主动取消，不进行重连
      return;
    }

    this.onError?.(error);
    this.retry();
  }

  // 重连机制
  private retry(): void {
    if (this.isRetrying || this.retries >= this.maxRetries) {
      return;
    }

    this.isRetrying = true;
    this.retries++;
    const delay = this.retryDelay * Math.pow(2, this.retries - 1); // 指数退避

    setTimeout(async () => {
      this.isRetrying = false;
      await this.connect();
    }, delay);
  }

  // 断开连接
  disconnect(): void {
    this.abortController.abort();
    this.isConnected = false;
  }

  // 获取连接状态
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // 获取重试次数
  getRetryCount(): number {
    return this.retries;
  }
}

// 创建SSE连接的工厂函数
export const createSSEConnection = (
  endpoint: string,
  options: RequestInit,
  onEvent: (event: SSEEvent) => void,
  onError?: (error: Error) => void,
  config?: SSEManagerConfig
): SSEManager => {
  const url = buildApiUrl(endpoint);
  return new SSEManager(url, options, onEvent, onError, config);
};
