import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { TextNodeData } from '../types/editor/text';

// 文本节点在全局状态中的数据结构
export interface TextNodeState extends Omit<TextNodeData, 'onDelete' | 'onBackgroundColorChange' | 'getContent' | 'onContentChange' | 'getRichContent' | 'onRichContentChange' | 'onEditingChange' | 'onFontTypeChange'> {
  id: string;
  position?: { x: number; y: number }; 
  width?: number; 
  height?: number; 
  richContent?: string;
}

// 文本节点状态管理接口
export interface TextNodesState {
  textNodes: Record<string, TextNodeState>;
  
  // 获取指定节点的状态
  getTextNode: (id: string) => TextNodeState | undefined;
  
  // 设置或更新节点状态
  setTextNode: (id: string, data: Partial<TextNodeState>) => void;
  
  // 批量更新节点状态
  batchUpdateTextNodes: (updates: Record<string, Partial<TextNodeState>>) => void;
  
  // 删除节点
  deleteTextNode: (id: string) => void;
  
  // 清空所有节点
  clearAllTextNodes: () => void;
  
  // 更新节点内容
  updateTextNodeContent: (id: string, content: string, editorStateJson?: string) => void;
  
  // 更新节点背景颜色
  updateTextNodeBackgroundColor: (id: string, color: string) => void;
  
  // 更新节点字体类型
  updateTextNodeFontType: (id: string, fontType: 'h1' | 'h2' | 'h3' | 'p') => void;
  
  // 更新节点编辑状态
  updateTextNodeEditingState: (id: string, isEditing: boolean) => void;
  
  // 更新节点富文本内容
  updateTextNodeRichContent: (id: string, richContent: string) => void;
}

// 创建文本节点状态管理 store
export const useTextNodesStore = create(
  persist(
    (set, get) => ({
      textNodes: {},
      
      getTextNode: (id: string) => {
        return get().textNodes[id];
      },
      
      setTextNode: (id: string, data: Partial<TextNodeState>) => {
        set((state: TextNodesState) => {
          // 只更新已存在的节点，不创建新节点
          if (state.textNodes[id]) {
            return {
              textNodes: {
                ...state.textNodes,
                [id]: {
                  ...state.textNodes[id],
                  ...data,
                  id, // 放在最后确保不会被覆盖
                },
              },
            };
          }
          // 如果节点不存在，直接返回当前状态，不做任何修改
          return state;
        });
      },
      
      batchUpdateTextNodes: (updates: Record<string, Partial<TextNodeState>>) => {
        set((state: TextNodesState) => {
          const newTextNodes = { ...state.textNodes };
          for (const [id, data] of Object.entries(updates)) {
            // 只更新已存在的节点，不创建新节点
            if (newTextNodes[id]) {
              newTextNodes[id] = {
                ...newTextNodes[id],
                ...data,
                id, // 放在最后确保不会被覆盖
              };
            }
          }
          return { textNodes: newTextNodes };
        });
      },
      
      deleteTextNode: (id: string) => {
        try {
          set((state: TextNodesState) => {
            // 直接创建一个全新的对象来替换旧的textNodes，不检查节点是否存在
            const newTextNodes: Record<string, TextNodeState> = {};
            for (const [nodeId, nodeData] of Object.entries(state.textNodes)) {
              if (nodeId !== id) {
                newTextNodes[nodeId] = nodeData;
              }
            }
            
            return { textNodes: newTextNodes };
          });
          console.log(`节点 ${id} 删除成功`);
        } catch (error) {
          console.error(`删除节点 ${id} 失败:`, error);
          // 可以在这里添加用户错误提示
        }
      },
      
      clearAllTextNodes: () => {
        set({ textNodes: {} });
      },
      
      updateTextNodeContent: (id: string, content: string, editorStateJson?: string) => {
        set((state: TextNodesState) => ({
          textNodes: {
            ...state.textNodes,
            [id]: {
              ...state.textNodes[id],
              content,
              editorStateJson,
            },
          },
        }));
      },
      
      updateTextNodeBackgroundColor: (id: string, color: string) => {
        set((state: TextNodesState) => ({
          textNodes: {
            ...state.textNodes,
            [id]: {
              ...state.textNodes[id],
              backgroundColor: color,
            },
          },
        }));
      },
      
      updateTextNodeFontType: (id: string, fontType: 'h1' | 'h2' | 'h3' | 'p') => {
        set((state: TextNodesState) => ({
          textNodes: {
            ...state.textNodes,
            [id]: {
              ...state.textNodes[id],
              fontType,
            },
          },
        }));
      },
      
      updateTextNodeEditingState: (id: string, isEditing: boolean) => {
        set((state: TextNodesState) => ({
          textNodes: {
            ...state.textNodes,
            [id]: {
              ...state.textNodes[id],
              isEditing,
            },
          },
        }));
      },
      
      updateTextNodeRichContent: (id: string, richContent: string) => {
        set((state: TextNodesState) => ({
          textNodes: {
            ...state.textNodes,
            [id]: {
              ...state.textNodes[id],
              richContent,
            },
          },
        }));
      },
    }),
    {
      name: 'm2v-flow-text-nodes', // localStorage 中的键名
      storage: createJSONStorage(() => localStorage), // Zustand 4.x版本的正确配置方式
      partialize: (state: TextNodesState): TextNodesState => ({
        // 只持久化必要的数据，排除方法和临时状态
        textNodes: Object.fromEntries(
          Object.entries(state.textNodes).map(([id, node]) => [
            id,
            {
              id: node.id,
              content: node.content,
              editorStateJson: node.editorStateJson,
              richContent: node.richContent,
              backgroundColor: node.backgroundColor,
              fontType: node.fontType,
              position: node.position,
              width: node.width,
              height: node.height,
            },
          ])
        ),
        // 方法不会被序列化，所以这里不需要包含
        getTextNode: (_id: string) => undefined,
        setTextNode: () => {},
        batchUpdateTextNodes: () => {},
        deleteTextNode: () => {},
        clearAllTextNodes: () => {},
        updateTextNodeContent: () => {},
        updateTextNodeBackgroundColor: () => {},
        updateTextNodeFontType: () => {},
        updateTextNodeEditingState: () => {},
        updateTextNodeRichContent: () => {},
      }),
    }
  )
);
