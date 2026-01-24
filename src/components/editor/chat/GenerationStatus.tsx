'use client'

interface GenerationStatusProps {
  progress: number;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export function GenerationStatus({ progress }: GenerationStatusProps) {
  return (
    <div className="space-y-2">
      <div className="w-[180px] aspect-square rounded-xl animate-pulse bg-muted" />
      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="w-4 h-4 rounded-full border-2 animate-spin border-muted-foreground/20 border-t-emerald-400/60" />
        <span className="text-sm">处理中...</span>
        <span className="ml-auto font-mono text-xs text-muted-foreground">
          {formatTime(progress * 1.2)} / 2m
        </span>
      </div>
    </div>
  );
}
