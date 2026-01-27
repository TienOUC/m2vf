import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu';
import { 
  Paperclip, 
  Upload, 
  FolderOpen, 
  Boxes, 
  Sparkles as SparklesIcon, 
  Send,
  Globe,
  Atom
} from 'lucide-react';
import { ModelSelector } from '../ModelSelector';
import type { AIModel } from '@/lib/types/studio';

interface ChatInputToolbarProps {
  isUploading: boolean;
  isGenerating: boolean;
  input: string;
  showModelSelector: boolean;
  isAgentMode: boolean;
  selectedModel: AIModel;
  onToggleModelSelector: () => void;
  onSelectModel: (model: AIModel) => void;
  onLocalUpload: () => void;
  onAssetSelectClick: () => void;
  onToggleMode: () => void;
  onSend: () => void;
  onCancel?: () => void;
  // 选中状态属性
  isSearchSelected?: boolean;
  isThinkSelected?: boolean;
  onToggleSearch?: () => void;
  onToggleThink?: () => void;
}

export function ChatInputToolbar({ 
  isUploading, 
  isGenerating, 
  input, 
  showModelSelector, 
  isAgentMode, 
  selectedModel, 
  onToggleModelSelector, 
  onSelectModel, 
  onLocalUpload, 
  onAssetSelectClick, 
  onToggleMode, 
  onSend, 
  onCancel,
  isSearchSelected = false,
  isThinkSelected = false,
  onToggleSearch,
  onToggleThink 
}: ChatInputToolbarProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost"
              size="icon"
              className="p-2 rounded-lg bg-background/80 border border-border hover:bg-accent hover:text-accent-foreground"
              aria-label="添加附件"
              disabled={isUploading}
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Paperclip className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuItem onClick={onLocalUpload} className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              <span>本地上传</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAssetSelectClick} className="cursor-pointer">
              <FolderOpen className="w-4 h-4 mr-2" />
              <span>选择资产</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button 
          variant="ghost"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background/80 hover:bg-accent hover:text-accent-foreground"
          onClick={onToggleMode}
        >
          <SparklesIcon className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">{isAgentMode ? 'Managed' : 'Chat'}</span>
        </Button>
      </div>

      <div className="flex items-center gap-1">
        {/* Agent模式下显示联网搜索和深度思考按钮 */}
        {isAgentMode && (
          <>
            <Button 
              variant="ghost"
              size="icon"
              className={`p-2 rounded-lg border transition-all duration-200 ease-in-out ${
                isSearchSelected 
                  ? 'bg-primary/10 border-primary text-primary hover:bg-primary/20'
                  : 'bg-background/80 border-border hover:bg-accent hover:text-accent-foreground'
              }`}
              aria-label={isSearchSelected ? "关闭联网搜索" : "联网搜索"}
              onClick={onToggleSearch}
            >
              <Globe className={`w-4 h-4 transition-colors duration-200 ${
                isSearchSelected ? 'text-primary' : 'text-muted-foreground'
              }`} />
            </Button>
            <Button 
              variant="ghost"
              size="icon"
              className={`p-2 rounded-lg border transition-all duration-200 ease-in-out ${
                isThinkSelected 
                  ? 'bg-primary/10 border-primary text-primary hover:bg-primary/20'
                  : 'bg-background/80 border-border hover:bg-accent hover:text-accent-foreground'
              }`}
              aria-label={isThinkSelected ? "关闭深度思考" : "深度思考"}
              onClick={onToggleThink}
            >
              <Atom className={`w-4 h-4 transition-colors duration-200 ${
                isThinkSelected ? 'text-primary' : 'text-muted-foreground'
              }`} />
            </Button>
          </>
        )}
        
        <div className="relative">
          <Button 
            variant="ghost"
            size="icon"
            onClick={onToggleModelSelector}
            className={`p-2 rounded-lg bg-background/80 border border-border hover:bg-accent hover:text-accent-foreground ${showModelSelector ? 'bg-accent' : ''}`}
            aria-label="选择模型"
          >
            <Boxes className="w-4 h-4 text-muted-foreground" />
          </Button>
          <ModelSelector
            isOpen={showModelSelector}
            onClose={onToggleModelSelector}
            onSelectModel={onSelectModel}
            selectedModel={selectedModel}
            theme="light"
          />
        </div>
        {isGenerating ? (
          <Button 
            variant="secondary"
            size="icon"
            onClick={onCancel}
            className={`w-8 h-8 ml-1 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90`}
            aria-label="取消生成"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Button>
        ) : (
          <Button 
            variant={input.trim() ? "default" : "secondary"}
            size="icon"
            onClick={onSend}
            disabled={!input.trim()}
            className={`w-8 h-8 ml-1 rounded-lg ${input.trim()
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
            aria-label="发送消息"
          >
            <Send className="w-3 h-3" fill="currentColor" />
          </Button>
        )}
      </div>
    </div>
  );
}
