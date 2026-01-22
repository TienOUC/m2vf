// 编辑器相关类型定义
import { EditorState, LexicalEditor } from 'lexical';


// 编辑器主题类型定义
export interface EditorTheme {
  ltr: string;
  rtl: string;
  placeholder: string;
  paragraph: string;
  quote: string;
  heading: {
    h1: string;
    h2: string;
    h3: string;
    h4: string;
    h5: string;
  };
  list: {
    nested: {
      listitem: string;
    };
    listitem: string;
    listitemChecked: string;
    listitemUnchecked: string;
    olDepth: string[];
    ulDepth: string[];
  };
  text: {
    bold: string;
    italic: string;
    underline: string;
    strikethrough: string;
    underlineStrikethrough: string;
    code: string;
  };
}

// 编辑器配置类型定义
export interface EditorConfig {
  namespace: string;
  theme: EditorTheme;
  onError: (error: Error) => void;
}

// 编辑器属性类型定义
export interface ReelayFlowLexicalEditorProps {
  initialContent?: string;
  onChange?: (editorState: EditorState, editor: LexicalEditor) => void;
  darkMode?: boolean;
  className?: string;
  backgroundColor?: string;
  fontColor?: string;
  onInit?: (editor: LexicalEditor) => void;
  readOnly?: boolean;
  initialEditorState?: string;
}

