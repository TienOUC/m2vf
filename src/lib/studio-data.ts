// Mock data for Studio chat functionality

import { AIModel } from './types/studio';

// AI Models - Japanese-inspired with visual flair
export const AI_MODELS: AIModel[] = [
  {
    id: 'model-1',
    name: 'Seedream 4.0',
    description: 'High-quality image generation',
    icon: 'google',
    category: 'image',
    time: '10s',
  },
  {
    id: 'model-2',
    name: 'Kawaii V3',
    description: 'Cute and playful art style',
    icon: 'bytedance',
    category: 'image',
    time: '12s',
  },
  {
    id: 'model-3',
    name: 'Anime Master',
    description: 'Anime-style illustrations',
    icon: 'openai',
    category: 'image',
    time: '15s',
  },
  {
    id: 'model-4',
    name: 'Realistic Pro',
    description: 'Photorealistic images',
    icon: 'flux',
    category: 'image',
    time: '18s',
  },
  {
    id: 'model-5',
    name: 'Video Creator',
    description: 'Short video generation',
    icon: 'pika',
    category: 'video',
    time: '30s',
  },
  {
    id: 'model-6',
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
