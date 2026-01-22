import { create } from 'zustand';
import { UIState } from '@/lib/types/store';

// UI状态store
export const useUIStore = create<UIState>((set, get) => ({
  isSidebarOpen: true,
  isMobileMenuOpen: false,
  isDarkMode: false,
  isGlobalLoading: false,
  loadingMessage: null,
  message: {
    text: '',
    type: 'info',
    visible: false,
  },
  
  setIsSidebarOpen: (open) => set({ isSidebarOpen: open }),
  
  setIsMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  
  setIsDarkMode: (darkMode) => set({ isDarkMode: darkMode }),
  
  setGlobalLoading: (isLoading, message = null) => set({ isGlobalLoading: isLoading, loadingMessage: message }),
  
  setLoadingMessage: (message) => set({ loadingMessage: message }),
  
  showMessage: (text, type = 'info') => {
    set({
      message: {
        text,
        type,
        visible: true,
      }
    });
    
    // 3秒后自动隐藏消息
    setTimeout(() => {
      get().hideMessage();
    }, 3000);
  },
  
  hideMessage: () => set({
    message: {
      text: '',
      type: 'info',
      visible: false,
    }
  }),
}));