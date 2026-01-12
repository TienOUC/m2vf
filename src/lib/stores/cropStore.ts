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
      
      // 宽高比设置
      currentAspectRatio: null,
      isOriginalRatio: true,
      
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
        currentAspectRatio: null,
        isOriginalRatio: true,
        selection: {
          isSelected: false,
          isResizing: false,
          isMoving: false
        }
      }),
      
      // 宽高比相关Actions
      setCurrentAspectRatio: (aspectRatio: number | null) => set({ currentAspectRatio: aspectRatio }),
      
      setIsOriginalRatio: (isOriginal: boolean) => set({ isOriginalRatio: isOriginal }),
      
      updateAspectRatio: (aspectRatio: number | null, isOriginal: boolean) => 
        set({ currentAspectRatio: aspectRatio, isOriginalRatio: isOriginal })
    }),
    {
      name: 'crop-store'
    }
  )
);

