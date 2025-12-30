import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
// import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { M2VFlowLexicalEditorProps as M2VFlowLexicalEditorPropsType } from '@/lib/types';
import { defaultEditorConfig } from '@/lib/utils/editor';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useRef } from 'react';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';


// 用于动态设置编辑器内容的插件
function InitialContentPlugin({ initialContent }: { initialContent: string }) {
  const [editor] = useLexicalComposerContext();
  const hasSetInitialContent = useRef(false);

  useEffect(() => {
    if (hasSetInitialContent.current) {
      return; // 已经设置过初始内容，不再设置
    }

    // 检查编辑器是否已有内容
    const hasContent = editor.getEditorState().read(() => {
      const root = $getRoot();
      const childrenSize = root.getChildrenSize();
      if (childrenSize === 0) return false;
      if (childrenSize === 1) {
        const firstChild = root.getFirstChild();
        if (firstChild && firstChild.getTextContent) {
          return firstChild.getTextContent() !== '';
        }
      }
      return true;
    });

    if (!hasContent && initialContent) {
      hasSetInitialContent.current = true;
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        
        if (initialContent) {
          const paragraph = $createParagraphNode();
          const text = $createTextNode(initialContent);
          paragraph.append(text);
          root.append(paragraph);
        }
      });
    }
  }, [editor, initialContent]);

  return null;
}

// 编辑器内容显示插件
export function Placeholder() {
  return (
    <div className="editor-placeholder absolute top-2 left-2 text-gray-400 pointer-events-none">
      输入文本内容...
    </div>
  );
}

export function M2VFlowLexicalEditor({
  initialContent = '',
  onChange,
  darkMode = false,
  className = '',
  backgroundColor = 'white',
  fontColor = 'gray-700'
}: M2VFlowLexicalEditorPropsType) {
  const initialConfig = {
    ...defaultEditorConfig,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className={`editor-container bg-${backgroundColor} rounded-lg overflow-hidden ${className}`}>
        
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                className={`editor-input w-full h-full p-2 min-h-[100px] focus:outline-none bg-${backgroundColor} text-${fontColor}`} 
                onMouseDown={(e) => e.stopPropagation()}
              />
            }
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        {/* <HistoryPlugin /> */}
        <AutoFocusPlugin />
        {onChange && <OnChangePlugin onChange={onChange} />}
        <ClearEditorPlugin />
        <InitialContentPlugin initialContent={initialContent} />
      </div>
    </LexicalComposer>
  );
}