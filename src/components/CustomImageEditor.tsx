'use client';

import { useState, useRef } from 'react';
import ImageEditor from './ImageEditor';

interface CustomImageEditorProps {
  imageUrl: string;
  onSave: (result: string) => void;
  onCancel: () => void;
}

const CustomImageEditor = ({ imageUrl, onSave, onCancel }: CustomImageEditorProps) => {
  const [isReady, setIsReady] = useState(false);
  const [editor, setEditor] = useState<any>(null);

  const handleSave = () => {
    if (editor) {
      try {
        const dataUrl = editor.toDataURL();
        onSave(dataUrl);
      } catch (error) {
        console.error('保存图片失败:', error);
      }
    }
  };

  const handleReady = (editor: any) => {
    setEditor(editor);
    setIsReady(true);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* 顶部工具栏 */}
      <div className="flex justify-end gap-2 p-2 bg-gray-50 border-b border-gray-200">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleSave}
          disabled={!isReady}
          className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
        >
          保存
        </button>
      </div>

      {/* 图片编辑器主体 */}
      <div className="flex-1 overflow-hidden">
        <ImageEditor
          initialImage={imageUrl}
          onReady={handleReady}
          options={{
            includeUI: {
              loadImage: {
                path: imageUrl,
                name: '编辑图片',
              },
              // 配置工具栏菜单
              menu: [
                'crop',
                'rotate',
                'flip',
                'draw',
                'icon',
                'text',
                'filter',
                'resize',
              ],
              // 配置界面大小
              uiSize: {
                width: '100%',
                height: '100%',
              },
              // 菜单位置
              menuBarPosition: 'top',
              // 初始菜单
              initMenu: 'crop',
            },
            // 最大宽高
            cssMaxWidth: 1200,
            cssMaxHeight: 800,
            // 选择样式
            selectionStyle: {
              cornerSize: 8,
              rotatingPointOffset: 20,
            },
            // 禁用使用统计
            usageStatistics: false,
          }}
        />
      </div>
    </div>
  );
};

export default CustomImageEditor;