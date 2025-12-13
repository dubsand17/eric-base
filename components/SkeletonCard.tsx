export default function SkeletonCard() {
  return (
    <div className="glass-light dark:glass-dark rounded-2xl border border-terminal-border-light dark:border-terminal-border-dark overflow-hidden animate-gentle-pulse">
      {/* 内容骨架 */}
      <div className="p-5">
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-terminal-state-hover-light dark:bg-terminal-state-hover-dark rounded w-full"></div>
          <div className="h-4 bg-terminal-state-hover-light dark:bg-terminal-state-hover-dark rounded w-5/6"></div>
          <div className="h-4 bg-terminal-state-hover-light dark:bg-terminal-state-hover-dark rounded w-3/4"></div>
        </div>

        {/* 时间和链接骨架 */}
        <div className="flex items-center justify-between">
          <div className="h-3 bg-terminal-state-hover-light/70 dark:bg-terminal-state-hover-dark/70 rounded w-16"></div>
          <div className="h-3 bg-terminal-state-hover-light/70 dark:bg-terminal-state-hover-dark/70 rounded w-12"></div>
        </div>
      </div>

      {/* 图片骨架 */}
      <div className="px-5 pb-5">
        <div className="flex flex-col gap-2">
          <div className="aspect-[4/3] bg-terminal-state-hover-light/50 dark:bg-terminal-state-hover-dark/50 rounded-lg"></div>
        </div>
      </div>
    </div>
  )
}