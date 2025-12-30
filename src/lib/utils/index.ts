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