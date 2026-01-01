// 工具函数统一导出文件

export {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
  refreshAccessToken,
  isUserLoggedIn
} from './token';

export * from './validation';

export {
  editorTheme,
  defaultEditorConfig
} from './editor';

/**
 * 复制文本到剪贴板的工具函数
 * @param text 要复制的文本
 * @returns Promise<boolean> 复制是否成功
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      // 使用现代 Clipboard API
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 降级处理：使用旧的 execCommand 方法
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.setAttribute('readonly', '');
      textArea.style.position = 'absolute';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

/**
 * 复制富文本(HTML)到剪贴板
 * @param html 要复制的HTML字符串
 * @param plain 可选的纯文本备用内容
 * @returns Promise<boolean> 复制是否成功
 */
export const copyRichTextToClipboard = async (html: string, plain?: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && 'write' in navigator.clipboard && window.isSecureContext) {
      const items = [
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([plain ?? html.replace(/<[^>]*>/g, '')], { type: 'text/plain' })
        })
      ];
      await (navigator.clipboard as Clipboard).write(items);
      return true;
    } else {
      // 降级：创建隐藏div写入HTML，选择后执行复制
      const container = document.createElement('div');
      container.innerHTML = html;
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.setAttribute('contenteditable', 'true');
      document.body.appendChild(container);
      
      const range = document.createRange();
      range.selectNodeContents(container);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      
      const successful = document.execCommand('copy');
      selection?.removeAllRanges();
      document.body.removeChild(container);
      
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy rich text: ', err);
    return false;
  }
};

/**
 * 根据字体类型获取对应的 CSS 类名
 * @param fontType 字体类型 ('h1' | 'h2' | 'h3' | 'p')
 * @returns 对应的 CSS 类名字符串
 */
export const getFontClass = (fontType?: 'h1' | 'h2' | 'h3' | 'p'): string => {
  switch(fontType) {
    case 'h1':
      return 'text-2xl font-bold';
    case 'h2':
      return 'text-xl font-semibold';
    case 'h3':
      return 'text-lg font-medium';
    default: // 'p' or undefined
      return 'text-sm text-node-content';
  }
};

/**
 * 判断颜色是否为非白色系
 * @param color 颜色值
 * @returns 如果颜色不是白色系则返回true，否则返回false
 */
export const isNotWhiteColor = (color: string): boolean => {
  const whiteColors = [
    'white',
    'transparent',
    '#ffffff',
    '#fff',
    '#FFFFFF',
    '#FFF'
  ];
  return !whiteColors.includes(color);
};
