import { useCallback } from 'react';
import { getFontClass as getFontClassUtil } from '@/lib/utils/text';

type FontType = 'h1' | 'h2' | 'h3' | 'p';

export interface UseFontStyleProps {
  fontType?: FontType;
  onFontTypeChange?: (nodeId: string, fontType: FontType) => void;
  nodeId: string;
}

export const useFontStyle = ({ fontType, onFontTypeChange, nodeId }: UseFontStyleProps) => {
  const handleFontTypeChange = useCallback((newFontType: FontType) => {
    onFontTypeChange?.(nodeId, newFontType);
  }, [onFontTypeChange, nodeId]);

  const getFontClass = useCallback(() => {
    return getFontClassUtil(fontType);
  }, [fontType]);

  return {
    handleFontTypeChange,
    getFontClass,
    currentFontType: fontType
  };
};