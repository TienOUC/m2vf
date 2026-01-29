import { Layers } from 'lucide-react'

export function HeroVisual() {
  return (
    <div className="w-full flex items-center justify-center mt-8">
      <div className="w-full aspect-video bg-white rounded-3xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 dark:from-emerald-900/30 dark:via-teal-800/20 dark:to-cyan-900/30" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
          <Layers className="w-16 h-16 mb-4 text-gray-400" />
          <h3 className="text-xl font-medium text-gray-400 mb-2">创意工作区预览</h3>
        </div>
      </div>
    </div>
  )
}