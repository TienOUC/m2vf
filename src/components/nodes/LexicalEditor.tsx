import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { M2VFlowLexicalEditorProps as M2VFlowLexicalEditorPropsType } from '@/lib/types';
import { defaultEditorConfig } from '@/lib/utils/editor';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useRef } from 'react';
import {
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  $setSelection,
  $createRangeSelection,
  $isTextNode,
  $isElementNode,
  LexicalEditor
} from 'lexical';
import { HeadingNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';

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
      if (
        rootChildren.length === 0 ||
        (rootChildren.length === 1 && rootChildren[0].getTextContent() === '')
      ) {
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
  const hasMovedCursor = useRef(false);

  useEffect(() => {
    // 只有在有初始内容且尚未移动过光标时才将光标移动到末尾
    if (initialContent && !hasMovedCursor.current) {
      editor.update(() => {
        const root = $getRoot();
        const lastNode = root.getLastDescendant();
        if (lastNode) {
          if ($isTextNode(lastNode)) {
            const rangeSelection = $createRangeSelection();
            rangeSelection.anchor.set(
              lastNode.getKey(),
              lastNode.getTextContentSize(),
              'text'
            );
            rangeSelection.focus.set(
              lastNode.getKey(),
              lastNode.getTextContentSize(),
              'text'
            );
            $setSelection(rangeSelection);
          } else if ($isElementNode(lastNode)) {
            lastNode.selectEnd();
          }
        }
      });
      hasMovedCursor.current = true;
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

// 编辑器初始化插件
function EditorInitPlugin({ onInit }: { onInit?: (editor: LexicalEditor) => void }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (onInit) {
      onInit(editor);
    }
  }, [editor, onInit]);
  return null;
}

export function M2VFlowLexicalEditor({
  initialContent = '',
  initialEditorState,
  onChange,
  className = '',
  backgroundColor = 'white',
  fontColor = 'gray-700',
  onInit,
  readOnly = false
}: M2VFlowLexicalEditorPropsType & {
  onInit?: (editor: LexicalEditor) => void;
  readOnly?: boolean;
}) {
  const initialConfig = {
    ...defaultEditorConfig,
    nodes: [HeadingNode, ListNode, ListItemNode, HorizontalRuleNode],
    editable: !readOnly,
    editorState: initialEditorState
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div
        className={`editor-container bg-${backgroundColor} rounded-lg overflow-hidden ${className}`}
      >
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={`editor-input w-full h-full p-2 min-h-[100px] focus:outline-none bg-${backgroundColor} text-${fontColor} ${readOnly ? 'cursor-default pointer-events-none' : ''}`}
                onMouseDown={(e) => !readOnly && e.stopPropagation()}
                readOnly={readOnly}
              />
            }
            placeholder={!readOnly ? <Placeholder /> : null}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        {!readOnly && <AutoFocusPlugin />}
        {onChange && <OnChangePlugin onChange={onChange} />}
        {!readOnly && <ClearEditorPlugin />}
        {!initialEditorState && <InitialContentPlugin initialContent={initialContent} />}
        {!readOnly && <MoveCursorToEndPlugin initialContent={initialContent} />}
        <EditorInitPlugin onInit={onInit} />
        <ListPlugin />
        <HorizontalRulePlugin />
      </div>
    </LexicalComposer>
  );
}
