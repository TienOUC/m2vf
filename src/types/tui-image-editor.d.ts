declare module '@toast-ui/react-image-editor' {
  import React from 'react';

  interface ImageEditorOptions {
    includeUI?: {
      loadImage?: {
        path: string;
        name: string;
      };
      menu?: string[];
      uiSize?: {
        width: string | number;
        height: string | number;
      };
      menuBarPosition?: string;
      initMenu?: string;
    };
    cssMaxWidth?: number;
    cssMaxHeight?: number;
    selectionStyle?: {
      cornerSize?: number;
      rotatingPointOffset?: number;
    };
    usageStatistics?: boolean;
  }

  interface ToastUIEditorProps {
    initialImage?: string;
    options?: ImageEditorOptions;
    onReady?: (editor: any) => void;
  }

  const ToastUIEditor: React.FC<ToastUIEditorProps>;

  export default ToastUIEditor;
}