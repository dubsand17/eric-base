'use client'

import * as Popover from '@radix-ui/react-popover'

interface DateFilterProps {
  from?: string
  to?: string
  onDateChange: (next: { from?: string; to?: string }) => void
}

export default function DateFilter({ from, to, onDateChange }: DateFilterProps) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className="h-9 w-auto whitespace-nowrap px-3 rounded-xl border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-surface-light dark:bg-terminal-surface-dark text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:border-terminal-accent-light dark:hover:border-terminal-accent-dark flex items-center gap-2 sm:mr-0 transition"
          aria-haspopup="dialog"
        >
          日期筛选
        </button>
      </Popover.Trigger>
      <Popover.Content side="bottom" align="start" sideOffset={8} className="rounded-2xl border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-surface-light dark:bg-terminal-surface-dark p-3 shadow-[0_8px_32px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_40px_rgba(6,182,212,0.25)] w-[320px] max-w-[90vw]">
        <div className="flex items-center gap-2">
          <div className="flex flex-col flex-1 min-w-0">
            <label className="text-[11px] text-terminal-text-muted-light dark:text-terminal-text-muted-dark mb-1">开始</label>
            <input
              type="date"
              value={from || ''}
              onChange={(e) => onDateChange({ from: e.target.value || undefined, to })}
              className="w-full min-w-0 h-8 rounded-lg border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-bg-light dark:bg-terminal-bg-dark px-2 text-xs text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:ring-1 focus:ring-terminal-accent-light/40 dark:focus:ring-terminal-accent-dark/50"
              aria-label="开始日期"
              title="开始日期"
            />
          </div>
          <span className="text-terminal-text-muted-light dark:text-terminal-text-muted-dark pt-5">—</span>
          <div className="flex flex-col flex-1 min-w-0">
            <label className="text-[11px] text-terminal-text-muted-light dark:text-terminal-text-muted-dark mb-1">结束</label>
            <input
              type="date"
              value={to || ''}
              onChange={(e) => onDateChange({ from, to: e.target.value || undefined })}
              className="w-full min-w-0 h-8 rounded-lg border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-bg-light dark:bg-terminal-bg-dark px-2 text-xs text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:ring-1 focus:ring-terminal-accent-light/40 dark:focus:ring-terminal-accent-dark/50"
              aria-label="结束日期"
              title="结束日期"
            />
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => onDateChange({ from: undefined, to: undefined })}
            className="h-8 px-2 rounded-lg border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-bg-light dark:bg-terminal-bg-dark text-xs text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:border-terminal-accent-light dark:hover:border-terminal-accent-dark transition"
          >
            清空
          </button>
        </div>
        <Popover.Arrow className="fill-white dark:fill-gray-800" />
      </Popover.Content>
    </Popover.Root>
  )
}

