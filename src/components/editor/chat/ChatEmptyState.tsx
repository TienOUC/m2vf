'use client'

export function ChatEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400/15 via-teal-400/10 to-cyan-400/15 flex items-center justify-center mb-4 border border-border">
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-emerald-400/70" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v2M12 19v2M5.64 5.64l1.41 1.41M16.95 16.95l1.41 1.41M3 12h2M19 12h2M5.64 18.36l1.41-1.41M16.95 7.05l1.41-1.41" />
        </svg>
      </div>
      <h3 className="text-sm font-medium mb-1 text-foreground/80">开始创作</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        描述您想要生成的内容
      </p>
    </div>
  );
}
