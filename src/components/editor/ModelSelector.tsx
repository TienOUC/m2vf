'use client'

import React from "react"
import { useState, useRef, useEffect } from 'react'
import { Check } from 'lucide-react'
import { useClickOutside } from '@/hooks/ui/useClickOutside'
import { cn } from '@/lib/utils'
import type { AIModel, ModelCategory } from '@/lib/types/studio'
import { AI_MODELS } from '@/lib/studio-data'
import { Icon } from '@/components/icons'

interface ModelSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectModel: (model: AIModel) => void
  selectedModel: AIModel
  theme: string
}

const ModelIcon = ({ model, isDark }: { model: AIModel; isDark: boolean }) => {
  const bgClass = isDark ? "bg-white/[0.06]" : "bg-gray-100"
  const textClass = isDark ? "text-white/70" : "text-gray-600"
  
  // 使用封装的Icon组件显示模型图标
  return (
    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", bgClass)}>
      <Icon 
        name={(model.iconName || 'kling') as any} 
        size={14} 
        className={textClass}
        theme={isDark ? "dark" : "light"}
      />
    </div>
  )
}

export function ModelSelector({ isOpen, onClose, onSelectModel, selectedModel, theme }: ModelSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<ModelCategory>('image')
  const [autoMode, setAutoMode] = useState(selectedModel?.id === 'auto')
  const isDark = theme === 'dark'
  const selectorRef = useRef<HTMLDivElement>(null)

  // 同步 autoMode 状态
  useEffect(() => {
    setAutoMode(selectedModel?.id === 'auto')
  }, [selectedModel])

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
          {filteredModels.map((model) => (
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
              <ModelIcon model={model} isDark={isDark} />
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
