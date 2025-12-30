import { useCallback } from 'react';
import { $getRoot } from 'lexical';
import { LexicalEditor } from 'lexical';

// 自定义 Hook：用于获取 Lexical 编辑器内容
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