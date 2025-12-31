import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getSelection, $setSelection, $createRangeSelection, $isRangeSelection, $createParagraphNode } from 'lexical';
import { $createHeadingNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { FORMAT_TEXT_COMMAND } from 'lexical';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';

interface UseLexicalFormattingProps {
  onBoldToggle?: () => void;
  onItalicToggle?: () => void;
  onBulletListToggle?: () => void;
  onNumberedListToggle?: () => void;
  onHorizontalRuleInsert?: () => void;
  onFontTypeChange?: (fontType: 'h1' | 'h2' | 'h3' | 'p') => void;
}

export const useLexicalFormatting = ({
  onBoldToggle,
  onItalicToggle,
  onBulletListToggle,
  onNumberedListToggle,
  onHorizontalRuleInsert,
  onFontTypeChange
}: UseLexicalFormattingProps) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // 注册字体类型切换功能
    if (onFontTypeChange) {
      const handleFontTypeChange = (fontType: 'h1' | 'h2' | 'h3' | 'p') => {
        editor.update(() => {
          const selection = $getSelection();

          if ($isRangeSelection(selection)) {
            // 如果有选中文本，只对选中的块应用字体类型
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
            // 如果没有选中文本，改变整个段落的类型
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
              // 如果没有内容，创建一个相应类型的节点
              let node;
              if (fontType === 'p') {
                node = $createParagraphNode();
              } else {
                node = $createHeadingNode(fontType);
              }
              root.append(node);
            }
          }
        });
      };

      // 将函数暴露给父组件
      (editor as any)._fontTypeChangeHandler = handleFontTypeChange;
    }

    // 处理加粗功能
    if (onBoldToggle) {
      const handleBoldToggle = () => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
      };

      // 将函数暴露给父组件
      (editor as any)._boldToggleHandler = handleBoldToggle;
    }

    // 处理斜体功能
    if (onItalicToggle) {
      const handleItalicToggle = () => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
      };

      (editor as any)._italicToggleHandler = handleItalicToggle;
    }

    // 处理无序列表功能
    if (onBulletListToggle) {
      const handleBulletListToggle = () => {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      };

      (editor as any)._bulletListToggleHandler = handleBulletListToggle;
    }

    // 处理有序列表功能
    if (onNumberedListToggle) {
      const handleNumberedListToggle = () => {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      };

      (editor as any)._numberedListToggleHandler = handleNumberedListToggle;
    }

    // 处理分割线功能
    if (onHorizontalRuleInsert) {
      const handleHorizontalRuleInsert = () => {
        editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
      };

      (editor as any)._horizontalRuleInsertHandler = handleHorizontalRuleInsert;
    }
  }, [
    editor,
    onFontTypeChange,
    onBoldToggle,
    onItalicToggle,
    onBulletListToggle,
    onNumberedListToggle,
    onHorizontalRuleInsert
  ]);
};