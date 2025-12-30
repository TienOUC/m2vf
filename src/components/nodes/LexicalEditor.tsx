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
import { $getRoot, $createParagraphNode, $createTextNode, $getSelection, $setSelection, $createRangeSelection } from 'lexical';

// 用于动态设置编辑器内容的插件
function InitialContentPlugin({ initialContent }: { initialContent: string }) {
  const [editor] = useLexicalComposerContext();
  const hasSetInitialContent = useRef(false);

  useEffect(() => {
    // 只在编辑器内容为空且有初始内容时设置
    editor.update(() => {
      const root = $getRoot();
      const rootChildren = root.getChildren();
      
      // 如果编辑器内容为空或只包含一个空段落，则设置初始内容
      if (rootChildren.length === 0 || 
          (rootChildren.length === 1 && rootChildren[0].getTextContent() === '')) {
        if (initialContent) {
          root.clear();
          const paragraph = $createParagraphNode();
          const text = $createTextNode(initialContent);
          paragraph.append(text);
          root.append(paragraph);
          hasSetInitialContent.current = true;
        }
      }
    });
  }, [editor, initialContent]);

  return null;
}

// 光标定位到文本末尾的插件
function MoveCursorToEndPlugin({ initialContent }: { initialContent: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // 只有在有初始内容时才将光标移动到末尾
    if (initialContent) {
      editor.update(() => {
        const root = $getRoot();
        const lastNode = root.getLastDescendant();
        if (lastNode) {
          const rangeSelection = $createRangeSelection();
          rangeSelection.anchor.set(lastNode.getKey(), lastNode.getTextContentSize(), 'text');
          rangeSelection.focus.set(lastNode.getKey(), lastNode.getTextContentSize(), 'text');
          $setSelection(rangeSelection);
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
        <MoveCursorToEndPlugin initialContent={initialContent} />
      </div>
    </LexicalComposer>
  );
}