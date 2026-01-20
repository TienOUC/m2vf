// 编辑器相关工具函数和配置

import { EditorTheme, EditorConfig } from '@/lib/types';

// 编辑器主题配置
export const editorTheme: EditorTheme = {
  ltr: 'ltr',
  rtl: 'rtl',
  placeholder: 'editor-placeholder',
  paragraph: 'editor-paragraph',
  quote: 'editor-quote',
  heading: {
    h1: 'editor-heading-h1',
    h2: 'editor-heading-h2',
    h3: 'editor-heading-h3',
    h4: 'editor-heading-h4',
    h5: 'editor-heading-h5',
  },
  list: {
    nested: {
      listitem: 'editor-nested-listitem',
    },
    listitem: 'editor-listitem',
    listitemChecked: 'editor-listitem-checked',
    listitemUnchecked: 'editor-listitem-unchecked',
    olDepth: [
      'editor-list-ol-1',
      'editor-list-ol-2',
      'editor-list-ol-3',
      'editor-list-ol-4',
      'editor-list-ol-5',
    ],
    ulDepth: [
      'editor-list-ul-1',
      'editor-list-ul-2',
      'editor-list-ul-3',
      'editor-list-ul-4',
      'editor-list-ul-5',
    ],
  },
  text: {
    bold: 'editor-text-bold',
    italic: 'editor-text-italic',
    underline: 'editor-text-underline',
    strikethrough: 'editor-text-strikethrough',
    underlineStrikethrough: 'editor-text-underlineStrikethrough',
    code: 'editor-text-code',
  },
};

// 默认编辑器配置
export const defaultEditorConfig: EditorConfig = {
  namespace: 'M2VFlowEditor',
  theme: editorTheme,
  onError: (error: Error) => {
    console.error('Lexical错误:', error);
  },
};

