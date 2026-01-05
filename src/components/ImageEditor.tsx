'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';

// 导入ToastUI ImageEditor的CSS样式
import 'tui-image-editor/dist/tui-image-editor.css';

// 导入共享的类型定义
import type { ToastUIEditorInstance, ImageEditorOptions } from '../types/image-editor';

// 使用dynamic import实现客户端渲染
const ToastUIEditor = dynamic(() => import('@toast-ui/react-image-editor'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full w-full">加载图片编辑器中...</div>,
});

interface ImageEditorProps {
  options?: ImageEditorOptions;
  onReady?: (editor: ToastUIEditorInstance) => void;
}

const ImageEditor = ({ options, onReady }: ImageEditorProps) => {
  const editorRef = useRef<ToastUIEditorInstance | null>(null);

  // 处理编辑器加载完成事件
  const handleEditorReady = (editor: ToastUIEditorInstance) => {
    editorRef.current = editor;
    
    // 确保编辑器完全就绪后再处理图片加载
    setTimeout(() => {
      if (onReady) {
        onReady(editor);
      }
    }, 100);
  };

  // 组件卸载时销毁编辑器实例，避免内存泄漏
  useEffect(() => {
    return () => {
      if (editorRef.current) {
        try {
          // 销毁编辑器实例
          editorRef.current.destroy();
          editorRef.current = null;
        } catch (error) {
          console.error('销毁编辑器实例失败:', error);
        }
      }
    };
  }, []);

  return (
    <div className="h-full w-full">
      <ToastUIEditor
        options={options}
        onReady={handleEditorReady}
      />
    </div>
  );
};

export default ImageEditor;