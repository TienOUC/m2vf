// Mock data for Studio chat functionality

import { AIModel } from './types/studio';

// AI Models - Japanese-inspired with visual flair
export const AI_MODELS: AIModel[] = [
  {
    id: 'model-1',
    name: '可灵',
    description: 'High-quality image generation',
    icon: 'google',
    iconName: 'kling',
    category: 'image',
    time: '10s',
  },
  {
    id: 'model-2',
    name: '即梦',
    description: 'Cute and playful art style',
    icon: 'bytedance',
    iconName: 'jimeng',
    category: 'image',
    time: '12s',
  },
  {
    id: 'model-3',
    name: 'Vidu',
    description: 'Anime-style illustrations',
    icon: 'openai',
    iconName: 'vidu',
    category: 'image',
    time: '15s',
  },
  {
    id: 'model-4',
    name: 'MiniMax',
    description: 'Photorealistic images',
    icon: 'flux',
    iconName: 'minimax',
    category: 'image',
    time: '18s',
  },
  {
    id: 'model-5',
    name: '可灵',
    description: 'Short video generation',
    icon: 'pika',
    iconName: 'kling',
    category: 'video',
    time: '30s',
  },
  {
    id: 'model-6',
    name: '即梦',
    description: 'Short video generation',
    icon: 'pika',
    iconName: 'jimeng',
    category: 'video',
    time: '30s',
  },
  {
    id: 'model-7',
    name: 'Vidu',
    description: 'Short video generation',
    icon: 'pika',
    iconName: 'vidu',
    category: 'video',
    time: '30s',
  },
  {
    id: 'model-8',
    name: 'MiniMax',
    description: 'Short video generation',
    icon: 'pika',
    iconName: 'minimax',
    category: 'video',
    time: '30s',
  },
  {
    id: 'model-9',
    name: '3D Builder',
    description: '3D model generation',
    icon: 'meshy',
    category: '3d',
    time: '45s',
  },
];

// Mock projects for demo
export const PROJECTS = [
  {
    id: 'proj-1',
    title: '樱花小猫',
    date: '2026-01-19',
    type: '3d',
  },
  {
    id: 'proj-2',
    title: '梦幻场景',
    date: '2026-01-18',
    type: 'canvas',
  },
  {
    id: 'proj-3',
    title: '科技感界面',
    date: '2026-01-17',
    type: 'canvas',
  },
  {
    id: 'proj-4',
    title: '自然风景',
    date: '2026-01-16',
    type: '3d',
  },
];
