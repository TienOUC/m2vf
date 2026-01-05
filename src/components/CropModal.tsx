import { createPortal } from 'react-dom';
import { useRef } from 'react';
import ImageEditor from './ImageEditor';

// 导入共享的类型定义
import type { ToastUIEditorInstance } from '../types/image-editor';

interface CropModalProps {
  imageUrl: string;
  isOpen: boolean;
  onSave: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

const CropModal = ({ imageUrl, isOpen, onSave, onCancel }: CropModalProps) => {
  const editorRef = useRef<ToastUIEditorInstance | null>(null);

  // 保存编辑结果
  const handleEditSave = async () => {
    if (editorRef.current) {
      try {
        // 确保当前处于裁剪模式
        if (typeof editorRef.current.applyCrop === 'function') {
          editorRef.current.applyCrop();
        }
        
        // 等待裁剪操作完成
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const editedImageUrl = editorRef.current.toDataURL();
        onSave(editedImageUrl);
      } catch (error) {
        console.error('保存图片失败:', error);
        // 如果直接应用裁剪失败，尝试获取当前图片数据
        try {
          const editedImageUrl = editorRef.current.toDataURL();
          onSave(editedImageUrl);
        } catch (fallbackError) {
          console.error('使用备用方法保存图片失败:', fallbackError);
        }
      }
    }
  };

  // 处理编辑器就绪事件
  const handleEditorReady = (editor: ToastUIEditorInstance) => {
    editorRef.current = editor;
    
    // 延迟加载图片以确保编辑器完全初始化
    setTimeout(async () => {
      if (imageUrl) {
        try {
          // 尝试使用 loadImageFromURL 方法加载图片
          if (editor.loadImageFromURL) {
            await editor.loadImageFromURL(imageUrl, 'image.jpg');
            console.log('使用 loadImageFromURL 加载图片成功');
          } else if (editor.loadImage) {
            // 备用方法：使用 loadImage
            const loadImageFn = editor.loadImage;
            const img = new Image();
            img.onload = () => {
              loadImageFn({ path: imageUrl, name: 'image.jpg' });
              console.log('使用 loadImage 加载图片成功');
            };
            img.onerror = () => {
              console.error('图片预加载失败:', imageUrl);
            };
            img.src = imageUrl;
          }
        } catch (error) {
          console.error('图片加载失败:', error);
        }
      }
    }, 200);
  };

  if (!isOpen || !imageUrl) return null;

  // 验证图片URL是否有效
  const isValidImageUrl = imageUrl && (
    imageUrl.startsWith('http') || 
    imageUrl.startsWith('data:') ||
    imageUrl.startsWith('/')
  );
  
  if (!isValidImageUrl) {
    return createPortal(
      <div className="fixed inset-0 z-9999 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6">
          <h2 className="text-xl font-bold mb-4">图片裁剪</h2>
          <p className="text-red-500 mb-4">错误：无效的图片URL，无法加载图片进行裁剪</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 rounded-md"
            >
              确定
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }
  
  return createPortal(
    <div className="fixed inset-0 z-9999 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">图片裁剪</h2>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 rounded-md"
            >
              取消
            </button>
            <button
              onClick={handleEditSave}
              className="px-4 py-2 bg-green-600 text-white rounded-md"
            >
              保存
            </button>
          </div>
        </div>
        <div className="flex-1">
          <ImageEditor
            options={{
              includeUI: {
                menu: ['crop'],
                uiSize: {
                  width: '100%',
                  height: '100%'
                },
                menuBarPosition: 'top',
                initMenu: 'crop'
              },
              cssMaxWidth: 1200,
              cssMaxHeight: 800,
              usageStatistics: false,
              // 添加选择样式配置
              selectionStyle: {
                cornerSize: 10,
                rotatingPointOffset: 25,
                cornerColor: '#3b82f6',
                lineColor: '#3b82f6',
                lineWidth: 2
              },
              // 确保裁剪功能正确启用的配置
              selection: true,
              crop: true
            }}
            onReady={handleEditorReady}
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CropModal;