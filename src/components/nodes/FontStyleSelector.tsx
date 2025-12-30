import { Title } from '@mui/icons-material';
import { memo } from 'react';
import ToolbarButton from './ToolbarButton';

interface FontStyleSelectorProps {
  onFontTypeChange: (fontType: 'h1' | 'h2' | 'h3' | 'p') => void;
  currentFontType?: 'h1' | 'h2' | 'h3' | 'p';
}

const FontStyleSelector = ({ onFontTypeChange, currentFontType }: FontStyleSelectorProps) => {
  return (
    <ToolbarButton
      icon={<Title fontSize="small" />}
      title="设置字体样式"
      onClick={() => {}}
      className="w-8 h-8 p-1 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"
      ariaLabel="设置字体样式"
    >
      <div className="flex flex-col w-full">
        <button
          onClick={() => onFontTypeChange('h1')}
          className={`w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors ${currentFontType === 'h1' ? 'bg-blue-50 text-blue-600' : ''}`}
        >
          H1
        </button>
        <button
          onClick={() => onFontTypeChange('h2')}
          className={`w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors ${currentFontType === 'h2' ? 'bg-blue-50 text-blue-600' : ''}`}
        >
          H2
        </button>
        <button
          onClick={() => onFontTypeChange('h3')}
          className={`w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors ${currentFontType === 'h3' ? 'bg-blue-50 text-blue-600' : ''}`}
        >
          H3
        </button>
        <button
          onClick={() => onFontTypeChange('p')}
          className={`w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors ${currentFontType === 'p' ? 'bg-blue-50 text-blue-600' : ''}`}
        >
          正文
        </button>
      </div>
    </ToolbarButton>
  );
};

export default memo(FontStyleSelector);