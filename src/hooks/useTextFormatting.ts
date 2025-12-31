import { useCallback, useRef } from 'react';
import { LexicalEditor } from 'lexical';
import { FORMAT_TEXT_COMMAND } from 'lexical';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';

interface UseTextFormattingProps {
  lexicalEditorRef: React.RefObject<LexicalEditor | null>;
}

export const useTextFormatting = ({ lexicalEditorRef }: UseTextFormattingProps) => {
  // 文本加粗处理函数
  const handleBoldToggle = useCallback(() => {
    if (lexicalEditorRef.current) {
      lexicalEditorRef.current.focus(() => {
        lexicalEditorRef.current?.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
      });
    }
  }, [lexicalEditorRef]);

  // 文本斜体处理函数
  const handleItalicToggle = useCallback(() => {
    if (lexicalEditorRef.current) {
      lexicalEditorRef.current.focus(() => {
        lexicalEditorRef.current?.dispatchCommand(
          FORMAT_TEXT_COMMAND,
          'italic'
        );
      });
    }
  }, [lexicalEditorRef]);

  // 无序列表处理函数
  const handleBulletListToggle = useCallback(() => {
    if (lexicalEditorRef.current) {
      lexicalEditorRef.current.focus(() => {
        lexicalEditorRef.current?.dispatchCommand(
          INSERT_UNORDERED_LIST_COMMAND,
          undefined
        );
      });
    }
  }, [lexicalEditorRef]);

  // 有序列表处理函数
  const handleNumberedListToggle = useCallback(() => {
    if (lexicalEditorRef.current) {
      lexicalEditorRef.current.focus(() => {
        lexicalEditorRef.current?.dispatchCommand(
          INSERT_ORDERED_LIST_COMMAND,
          undefined
        );
      });
    }
  }, [lexicalEditorRef]);

  // 分割线插入处理函数
  const handleHorizontalRuleInsert = useCallback(() => {
    if (lexicalEditorRef.current) {
      lexicalEditorRef.current.focus(() => {
        lexicalEditorRef.current?.dispatchCommand(
          INSERT_HORIZONTAL_RULE_COMMAND,
          undefined
        );
      });
    }
  }, [lexicalEditorRef]);

  return {
    handleBoldToggle,
    handleItalicToggle,
    handleBulletListToggle,
    handleNumberedListToggle,
    handleHorizontalRuleInsert
  };
};