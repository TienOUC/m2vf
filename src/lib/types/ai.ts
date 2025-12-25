// AI模型相关类型定义

export interface AIModel {
  id: string;
  name: string;
  description: string;
  generation_time: string;
  icon: string | null;
  enabled: boolean;
  category: 'text' | 'image' | 'video' | 'video_search' | '3d';
}

export interface AIModelListResponse {
  code: number;
  message: string;
  data: {
    text?: AIModel[];
    image?: AIModel[];
    video?: AIModel[];
    video_search?: AIModel[];
    '3d'?: AIModel[];
  };
}

export interface ParameterSchema {
  type: 'number' | 'integer' | 'string' | 'boolean' | 'array';
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  default: any;
  description?: string;
}

export interface AIModelParamsResponse {
  code: number;
  message: string;
  data: {
    model_id: string;
    category: 'text' | 'image' | 'video' | 'video_search' | '3d';
    parameters: Record<string, any>;
    parameter_schema: Record<string, ParameterSchema>;
  };
}
