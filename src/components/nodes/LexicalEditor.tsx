import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { $getRoot, $getSelection, EditorState, LexicalEditor } from 'lexical';
import { FormatBold, FormatItalic, FormatListBulleted, FormatListNumbered, Title, HorizontalRule } from '@mui/icons-material';
import ToolbarButton from './ToolbarButton';
import { $isRangeSelection } from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createParagraphNode, $createHeadingNode } from '@lexical/rich-text';
import { $createListNode, $isListNode } from '@lexical/list';
import { $createHorizontalRuleNode } from '@lexical/rich-text';
import { useCallback } from 'react';

// 编辑器主题
const editorTheme = {
  ltr: 'ltr',
  rtl: 'rtl',
  placeholder: 'editor-placeholder',
  paragraph: 'editor-paragraph',
  quote: 'editor-quote',
  heading: {
    h1: 'editor-heading-h1',
    h2: 'editor-heading-h2',
    h3: 'editor-heading-h3',
    h4: 'editor-heading-h4',
    h5: 'editor-heading-h5',
  },
  list: {
    nested: {
      listitem: 'editor-nested-listitem',
    },
    listitem: 'editor-listitem',
    listitemChecked: 'editor-listitem-checked',
    listitemUnchecked: 'editor-listitem-unchecked',
    olDepth: [
      'editor-list-ol-1',
      'editor-list-ol-2',
      'editor-list-ol-3',
      'editor-list-ol-4',
      'editor-list-ol-5',
    ],
    ulDepth: [
      'editor-list-ul-1',
      'editor-list-ul-2',
      'editor-list-ul-3',
      'editor-list-ul-4',
      'editor-list-ul-5',
    ],
  },
  text: {
    bold: 'editor-text-bold',
    italic: 'editor-text-italic',
    underline: 'editor-text-underline',
    strikethrough: 'editor-text-strikethrough',
    underlineStrikethrough: 'editor-text-underlineStrikethrough',
    code: 'editor-text-code',
  },
};

// 默认编辑器配置
const defaultEditorConfig = {
  namespace: 'M2VFlowEditor',
  theme: editorTheme,
  onError: (error: Error) => {
    console.error('Lexical错误:', error);
  },
};

// 工具栏插件组件
function EditorToolbar({
  onBoldClick,
  onItalicClick,
  onH1Click,
  onH2Click,
  onH3Click,
  onBulletListClick,
  onNumberedListClick,
  onHorizontalRuleClick,
}: {
  onBoldClick: () => void;
  onItalicClick: () => void;
  onH1Click: () => void;
  onH2Click: () => void;
  onH3Click: () => void;
  onBulletListClick: () => void;
  onNumberedListClick: () => void;
  onHorizontalRuleClick: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 p-1 border-b border-gray-200 bg-gray-50 rounded-t-md">
      <ToolbarButton
        icon={<FormatBold />}
        title="加粗 (Ctrl+B)"
        onClick={onBoldClick}
        className="w-8 h-8 p-1 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"
        ariaLabel="加粗"
      />
      <ToolbarButton
        icon={<FormatItalic />}
        title="斜体 (Ctrl+I)"
        onClick={onItalicClick}
        className="w-8 h-8 p-1 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"
        ariaLabel="斜体"
      />
      <ToolbarButton
        icon={<Title />}
        title="标题样式"
        onClick={() => {}} // 这里使用下拉菜单，所以点击事件为空
        className="w-8 h-8 p-1 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"
        ariaLabel="标题样式"
      >
        <div className="flex flex-col w-full">
          <button
            onClick={onH1Click}
            className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            H1
          </button>
          <button
            onClick={onH2Click}
            className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            H2
          </button>
          <button
            onClick={onH3Click}
            className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            H3
          </button>
        </div>
      </ToolbarButton>
      <ToolbarButton
        icon={<FormatListBulleted />}
        title="无序列表"
        onClick={onBulletListClick}
        className="w-8 h-8 p-1 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"
        ariaLabel="无序列表"
      />
      <ToolbarButton
        icon={<FormatListNumbered />}
        title="有序列表"
        onClick={onNumberedListClick}
        className="w-8 h-8 p-1 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"
        ariaLabel="有序列表"
      />
      <ToolbarButton
        icon={<HorizontalRule />}
        title="分割线"
        onClick={onHorizontalRuleClick}
        className="w-8 h-8 p-1 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"
        ariaLabel="分割线"
      />
    </div>
  );
}

