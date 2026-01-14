import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TextNodeData } from '../types/editor/text';

// 文本节点在全局状态中的数据结构
export interface TextNodeState extends Omit<TextNodeData, 'onDelete' | 'onBackgroundColorChange' | 'getContent' | 'onContentChange' | 'getRichContent' | 'onRichContentChange' | 'onEditingChange' | 'onFontTypeChange'> {
  id: string;
  position?: { x: number; y: number }; 
  width?: number; 
  height?: number; 
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
}

// 创建文本节点状态管理 store
export const useTextNodesStore = create<TextNodesState>()(
  persist(
    (set, get) => ({
      textNodes: {},
      
      getTextNode: (id) => {
        return get().textNodes[id];
      },
      
      setTextNode: (id, data) => {
        set((state) => ({
          textNodes: {
            ...state.textNodes,
            [id]: {
              content: '',
              fontType: 'p',
              backgroundColor: 'white',
              isEditing: false,
              ...state.textNodes[id],
              ...data,
              id, // 放在最后确保不会被覆盖
            },
          },
        }));
      },
      
      batchUpdateTextNodes: (updates) => {
        set((state) => {
          const newTextNodes = { ...state.textNodes };
          for (const [id, data] of Object.entries(updates)) {
            newTextNodes[id] = {
              content: '',
              fontType: 'p',
              backgroundColor: 'white',
              isEditing: false,
              ...newTextNodes[id],
              ...data,
              id, // 放在最后确保不会被覆盖
            };
          }
          return { textNodes: newTextNodes };
        });
      },
      
      deleteTextNode: (id) => {
        set((state) => {
          const newTextNodes = { ...state.textNodes };
          delete newTextNodes[id];
          return { textNodes: newTextNodes };
        });
      },
      
      clearAllTextNodes: () => {
        set({ textNodes: {} });
      },
      
      updateTextNodeContent: (id, content, editorStateJson) => {
        set((state) => ({
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
      
      updateTextNodeBackgroundColor: (id, color) => {
        set((state) => ({
          textNodes: {
            ...state.textNodes,
            [id]: {
              ...state.textNodes[id],
              backgroundColor: color,
            },
          },
        }));
      },
      
      updateTextNodeFontType: (id, fontType) => {
        set((state) => ({
          textNodes: {
            ...state.textNodes,
            [id]: {
              ...state.textNodes[id],
              fontType,
            },
          },
        }));
      },
      
      updateTextNodeEditingState: (id, isEditing) => {
        set((state) => ({
          textNodes: {
            ...state.textNodes,
            [id]: {
              ...state.textNodes[id],
              isEditing,
            },
          },
        }));
      },
    }),
    {
      name: 'm2v-flow-text-nodes', // localStorage 中的键名
      partialize: (state) => ({
        // 只持久化必要的数据，排除方法和临时状态
        textNodes: Object.fromEntries(
          Object.entries(state.textNodes).map(([id, node]) => [
            id,
            {
              id: node.id,
              content: node.content,
              editorStateJson: node.editorStateJson,
              backgroundColor: node.backgroundColor,
              fontType: node.fontType,
              position: node.position,
              width: node.width,
              height: node.height,
            },
          ])
        ),
      }),
    }
  )
);
