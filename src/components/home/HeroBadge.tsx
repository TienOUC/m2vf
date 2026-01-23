import { Sparkles } from 'lucide-react'

export function HeroBadge() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full mb-8 bg-white border border-gray-200 dark:bg-white/[0.05] dark:border-white/[0.08]">
      <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
      <span className="text-[13px] text-gray-600 dark:text-white/70">
        AI 驱动的创意工作室
      </span>
    </div>
  )
}