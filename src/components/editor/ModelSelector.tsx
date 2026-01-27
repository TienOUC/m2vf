'use client'

import React from "react"
import { useState, useRef, useEffect } from 'react'
import { Check, Sparkles } from 'lucide-react'
import { useClickOutside } from '@/hooks/ui/useClickOutside'
import { cn } from '@/lib/utils'
import type { AIModel, ModelCategory } from '@/lib/types/studio'
import { AI_MODELS } from '@/lib/studio-data'

interface ModelSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectModel: (model: AIModel) => void
  selectedModel: AIModel
  theme: string
}

const ModelIcon = ({ icon, isDark }: { icon: string; isDark: boolean }) => {
  const bgClass = isDark ? "bg-white/[0.06]" : "bg-gray-100"
  const textClass = isDark ? "text-white/70" : "text-gray-600"
  
  const iconMap: Record<string, React.ReactNode> = {
    google: (
      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", bgClass)}>
        <svg viewBox="0 0 24 24" className={cn("w-3.5 h-3.5", textClass)} fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      </div>
    ),
    openai: (
      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", bgClass)}>
        <svg viewBox="0 0 24 24" className={cn("w-3.5 h-3.5", textClass)} fill="currentColor">
          <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
        </svg>
      </div>
    ),
    flux: (
      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", bgClass)}>
        <svg viewBox="0 0 24 24" className={cn("w-3.5 h-3.5", textClass)} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
    ),
    bytedance: (
      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", bgClass)}>
        <Sparkles className={cn("w-3.5 h-3.5", textClass)} />
      </div>
    ),
    runway: (
      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-semibold flex-shrink-0", bgClass, textClass)}>R</div>
    ),
    pika: (
      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-semibold flex-shrink-0", bgClass, textClass)}>P</div>
    ),
    meshy: (
      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-semibold flex-shrink-0", bgClass, textClass)}>M</div>
    ),
    tripo: (
      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-semibold flex-shrink-0", bgClass, textClass)}>T</div>
    ),
  }
  return iconMap[icon] || <div className={cn("w-7 h-7 rounded-lg flex-shrink-0", bgClass)} />
}

export function ModelSelector({ isOpen, onClose, onSelectModel, selectedModel, theme }: ModelSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<ModelCategory>('image')
  const [autoMode, setAutoMode] = useState(false)
  const isDark = theme === 'dark'
  const selectorRef = useRef<HTMLDivElement>(null)

  // 使用 useClickOutside 钩子处理外部点击关闭
  useClickOutside([selectorRef], onClose, isOpen)

  const categories: { key: ModelCategory; label: string }[] = [
    { key: 'image', label: 'Image' },
    { key: 'video', label: 'Video' },
    { key: '3d', label: '3D' },
  ]

  const filteredModels = AI_MODELS.filter(m => m.category === activeCategory)

  if (!isOpen) return null

  return (
    <div 
      ref={selectorRef}
      className={cn(
        "absolute bottom-full right-0 mb-2 w-[280px] rounded-xl shadow-sm overflow-hidden animate-in slide-in-from-bottom-2 duration-200",
        isDark ? "bg-[#131313] border border-white/[0.08]" : "bg-white border border-gray-200"
      )}>
      {/* Header */}
      <div className={cn("p-3", isDark ? "border-b border-white/[0.06]" : "border-b border-gray-200")}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={cn("text-[13px] font-medium", isDark ? "text-white/90" : "text-gray-800")}>模型</h3>
          <div className="flex items-center gap-1.5">
            <span className={cn("text-[11px]", isDark ? "text-white/40" : "text-gray-500")}>自动</span>
            <button
              onClick={() => {
                const newAutoMode = !autoMode;
                setAutoMode(newAutoMode);
                if (newAutoMode) {
                  // 自动模式开启时，取消当前选中的模型
                  onSelectModel({
                    id: 'auto',
                    name: 'Auto',
                    description: '自动选择模型',
                    category: activeCategory,
                    icon: 'openai',
                    time: ''
                  });
                }
              }}
              className={cn(
                "w-8 h-4 rounded-full transition-colors relative",
                autoMode ? "bg-blue-500" : isDark ? "bg-white/[0.08]" : "bg-gray-300"
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform",
                  autoMode ? "translate-x-4" : "translate-x-0.5"
                )}
              />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className={cn("flex rounded-lg p-0.5", isDark ? "bg-white/[0.04]" : "bg-gray-100")}>
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={cn(
                "flex-1 py-1.5 text-[11px] font-medium rounded-md transition-all",
                activeCategory === cat.key
                  ? isDark ? "bg-white/[0.08] text-white/95" : "bg-white text-gray-900 shadow-sm"
                  : isDark ? "text-white/40 hover:text-white/60" : "text-gray-500 hover:text-gray-700"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Models List */}
      <div className="max-h-[240px] overflow-y-auto">
        <div className="p-1.5">
          {filteredModels.map(model => (
          <button
            key={model.id}
            onClick={() => {
              // 选择具体模型时，关闭自动模式
              setAutoMode(false);
              onSelectModel(model);
              // 移除 onClose() 调用，保持菜单打开
            }}
            className={cn(
              "w-full flex items-center gap-2.5 p-2 rounded-lg transition-colors text-left group",
              selectedModel?.id === model.id && !autoMode
                ? isDark ? "bg-white/[0.06]" : "bg-gray-100"
                : isDark ? "hover:bg-white/[0.04]" : "hover:bg-gray-50"
            )}
          >
            <ModelIcon icon={model.icon} isDark={isDark} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn("font-medium text-[12px]", isDark ? "text-white/90" : "text-gray-800")}>{model.name}</span>
                <span className={cn("text-[10px] font-mono", isDark ? "text-white/30" : "text-gray-400")}>{model.time}</span>
              </div>
              <div className={cn("text-[11px] truncate", isDark ? "text-white/40" : "text-gray-500")}>{model.description}</div>
            </div>
            {selectedModel?.id === model.id && !autoMode && (
              <div className="w-4 h-4 rounded bg-blue-500 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </button>
        ))}
        </div>
      </div>
    </div>
  )
}
