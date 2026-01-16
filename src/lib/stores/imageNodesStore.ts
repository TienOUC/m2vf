import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ImageNodeData } from '../types/editor/image';

// 图片节点在全局状态中的数据结构
export interface ImageNodeState extends Omit<ImageNodeData, 'onDelete' | 'onReplace' | 'onEditStart' | 'onCropStart' | 'onImageUpdate' | 'onDownload' | 'onBackgroundRemove'> {
  id: string;
  position?: { x: number; y: number }; 
  width?: number; 
  height?: number; 
}

// 图片节点状态管理接口
export interface ImageNodesState {
  imageNodes: Record<string, ImageNodeState>;
  
  // 获取指定节点的状态
  getImageNode: (id: string) => ImageNodeState | undefined;
  
  // 设置或更新节点状态
  setImageNode: (id: string, data: Partial<ImageNodeState>) => void;
  
  // 批量更新节点状态
  batchUpdateImageNodes: (updates: Record<string, Partial<ImageNodeState>>) => void;
  
  // 删除节点
  deleteImageNode: (id: string) => void;
  
  // 清空所有节点
  clearAllImageNodes: () => void;
  
  // 更新节点图片URL
  updateImageNodeUrl: (id: string, imageUrl: string) => void;
  
  // 更新节点加载状态
  updateImageNodeLoadingState: (id: string, isLoading: boolean) => void;
  
  // 更新节点处理状态
  updateImageNodeProcessingState: (id: string, isProcessing: boolean, progress?: number) => void;
  
  // 更新节点错误状态
  updateImageNodeError: (id: string, error?: string) => void;
}

// 创建图片节点状态管理 store
export const useImageNodesStore = create(
  persist(
    (set, get) => ({
      imageNodes: {},
      
      getImageNode: (id: string) => {
        return get().imageNodes[id];
      },
      
      setImageNode: (id: string, data: Partial<ImageNodeState>) => {
        set((state: ImageNodesState) => {
          // 只更新已存在的节点，不创建新节点
          if (state.imageNodes[id]) {
            return {
              imageNodes: {
                ...state.imageNodes,
                [id]: {
                  ...state.imageNodes[id],
                  ...data,
                  id, // 放在最后确保不会被覆盖
                },
              },
            };
          }
          // 如果节点不存在，创建新节点
          return {
            imageNodes: {
              ...state.imageNodes,
              [id]: {
                id,
                ...data,
              },
            },
          };
        });
      },
      
      batchUpdateImageNodes: (updates: Record<string, Partial<ImageNodeState>>) => {
        set((state: ImageNodesState) => {
          const newImageNodes = { ...state.imageNodes };
          for (const [id, data] of Object.entries(updates)) {
            // 更新或创建节点
            newImageNodes[id] = {
              ...newImageNodes[id], // 如果节点已存在，保留现有属性
              ...data, // 更新新属性
              id, // 确保id正确
            };
          }
          return { imageNodes: newImageNodes };
        });
      },
      
      deleteImageNode: (id: string) => {
        try {
          set((state: ImageNodesState) => {
            // 创建一个新对象，不包含要删除的节点，与文本节点删除逻辑保持一致
            const newImageNodes: Record<string, ImageNodeState> = {};
            for (const [nodeId, nodeData] of Object.entries(state.imageNodes)) {
              if (nodeId !== id) {
                newImageNodes[nodeId] = nodeData;
              }
            }
            
            return { imageNodes: newImageNodes };
          });
          console.log(`图片节点 ${id} 删除成功`);
        } catch (error) {
          console.error(`删除图片节点 ${id} 失败:`, error);
          // 可以在这里添加用户错误提示
        }
      },
      
      clearAllImageNodes: () => {
        set({ imageNodes: {} });
      },
      
      updateImageNodeUrl: (id: string, imageUrl: string) => {
        set((state: ImageNodesState) => ({
          imageNodes: {
            ...state.imageNodes,
            [id]: {
              ...state.imageNodes[id],
              imageUrl,
            },
          },
        }));
      },
      
      updateImageNodeLoadingState: (id: string, isLoading: boolean) => {
        set((state: ImageNodesState) => ({
          imageNodes: {
            ...state.imageNodes,
            [id]: {
              ...state.imageNodes[id],
              isLoading,
            },
          },
        }));
      },
      
      updateImageNodeProcessingState: (id: string, isProcessing: boolean, progress?: number) => {
        set((state: ImageNodesState) => ({
          imageNodes: {
            ...state.imageNodes,
            [id]: {
              ...state.imageNodes[id],
              isProcessing,
              processingProgress: progress,
            },
          },
        }));
      },
      
      updateImageNodeError: (id: string, error?: string) => {
        set((state: ImageNodesState) => ({
          imageNodes: {
            ...state.imageNodes,
            [id]: {
              ...state.imageNodes[id],
              error,
            },
          },
        }));
      },
    }),
    {
      name: 'm2v-flow-image-nodes', // localStorage 中的键名
      storage: createJSONStorage(() => localStorage), // Zustand 4.x版本的正确配置方式
      partialize: (state: ImageNodesState): ImageNodesState => ({
        // 只持久化必要的数据，排除方法和临时状态
        imageNodes: Object.fromEntries(
          Object.entries(state.imageNodes).map(([id, node]) => [
            id,
            {
              id: node.id,
              imageUrl: node.imageUrl,
              isLoading: false, // 不持久化加载状态
              isProcessing: false, // 不持久化处理状态
              processingProgress: 0, // 不持久化处理进度
              error: undefined, // 不持久化错误信息
              position: node.position,
              width: node.width,
              height: node.height,
            },
          ])
        ),
        // 方法不会被序列化，但为了满足类型要求需要包含
        getImageNode: (_id: string) => undefined,
        setImageNode: () => {},
        batchUpdateImageNodes: () => {},
        deleteImageNode: () => {},
        clearAllImageNodes: () => {},
        updateImageNodeUrl: () => {},
        updateImageNodeLoadingState: () => {},
        updateImageNodeProcessingState: () => {},
        updateImageNodeError: () => {},
      }),
    }
  )
);
