import { create } from 'zustand';
import { generateId } from '@/lib/utils/id';

// 聊天输入区域的文件类型
export interface ChatFile {
  id: string;
  file: File | null;
  thumbnailUrl: string;
  type: 'image' | 'video';
  url: string;
}

// 聊天文件状态管理接口
export interface ChatFilesState {
  chatFiles: ChatFile[];
  
  // 添加文件到聊天输入
  addChatFile: (file: Omit<ChatFile, 'id'>) => void;
  
  // 从聊天输入中移除文件
  removeChatFile: (id: string) => void;
  
  // 清空聊天输入中的所有文件
  clearChatFiles: () => void;
}

// 创建聊天文件状态管理 store
export const useChatFilesStore = create<ChatFilesState>((set) => ({
  chatFiles: [],
  
  addChatFile: (file) => {
    set((state) => ({
      chatFiles: [...state.chatFiles, { ...file, id: generateId() }],
    }));
  },
  
  removeChatFile: (id) => {
    set((state) => ({
      chatFiles: state.chatFiles.filter((file) => file.id !== id),
    }));
  },
  
  clearChatFiles: () => {
    set({ chatFiles: [] });
  },
}));
