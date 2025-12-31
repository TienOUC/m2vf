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
  $getSelection,
  $setSelection,
  $createRangeSelection,
  $isRangeSelection
} from 'lexical';
import { $createHeadingNode, HeadingNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { FORMAT_TEXT_COMMAND, INSERT_HORIZONTAL_RULE_COMMAND } from 'lexical';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND
} from '@lexical/list';

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

  useEffect(() => {
    // 只有在有初始内容时才将光标移动到末尾
    if (initialContent) {
      editor.update(() => {
        const root = $getRoot();
        const lastNode = root.getLastDescendant();
        if (lastNode) {
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
        }
      });
    }
  }, [editor, initialContent]);

  return null;
}

// 文本格式化插件
function TextFormatPlugin({
  onBoldToggle,
  onItalicToggle,
  onBulletListToggle,
  onNumberedListToggle,
  onHorizontalRuleInsert,
  onFontTypeChange
}: {
  onBoldToggle?: () => void;
  onItalicToggle?: () => void;
  onBulletListToggle?: () => void;
  onNumberedListToggle?: () => void;
  onHorizontalRuleInsert?: () => void;
  onFontTypeChange?: (fontType: 'h1' | 'h2' | 'h3' | 'p') => void;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (onFontTypeChange) {
      // 注册命令来处理字体类型切换
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
  fontColor = 'gray-700',
  onBoldToggle,
  onItalicToggle,
  onBulletListToggle,
  onNumberedListToggle,
  onHorizontalRuleInsert,
  onFontTypeChange
}: M2VFlowLexicalEditorPropsType & {
  onBoldToggle?: () => void;
  onItalicToggle?: () => void;
  onBulletListToggle?: () => void;
  onNumberedListToggle?: () => void;
  onHorizontalRuleInsert?: () => void;
  onFontTypeChange?: (fontType: 'h1' | 'h2' | 'h3' | 'p') => void;
}) {
  const initialConfig = {
    ...defaultEditorConfig,
    nodes: [HeadingNode]
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
                className={`editor-input w-full h-full p-2 min-h-[100px] focus:outline-none bg-${backgroundColor} text-${fontColor}`}
                onMouseDown={(e) => e.stopPropagation()}
              />
            }
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <AutoFocusPlugin />
        {onChange && <OnChangePlugin onChange={onChange} />}
        <ClearEditorPlugin />
        <InitialContentPlugin initialContent={initialContent} />
        <MoveCursorToEndPlugin initialContent={initialContent} />
        <TextFormatPlugin
          onBoldToggle={onBoldToggle}
          onItalicToggle={onItalicToggle}
          onBulletListToggle={onBulletListToggle}
          onNumberedListToggle={onNumberedListToggle}
          onHorizontalRuleInsert={onHorizontalRuleInsert}
          onFontTypeChange={onFontTypeChange}
        />
      </div>
    </LexicalComposer>
  );
}
