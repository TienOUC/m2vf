// Types for Studio chat functionality

// 导入 IconName 类型
import type { IconName } from '@/components/icons/types';

export type ModelCategory = 'image' | 'video' | '3d';

export interface AIModel {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconName?: IconName;
  category: ModelCategory;
  time?: string;
}

export interface Artifact {
  id: string;
  type: 'image' | 'video';
  url?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  width?: number;
  height?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  modelUsed?: string;
  status?: 'pending' | 'complete' | 'error';
  thought?: string;
  imageUrl?: string;
  videoUrl?: string;
  artifacts?: Artifact[];
}

export type ViewMode = 'canvas' | '3d';