// 编辑器内部工具栏插件
function M2VFlowToolbarPlugin({
  onBoldClick,
  onItalicClick,
  onH1Click,
  onH2Click,
  onH3Click,
  onBulletListClick,
  onNumberedListClick,
  onHorizontalRuleClick,
}: {
  onBoldClick: () => void;
  onItalicClick: () => void;
  onH1Click: () => void;
  onH2Click: () => void;
  onH3Click: () => void;
  onBulletListClick: () => void;
  onNumberedListClick: () => void;
  onHorizontalRuleClick: () => void;
}) {
  const [editor] = useLexicalComposerContext();

  // 格式化文本
  const formatText = (format: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.formatText(format as any); // 使用 any 类型绕过类型检查
      }
    });
  };

  // 设置标题
  const setHeading = (headingSize: 'h1' | 'h2' | 'h3' | 'p') => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (headingSize === 'p') {
          $setBlocksType(selection, () => $createParagraphNode());
        } else {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      }
    });
  };

  // 切换列表
  const toggleList = (listType: 'bullet' | 'number') => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        return;
      }
      
      const anchorNode = selection.anchor.getNode();
      const parent = anchorNode.getParentOrThrow();
      const isListNode = $isListNode(parent);

      if (isListNode) {
        const listNode = parent;
        if (listNode.getTag() !== (listType === 'bullet' ? 'ul' : 'ol')) {
          // 更改列表类型
          listNode.replace($createListNode(listType));
        } else {
          // 移除列表
          listNode.replace($createParagraphNode()).select();
        }
      } else {
        // 创建列表
        const list = $createListNode(listType);
        selection.insertNodes([list]);
      }
    });
  };

  // 插入分割线
  const insertHorizontalRule = () => {
    editor.update(() => {
      const horizontalRuleNode = $createHorizontalRuleNode();
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.insertNodes([horizontalRuleNode]);
      }
    });
  };

  return (
    <EditorToolbar
      onBoldClick={() => formatText('bold')}
      onItalicClick={() => formatText('italic')}
      onH1Click={() => setHeading('h1')}
      onH2Click={() => setHeading('h2')}
      onH3Click={() => setHeading('h3')}
      onBulletListClick={() => toggleList('bullet')}
      onNumberedListClick={() => toggleList('number')}
      onHorizontalRuleClick={insertHorizontalRule}
    />
  );
}

// 编辑器内容显示插件
function Placeholder() {
  return (
    <div className="editor-placeholder absolute top-2 left-2 text-gray-400 pointer-events-none">
      输入文本内容...
    </div>
  );
}

interface M2VFlowLexicalEditorProps {
  initialContent?: string;
  onChange?: (editorState: EditorState, editor: LexicalEditor) => void;
  darkMode?: boolean;
  className?: string;
  backgroundColor?: string;
  fontColor?: string;
}

export function M2VFlowLexicalEditor({
  initialContent = '',
  onChange,
  darkMode = false,
  className = '',
  backgroundColor = 'white',
  fontColor = 'gray-700'
}: M2VFlowLexicalEditorProps) {
  const initialConfig = {
    ...defaultEditorConfig,
    editorState: initialContent ? 
      () => ({ root: { children: [{ type: 'paragraph', children: [{ type: 'text', text: initialContent }] }] } }) : 
      undefined,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className={`editor-container border border-gray-300 rounded-lg overflow-hidden ${className}`}>
        <M2VFlowToolbarPlugin
          onBoldClick={() => {}}
          onItalicClick={() => {}}
          onH1Click={() => {}}
          onH2Click={() => {}}
          onH3Click={() => {}}
          onBulletListClick={() => {}}
          onNumberedListClick={() => {}}
          onHorizontalRuleClick={() => {}}
        />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                className={`editor-input w-full h-full p-2 min-h-[100px] focus:outline-none bg-${backgroundColor} text-${fontColor}`} 
              />
            }
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <AutoFocusPlugin />
        {onChange && <OnChangePlugin onChange={onChange} />}
        <ClearEditorPlugin />
      </div>
    </LexicalComposer>
  );
}

// 导出一个编辑器引用的Hook，用于获取内容
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