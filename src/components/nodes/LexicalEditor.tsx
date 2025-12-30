import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
// import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
// import { $getRoot, $getSelection, EditorState, LexicalEditor, $isRangeSelection } from 'lexical';
import { $getRoot, EditorState, LexicalEditor} from 'lexical';
// import { $createListNode, $isListNode } from '@lexical/list';
import { useCallback } from 'react';

// 编辑器主题
const editorTheme = {
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
const defaultEditorConfig = {
  namespace: 'M2VFlowEditor',
  theme: editorTheme,
  onError: (error: Error) => {
    console.error('Lexical错误:', error);
  },
};

// 编辑器内容显示插件
function Placeholder() {
  return (
    <div className="editor-placeholder absolute top-2 left-2 text-gray-400 pointer-events-none">
      输入文本内容...
    </div>
  );
}

interface M2VFlowLexicalEditorProps {
  initialContent?: string;
  onChange?: (editorState: EditorState, editor: LexicalEditor) => void;
  darkMode?: boolean;
  className?: string;
  backgroundColor?: string;
  fontColor?: string;
}

export function M2VFlowLexicalEditor({
  initialContent = '',
  onChange,
  darkMode = false,
  className = '',
  backgroundColor = 'white',
  fontColor = 'gray-700'
}: M2VFlowLexicalEditorProps) {
  const initialConfig = {
    ...defaultEditorConfig,
    editorState: initialContent ? 
      () => ({ root: { children: [{ type: 'paragraph', children: [{ type: 'text', text: initialContent }] }] } }) : 
      undefined,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className={`editor-container border border-gray-300 rounded-lg overflow-hidden ${className}`}>
        
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                className={`editor-input w-full h-full p-2 min-h-[100px] focus:outline-none bg-${backgroundColor} text-${fontColor}`} 
              />
            }
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <AutoFocusPlugin />
        {onChange && <OnChangePlugin onChange={onChange} />}
        <ClearEditorPlugin />
      </div>
    </LexicalComposer>
  );
}

// 导出一个编辑器引用的Hook，用于获取内容
export function useLexicalEditorContent(editor: LexicalEditor | null) {
  const getContent = useCallback(() => {
    if (!editor) return '';
    
    return editor.getEditorState().read(() => {
      const root = $getRoot();
      return root.getTextContent();
    });
  }, [editor]);

  return { getContent };
}