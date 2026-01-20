import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { VideoNodeData } from '@/types/editor/video';

// 视频节点在全局状态中的数据结构
export interface VideoNodeState extends Omit<VideoNodeData, 'onDelete' | 'onGenerateVideo' | 'onFirstLastFrameGenerate' | 'onFirstFrameGenerate'> {
  id: string;
  position?: { x: number; y: number };
  width?: number;
  height?: number;
}

// 视频节点状态管理接口
export interface VideoNodesState {
  videoNodes: Record<string, VideoNodeState>;
  
  // 获取指定节点的状态
  getVideoNode: (id: string) => VideoNodeState | undefined;
  
  // 设置或更新节点状态
  setVideoNode: (id: string, data: Partial<VideoNodeState>) => void;
  
  // 批量更新节点状态
  batchUpdateVideoNodes: (updates: Record<string, Partial<VideoNodeState>>) => void;
  
  // 删除节点
  deleteVideoNode: (id: string) => void;
  
  // 清空所有节点
  clearAllVideoNodes: () => void;
  
  // 更新节点视频 URL
  updateVideoNodeUrl: (id: string, videoUrl: string | undefined) => void;
  
  // 更新节点加载状态
  updateVideoNodeLoadingState: (id: string, isLoading: boolean) => void;
  
  // 更新节点是否有连接的帧节点
  updateVideoNodeHasConnectedFrameNodes: (id: string, hasConnected: boolean) => void;
}

// 创建视频节点状态管理 store
export const useVideoNodesStore = create(
  persist(
    (set, get) => ({
      videoNodes: {},
      
      getVideoNode: (id: string) => {
        return get().videoNodes[id];
      },
      
      setVideoNode: (id: string, data: Partial<VideoNodeState>) => {
        set((state: VideoNodesState) => {
          // 检查节点是否已存在，如果不存在则创建新节点
          const existingNode = state.videoNodes[id];
          return {
            videoNodes: {
              ...state.videoNodes,
              [id]: {
                ...existingNode,
                ...data,
                id, // 放在最后确保不会被覆盖
              },
            },
          };
        });
      },
      
      batchUpdateVideoNodes: (updates: Record<string, Partial<VideoNodeState>>) => {
        set((state: VideoNodesState) => {
          const newVideoNodes = { ...state.videoNodes };
          for (const [id, data] of Object.entries(updates)) {
            // 检查节点是否已存在，如果不存在则创建新节点
            const existingNode = newVideoNodes[id];
            newVideoNodes[id] = {
              ...existingNode,
              ...data,
              id, // 放在最后确保不会被覆盖
            };
          }
          return { videoNodes: newVideoNodes };
        });
      },
      
      deleteVideoNode: (id: string) => {
        try {
          set((state: VideoNodesState) => {
            // 直接创建一个全新的对象来替换旧的videoNodes，不检查节点是否存在
            const newVideoNodes: Record<string, VideoNodeState> = {};
            for (const [nodeId, nodeData] of Object.entries(state.videoNodes)) {
              if (nodeId !== id) {
                newVideoNodes[nodeId] = nodeData;
              }
            }
            
            return { videoNodes: newVideoNodes };
          });
          console.log(`视频节点 ${id} 删除成功`);
        } catch (error) {
          console.error(`删除视频节点 ${id} 失败:`, error);
          // 可以在这里添加用户错误提示
        }
      },
      
      clearAllVideoNodes: () => {
        set({ videoNodes: {} });
      },
      
      updateVideoNodeUrl: (id: string, videoUrl: string | undefined) => {
        set((state: VideoNodesState) => ({
          videoNodes: {
            ...state.videoNodes,
            [id]: {
              ...state.videoNodes[id],
              videoUrl,
            },
          },
        }));
      },
      
      updateVideoNodeLoadingState: (id: string, isLoading: boolean) => {
        set((state: VideoNodesState) => ({
          videoNodes: {
            ...state.videoNodes,
            [id]: {
              ...state.videoNodes[id],
              isLoading,
            },
          },
        }));
      },
      
      updateVideoNodeHasConnectedFrameNodes: (id: string, hasConnected: boolean) => {
        set((state: VideoNodesState) => ({
          videoNodes: {
            ...state.videoNodes,
            [id]: {
              ...state.videoNodes[id],
              hasConnectedFrameNodes: hasConnected,
            },
          },
        }));
      },
    }),
    {
      name: 'm2v-flow-video-nodes', // localStorage 中的键名
      storage: createJSONStorage(() => localStorage), // Zustand 4.x版本的正确配置方式
      partialize: (state: VideoNodesState): VideoNodesState => ({
        // 只持久化必要的数据，排除方法和临时状态
        videoNodes: Object.fromEntries(
          Object.entries(state.videoNodes).map(([id, node]) => [
            id,
            {
              id: node.id,
              videoUrl: node.videoUrl,
              isLoading: node.isLoading,
              hasConnectedFrameNodes: node.hasConnectedFrameNodes,
              position: node.position,
              width: node.width,
              height: node.height,
            },
          ])
        ),
        // 方法不会被序列化，所以这里不需要包含
        getVideoNode: (_id: string) => undefined,
        setVideoNode: () => {},
        batchUpdateVideoNodes: () => {},
        deleteVideoNode: () => {},
        clearAllVideoNodes: () => {},
        updateVideoNodeUrl: () => {},
        updateVideoNodeLoadingState: () => {},
        updateVideoNodeHasConnectedFrameNodes: () => {},
      }),
    }
  )
);
