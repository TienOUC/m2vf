'use client';

import { memo } from 'react';
import { NodeResizeControl } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { NodeBase } from './NodeBase';
import { getFontClass, isNotWhiteColor } from '@/lib/utils';
import { ResizeIcon, FullscreenDialog, LexicalEditor } from '@/components/editor';
import { useTextNode } from '@/hooks/nodes/useTextNode';
import { TextNodeData } from '@/lib/types/editor/text';

function TextNode(props: NodeProps) {
  const { data, id, selected } = props;
  const nodeData = data as TextNodeData;
  
  const {
    content,
    editorStateJson,
    isEditing,
    currentFontType,
    isFullscreenDialogOpen,
    nodeRef,
    editorContainerRef,
    lexicalEditorRef,
    handleDoubleClick,
    handleEditorChange,
    handleEditorInit,
    toggleFullscreenDialog,
    closeFullscreenDialog,
    handleFontTypeChange,
    handleBoldToggle,
    handleItalicToggle,
    handleBulletListToggle,
    handleNumberedListToggle,
    handleHorizontalRuleInsert,
    setIsEditing,
    isNodeSelected
  } = useTextNode({
    data: nodeData as TextNodeData,
    id: id as string,
    selected: selected as boolean,
    onEditingChange: nodeData.onEditingChange,
    onFontTypeChange: nodeData.onFontTypeChange
  });

  const controlStyle = {
    background: 'transparent',
    border: 'none'
  };

  const isDarkBg = isNotWhiteColor((data as TextNodeData)?.backgroundColor || 'white');
  const fontClass = getFontClass('p');

  return (
      <>
      <NodeBase
        ref={nodeRef}
        data={{ ...data, isEditing }}
        id={id}
        // 当全屏Dialog打开时，不显示原始节点的工具栏
        selected={isNodeSelected}
        nodeType="text"
        onBackgroundColorChange={(data as TextNodeData)?.onBackgroundColorChange}
        onFontTypeChange={(_, fontType) => handleFontTypeChange(fontType)}
        backgroundColor={(data as TextNodeData)?.backgroundColor}
        fontType={currentFontType}
        onToggleFullscreen={toggleFullscreenDialog}
        // 传递文本格式化功能
        onBoldToggle={handleBoldToggle}
        onItalicToggle={handleItalicToggle}
        onBulletListToggle={handleBulletListToggle}
        onNumberedListToggle={handleNumberedListToggle}
        onHorizontalRuleInsert={handleHorizontalRuleInsert}
      >
        {!isFullscreenDialogOpen && (
          <NodeResizeControl className="group" style={controlStyle} minWidth={100} minHeight={50}>
            <ResizeIcon className="absolute right-0 bottom-0" />
          </NodeResizeControl>
        )}
        <div
          ref={editorContainerRef}
          className={`absolute inset-0 ${isEditing ? 'nodrag' : ''}`}
          onDoubleClick={handleDoubleClick}
          onWheel={(e) => {
            if (isEditing) {
              e.stopPropagation();
            }
          }}
          onWheelCapture={(e) => {
            if (isEditing) {
              e.stopPropagation();
            }
          }}
          style={{ cursor: isEditing ? 'default' : 'grab' }}
        >
          {isEditing ? (
            <LexicalEditor
              key={`editor-${id}`}
              initialContent={content}
              initialEditorState={editorStateJson}
              onChange={handleEditorChange}
              onInit={handleEditorInit}
              backgroundColor={(data as TextNodeData)?.backgroundColor || 'white'}
              fontColor={isDarkBg ? 'white' : 'gray-700'}
              className={`w-full h-full ${fontClass}`}
            />
          ) : (
            <div className="w-full h-full relative">
              {/* 使用只读模式的编辑器来展示内容，保留所有样式 */}
              <LexicalEditor
                key={`readonly-editor-${id}`}
                initialContent={content}
                initialEditorState={editorStateJson}
                backgroundColor={(data as TextNodeData)?.backgroundColor || 'white'}
                fontColor={isDarkBg ? 'white' : 'gray-700'}
                className={`w-full h-full ${fontClass}`}
                readOnly={true}
              />
              {/* 如果没有内容，显示占位符 */}
              {!content && (
                <div
                  className={`absolute inset-0 p-2 text-${isDarkBg ? 'white' : 'gray-500'} pointer-events-none`}
                  style={{ fontSize: 'var(--font-size-xs)' }}
                >
                  双击输入文本
                </div>
              )}
            </div>
          )}
        </div>
      </NodeBase>
      
      {/* 全屏Dialog组件 */}
      <FullscreenDialog
        isOpen={isFullscreenDialogOpen}
        onClose={closeFullscreenDialog}
        backgroundColor={(data as TextNodeData)?.backgroundColor || 'white'}
        fontType={currentFontType}
        onFontTypeChange={handleFontTypeChange}
        onBoldToggle={handleBoldToggle}
        onItalicToggle={handleItalicToggle}
        onBulletListToggle={handleBulletListToggle}
        onNumberedListToggle={handleNumberedListToggle}
        onHorizontalRuleInsert={handleHorizontalRuleInsert}
        getContent={() => (data as TextNodeData)?.getContent?.(id) || content}
        getRichContent={() => (data as TextNodeData)?.getRichContent?.(id) ?? ''}
      >
        {/* 在全屏Dialog中渲染编辑器，强制进入编辑模式 */}
        <div className="p-6 min-h-[400px]">
          <LexicalEditor
            key={`fullscreen-editor-${id}`}
            initialContent={content}
            initialEditorState={editorStateJson}
            onChange={handleEditorChange}
            onInit={handleEditorInit}
            backgroundColor={(data as TextNodeData)?.backgroundColor || 'white'}
            fontColor={isDarkBg ? 'white' : 'gray-700'}
            className={`w-full min-h-[400px] ${fontClass}`}
          />
        </div>
      </FullscreenDialog>
    </>
  );
}

export default memo(TextNode);
