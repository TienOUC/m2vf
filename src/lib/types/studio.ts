// Types for Studio chat functionality

export type ModelCategory = 'image' | 'video' | '3d';

export interface AIModel {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: ModelCategory;
  time?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  modelUsed?: string;
  status?: 'pending' | 'complete' | 'error';
  imageUrl?: string;
  videoUrl?: string;
}

export type ViewMode = 'canvas' | '3d';
