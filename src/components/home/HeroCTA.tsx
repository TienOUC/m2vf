import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'

export function HeroCTA() {
  return (
    <div className="mt-10 mb-0 flex items-center gap-4">
      <Link
        href="/login"
        className="flex items-center gap-2 px-6 py-3 rounded-xl text-[15px] font-medium transition-all bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/20 dark:bg-white dark:text-black dark:hover:bg-white/90 dark:shadow-lg dark:shadow-white/10"
      >
        开始创作
        <ArrowRight className="w-4 h-4" />
      </Link>
      <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-[15px] font-medium transition-all bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 dark:bg-white/[0.06] dark:text-white/80 dark:hover:bg-white/[0.1] dark:border-white/[0.08]">
        <Play className="w-4 h-4" />
        观看演示
      </button>
    </div>
  )
}