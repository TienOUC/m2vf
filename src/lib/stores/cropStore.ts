import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { 
  CropState, 
  CropActions, 
  CropBoxConfig, 
  ImageInfo,
  EditorMode,
  SelectionState
} from '@/types/crop';

/**
 * 裁剪功能核心状态管理
 */
export const useCropStore = create<CropState & CropActions>()(
  devtools(
    (set, get) => ({
      // 基础状态
      imageUrl: '',
      fabricLoaded: false,
      loadingError: null,
      isProcessing: false,
      
      // 图片信息
      imageInfo: null,
      
      // 编辑器状态
      mode: 'select',
      isActive: false,
      isDragging: false,
      
      // 裁剪框状态
      cropBox: null,
      cropBoxConfig: {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
        stroke: '#ffffff',
        strokeWidth: 2,
        strokeDashArray: [2, 4],
        cornerSize: 12,
        cornerColor: '#ffffff',
        minWidth: 100,
        minHeight: 100
      },
      
      // 遮罩层状态
      maskOpacity: 0.7,
      showMask: true,
      
      // 选择状态
      selection: {
        isSelected: false,
        isResizing: false,
        isMoving: false
      },

      // Actions
      setImageUrl: (url: string) => set({ imageUrl: url }),
      
      setFabricLoaded: (loaded: boolean) => set({ fabricLoaded: loaded }),
      
      setLoadingError: (error: string | null) => set({ loadingError: error }),
      
      setIsProcessing: (processing: boolean) => set({ isProcessing: processing }),
      
      setImageInfo: (info: ImageInfo | null) => set({ imageInfo: info }),
      
      setMode: (mode: EditorMode) => set({ mode }),
      
      setIsActive: (active: boolean) => set({ isActive: active }),
      
      setIsDragging: (dragging: boolean) => set({ isDragging: dragging }),
      
      setCropBox: (cropBox: any | null) => set({ cropBox }),
      
      updateCropBoxConfig: (config: Partial<CropBoxConfig>) => set((state) => ({
        cropBoxConfig: { ...state.cropBoxConfig, ...config }
      })),
      
      setMaskOpacity: (opacity: number) => set({ maskOpacity: opacity }),
      
      setShowMask: (show: boolean) => set({ showMask: show }),
      
      updateSelection: (selection: Partial<SelectionState>) => set((state) => ({
        selection: { ...state.selection, ...selection }
      })),
      
      resetCropState: () => set({
        cropBox: null,
        mode: 'select',
        isActive: false,
        isDragging: false,
        selection: {
          isSelected: false,
          isResizing: false,
          isMoving: false
        }
      }),
      
      resetAll: () => set({
        imageUrl: '',
        fabricLoaded: false,
        loadingError: null,
        isProcessing: false,
        imageInfo: null,
        mode: 'select',
        isActive: false,
        isDragging: false,
        cropBox: null,
        maskOpacity: 0.7,
        showMask: true,
        selection: {
          isSelected: false,
          isResizing: false,
          isMoving: false
        }
      })
    }),
    {
      name: 'crop-store'
    }
  )
);

/**
 * 裁剪历史状态管理
 */
export const useCropHistoryStore = create<{
  history: CropState[];
  currentIndex: number;
  maxHistorySteps: number;
  canUndo: boolean;
  canRedo: boolean;
  addToHistory: (state: CropState) => void;
  undo: () => CropState | null;
  redo: () => CropState | null;
  clearHistory: () => void;
}>()(
  devtools(
    (set, get) => ({
      history: [],
      currentIndex: -1,
      maxHistorySteps: 10,
      canUndo: false,
      canRedo: false,
      
      addToHistory: (state: CropState) => set((storeState) => {
        const { history, currentIndex, maxHistorySteps } = storeState;
        
        // 删除当前位置之后的历史记录
        const newHistory = history.slice(0, currentIndex + 1);
        
        // 添加新状态
        newHistory.push(state);
        
        // 限制历史记录数量
        if (newHistory.length > maxHistorySteps) {
          newHistory.shift();
        }
        
        const newIndex = newHistory.length - 1;
        
        return {
          history: newHistory,
          currentIndex: newIndex,
          canUndo: newIndex > 0,
          canRedo: false
        };
      }),
      
      undo: () => {
        const { history, currentIndex } = get();
        
        if (currentIndex <= 0) return null;
        
        const newIndex = currentIndex - 1;
        const previousState = history[newIndex];
        
        set({
          currentIndex: newIndex,
          canUndo: newIndex > 0,
          canRedo: true
        });
        
        return previousState;
      },
      
      redo: () => {
        const { history, currentIndex } = get();
        const newIndex = currentIndex + 1;
        
        if (newIndex >= history.length) return null;
        
        const nextState = history[newIndex];
        
        set({
          currentIndex: newIndex,
          canUndo: true,
          canRedo: newIndex < history.length - 1
        });
        
        return nextState;
      },
      
      clearHistory: () => set({
        history: [],
        currentIndex: -1,
        canUndo: false,
        canRedo: false
      })
    }),
    {
      name: 'crop-history-store'
    }
  )
);