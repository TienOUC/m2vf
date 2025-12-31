import { useCallback, useRef } from 'react';
import { EditorState, LexicalEditor } from 'lexical';
import { $getRoot } from 'lexical';

interface UseLexicalEditorProps {
  onContentChange?: (content: string) => void;
}

export const useLexicalEditor = ({ onContentChange }: UseLexicalEditorProps) => {
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
        if (onContentChange) {
          onContentChange(textContent);
        }
      });
    },
    [onContentChange]
  );

  return {
    lexicalEditorRef,
    handleEditorChange
  };
};