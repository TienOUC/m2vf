'use client'

import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChatHeader } from './chat/ChatHeader'
import { ChatMessages } from './chat/ChatMessages'
import { ChatInput } from './chat/ChatInput'
import { useChatState } from './chat/useChatState'

interface ChatPanelProps {
  isOpen: boolean
  onClose: () => void
  projectId: string | null
}

export function ChatPanel({ isOpen, onClose, projectId }: ChatPanelProps) {
  const {
    messages,
    input,
    selectedModel,
    isGenerating,
    generationProgress,
    isAgentMode,
    error,
    setIsAgentMode,
    setInput,
    setSelectedModel,
    handleSend,
    cancelGeneration,
  } = useChatState();

  return (
    <div
      className={cn(
        "fixed top-0 right-0 bottom-0 w-[500px] flex flex-col z-50 transition-all duration-300 border-l border-border bg-background",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {isOpen && (
        <Button
          onClick={onClose}
          variant="ghost"
          className="absolute left-[-34px] top-[40px] w-8 h-10 rounded-l-full bg-background border-y border-l border-border flex items-center justify-center transition-all hover:bg-accent hover:text-accent-foreground z-50 shadow-sm"
          aria-label="收起聊天面板"
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </Button>
      )}
      
      <ChatHeader messages={messages} projectId={projectId} />
      
      {/* 错误消息显示 */}
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive text-sm border-b border-border">
          {error}
        </div>
      )}
      
      <ChatMessages 
        messages={messages} 
        isGenerating={isGenerating} 
        generationProgress={generationProgress} 
      />
      <ChatInput 
        input={input} 
        selectedModel={selectedModel} 
        isGenerating={isGenerating} 
        onInputChange={setInput} 
        onSend={handleSend} 
        onSelectModel={setSelectedModel} 
        isAgentMode={isAgentMode} 
        onToggleMode={setIsAgentMode} 
        onCancel={cancelGeneration}
      />
    </div>
  )
}

