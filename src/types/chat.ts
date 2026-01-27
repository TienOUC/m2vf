// 会话配置类型
export interface SessionConfig {
  max_tokens: number;
  model: string;
  system_prompt: string;
  temperature: number;
  thinking_mode: boolean;
  web_search: boolean;
}

// 会话项类型
export interface SessionItem {
  id: string;
  title: string;
  created_at: number;
  updated_at: number;
  last_message_at: number;
  message_count: number;
  project_id: string;
  status: number;
  config: SessionConfig;
}

// 消息状态类型
export type MessageStatus = 'complete' | 'pending';

// 消息角色类型
export type MessageRole = 'user' | 'assistant';

// 聊天消息类型
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  modelUsed?: string;
  status: MessageStatus;
  imageUrl?: string;
  videoUrl?: string;
}

// AI 模型类型
export interface AIModel {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
}

// SSE 事件类型
export interface SSEEvent {
  type: string;
  data: any;
}

// 会话更新类型
export interface SessionUpdate {
  title?: string;
  last_message_at?: number;
  config?: Partial<SessionConfig>;
  [key: string]: any;
}

// 生成状态类型
export interface GenerationState {
  isGenerating: boolean;
  progress: number;
}
