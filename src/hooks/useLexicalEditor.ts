import { useCallback, useRef } from 'react';
import { EditorState, LexicalEditor } from 'lexical';
import { $getRoot } from 'lexical';

interface UseLexicalEditorProps {
  onContentChange?: (content: string, editorStateJson?: string) => void;
  onRichContentChange?: (html: string) => void;
}

export const useLexicalEditor = ({ onContentChange, onRichContentChange }: UseLexicalEditorProps) => {
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
      });
    },
    [onContentChange, onRichContentChange]
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
