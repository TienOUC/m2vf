import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Edge } from '@xyflow/react';

// 连线状态管理接口
export interface EdgesState {
  edges: Edge[];
  
  // 获取所有连线
  getAllEdges: () => Edge[];
  
  // 设置连线列表
  setEdges: (newEdges: Edge[]) => void;
  
  // 添加连线
  addEdge: (edge: Edge) => void;
  
  // 移除连线
  removeEdge: (edgeId: string) => void;
  
  // 清空所有连线
  clearAllEdges: () => void;
}

// 创建连线状态管理 store
export const useEdgesStore = create(
  persist(
    (set, get) => ({
      edges: [],
      
      getAllEdges: () => {
        return get().edges;
      },
      
      setEdges: (newEdges: Edge[]) => {
        set({ edges: newEdges });
      },
      
      addEdge: (edge: Edge) => {
        set((state: EdgesState) => {
          // 检查是否已存在相同的连线
          const edgeExists = state.edges.some(e => e.id === edge.id);
          if (!edgeExists) {
            return { edges: [...state.edges, edge] };
          }
          return state;
        });
      },
      
      removeEdge: (edgeId: string) => {
        set((state: EdgesState) => ({
          edges: state.edges.filter(edge => edge.id !== edgeId)
        }));
      },
      
      clearAllEdges: () => {
        set({ edges: [] });
      },
    }),
    {
      name: 'm2v-flow-edges', // localStorage 中的键名
      storage: createJSONStorage(() => localStorage), // Zustand 4.x版本的正确配置方式
      partialize: (state: EdgesState): Partial<EdgesState> => ({
        // 只持久化必要的数据，排除方法
        edges: state.edges,
      }),
    }
  )
);
