import { useCallback, useRef } from 'react';
import { EditorState, LexicalEditor } from 'lexical';
import { $getRoot, $getSelection, $isRangeSelection, $isElementNode } from 'lexical';
import type { HeadingNode as HeadingNodeType } from '@lexical/rich-text';

interface UseLexicalEditorProps {
  onContentChange?: (content: string, editorStateJson?: string) => void;
  onRichContentChange?: (html: string) => void;
  onCurrentFontTypeChange?: (fontType: 'h1' | 'h2' | 'h3' | 'p') => void;
}

export const useLexicalEditor = ({ onContentChange, onRichContentChange, onCurrentFontTypeChange }: UseLexicalEditorProps) => {
  const lexicalEditorRef = useRef<LexicalEditor | null>(null);

  // 处理编辑器内容变化
  const handleEditorChange = useCallback(
    (editorState: EditorState, editor: LexicalEditor) => {
      // 保存编辑器引用
      lexicalEditorRef.current = editor;

      // 获取编辑器内容并更新状态
      editorState.read(() => {
        const root = $getRoot();
        const textContent = root.getTextContent();
        
        // 序列化编辑器状态为 JSON 字符串
        const editorStateJson = JSON.stringify(editorState.toJSON());
        
        if (onContentChange) {
          onContentChange(textContent, editorStateJson);
        }
        if (onRichContentChange) {
          const rootEl = editor.getRootElement();
          const html = rootEl ? rootEl.innerHTML : '';
          onRichContentChange(html);
        }
        if (onCurrentFontTypeChange) {
          const selection = $getSelection();
          let fontType: 'h1' | 'h2' | 'h3' | 'p' = 'p';
          if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();
            let element = $isElementNode(anchorNode) ? anchorNode : anchorNode.getParent();
            while (element && element.getParent() && element.getParent() !== root) {
              element = element.getParent();
            }
            if (element) {
              const type = element.getType();
              if (type === 'heading') {
                const tag = (element as HeadingNodeType).getTag();
                if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
                  fontType = tag;
                } else {
                  fontType = 'p';
                }
              } else {
                fontType = 'p';
              }
            }
          }
          onCurrentFontTypeChange(fontType);
        }
      });
    },
    [onContentChange, onRichContentChange, onCurrentFontTypeChange]
  );

  // 处理编辑器初始化
  const handleEditorInit = useCallback((editor: LexicalEditor) => {
    lexicalEditorRef.current = editor;
  }, []);

  return {
    lexicalEditorRef,
    handleEditorChange,
    handleEditorInit
  };
};
