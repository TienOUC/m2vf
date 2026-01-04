'use client';

import dynamic from 'next/dynamic';

// 使用dynamic import实现客户端渲染
const ToastUIEditor = dynamic(() => import('@toast-ui/react-image-editor'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full w-full">加载图片编辑器中...</div>,
});

interface ImageEditorProps {
  initialImage?: string;
  options?: any;
  onReady?: (editor: any) => void;
}

const ImageEditor = ({ initialImage, options, onReady }: ImageEditorProps) => {
  return (
    <div className="h-full w-full">
      <ToastUIEditor
        initialImage={initialImage}
        options={options}
        onReady={onReady}
      />
    </div>
  );
};

export default ImageEditor;