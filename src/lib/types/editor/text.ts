export interface TextNodeData {
  label?: string;
  content?: string;
  editorStateJson?: string; // 保存序列化后的编辑器状态
  backgroundColor?: string;
  fontType?: 'h1' | 'h2' | 'h3' | 'p';
  onTypeChange?: (
    nodeId: string,
    newType: 'text' | 'image' | 'video'
  ) => void;
  onDelete?: (nodeId: string) => void;
  onBackgroundColorChange?: (nodeId: string, color: string) => void;
  getContent?: (nodeId: string) => string;
  onContentChange?: (content: string, editorStateJson?: string) => void;
  getRichContent?: (nodeId: string) => string;
  onRichContentChange?: (html: string) => void;
  onEditingChange?: (nodeId: string, isEditing: boolean) => void;
  onFontTypeChange?: (
    nodeId: string,
    fontType: 'h1' | 'h2' | 'h3' | 'p'
  ) => void;
  isEditing?: boolean;
}
