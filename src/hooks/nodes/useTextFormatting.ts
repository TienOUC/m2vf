import { useCallback } from 'react';
import { LexicalEditor } from 'lexical';
import { FORMAT_TEXT_COMMAND } from 'lexical';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { $getRoot, $getSelection, $createParagraphNode, $isRangeSelection } from 'lexical';
import { $createHeadingNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';

interface UseTextFormattingProps {
  lexicalEditorRef: React.RefObject<LexicalEditor | null>;
}

export const useTextFormatting = ({ lexicalEditorRef }: UseTextFormattingProps) => {
  // 文本加粗处理函数
  const handleBoldToggle = useCallback(() => {
    if (lexicalEditorRef.current) {
      lexicalEditorRef.current.focus();
      lexicalEditorRef.current.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
    }
  }, [lexicalEditorRef]);

  // 文本斜体处理函数
  const handleItalicToggle = useCallback(() => {
    if (lexicalEditorRef.current) {
      lexicalEditorRef.current.focus();
      lexicalEditorRef.current.dispatchCommand(
        FORMAT_TEXT_COMMAND,
        'italic'
      );
    }
  }, [lexicalEditorRef]);

  // 无序列表处理函数
  const handleBulletListToggle = useCallback(() => {
    if (lexicalEditorRef.current) {
      lexicalEditorRef.current.focus();
      lexicalEditorRef.current.dispatchCommand(
        INSERT_UNORDERED_LIST_COMMAND,
        undefined
      );
    }
  }, [lexicalEditorRef]);

  // 有序列表处理函数
  const handleNumberedListToggle = useCallback(() => {
    if (lexicalEditorRef.current) {
      lexicalEditorRef.current.focus();
      lexicalEditorRef.current.dispatchCommand(
        INSERT_ORDERED_LIST_COMMAND,
        undefined
      );
    }
  }, [lexicalEditorRef]);

  // 分割线插入处理函数
  const handleHorizontalRuleInsert = useCallback(() => {
    if (lexicalEditorRef.current) {
      lexicalEditorRef.current.focus();
      lexicalEditorRef.current.dispatchCommand(
        INSERT_HORIZONTAL_RULE_COMMAND,
        undefined
      );
    }
  }, [lexicalEditorRef]);

  // 字体类型切换处理函数
  const handleFontTypeChange = useCallback((fontType: 'h1' | 'h2' | 'h3' | 'p') => {
    if (lexicalEditorRef.current) {
      const editor = lexicalEditorRef.current;
      editor.focus();
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => {
            switch (fontType) {
              case 'h1':
                return $createHeadingNode('h1');
              case 'h2':
                return $createHeadingNode('h2');
              case 'h3':
                return $createHeadingNode('h3');
              case 'p':
              default:
                return $createParagraphNode();
            }
          });
        } else {
          const root = $getRoot();
          const firstChild = root.getFirstChild();
          if (firstChild) {
            if (fontType === 'p') {
              const newPara = $createParagraphNode();
              firstChild.replace(newPara);
            } else {
              const newHeading = $createHeadingNode(fontType);
              firstChild.replace(newHeading);
            }
          } else {
            const node = fontType === 'p' ? $createParagraphNode() : $createHeadingNode(fontType);
            root.append(node);
          }
        }
      });
    }
  }, [lexicalEditorRef]);

  return {
    handleBoldToggle,
    handleItalicToggle,
    handleBulletListToggle,
    handleNumberedListToggle,
    handleHorizontalRuleInsert,
    handleFontTypeChange
  };
};
