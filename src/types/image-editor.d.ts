// 图片编辑器实例类型定义
export interface ImageEditorInstance {
  toDataURL: () => string;
  applyCrop: () => void;
  destroy: () => void;
  loadImage?: (image: { path: string; name: string }) => void;
  loadImageFromURL?: (url: string, name: string) => Promise<any>;
  addImageObject?: (imgUrl: string) => Promise<any>;
  getImageSize?: () => { width: number; height: number };
}

// 编辑器选项类型定义
export interface ImageEditorOptions {
  includeUI: {
    loadImage?: { path: string; name: string };
    menu: string[];
    uiSize: { width: string | number; height: string | number };
    menuBarPosition: string;
    initMenu: string;
    cropUI?: {
      preset: {
        ratios: Array<{ name: string; value: number | null }>;
        showRatio: boolean;
        showRotateBtn: boolean;
      };
    };
  };
  cssMaxWidth: number;
  cssMaxHeight: number;
  selectionStyle?: {
    cornerSize: number;
    rotatingPointOffset: number;
    cornerColor: string;
    lineColor: string;
    lineWidth: number;
  };
  usageStatistics: boolean;
  selection?: boolean;
  crop?: boolean;
}