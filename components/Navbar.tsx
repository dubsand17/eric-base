'use client'

import { useEffect, useState } from 'react'
import ThemeToggle from '@/components/ThemeToggle'
import DisplayModeToggle from '@/components/DisplayModeToggle'
import * as Toolbar from '@radix-ui/react-toolbar'
import * as Popover from '@radix-ui/react-popover'
import * as Tooltip from '@radix-ui/react-tooltip'
import * as Separator from '@radix-ui/react-separator'
import { Calendar, Clock } from 'lucide-react'

interface NavbarProps {
  query: string
  onQueryChange: (v: string) => void
  from?: string
  to?: string
  onDateChange: (next: { from?: string; to?: string }) => void
  showAbsoluteTime?: boolean
  onToggleTimeFormat?: () => void
}

export default function Navbar({ query, onQueryChange, from, to, onDateChange, showAbsoluteTime = false, onToggleTimeFormat }: NavbarProps) {
  const [localQuery, setLocalQuery] = useState(query)

  useEffect(() => {
    setLocalQuery(query)
  }, [query])

  // Basic Linear-like top bar with Radix Toolbar
  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/70 dark:border-gray-800/70">
        <div className="px-4 sm:px-6 lg:px-8">
          <Toolbar.Root className="h-12 flex items-center gap-3" aria-label="主工具栏">
            {/* Brand */}
            <div className="flex items-center gap-2 mr-2">
              <img src="/icon.svg" alt="logo" className="h-6 w-6" />
              <span className="text-sm font-medium leading-none text-gray-800 dark:text-gray-100">百万Eric</span>
            </div>

            {/* Search */}
            <div>
              <div className="relative w-[260px] sm:w-[340px] md:w-[420px] lg:w-[480px]">
                <input
                  value={localQuery}
                  onChange={(e) => {
                    setLocalQuery(e.target.value)
                    onQueryChange(e.target.value)
                  }}
                  placeholder="搜索内容关键词..."
                  className="w-full h-9 rounded-md border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 px-3 pr-10 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 104.238 12.016l3.748 3.748a.75.75 0 101.06-1.06l-3.748-3.748A6.75 6.75 0 0010.5 3.75zm-5.25 6.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Date range in Popover */}
            <Popover.Root>
              <Popover.Trigger asChild>
                <button className="h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700">
                  日期筛选
                </button>
              </Popover.Trigger>
              <Popover.Content side="bottom" align="start" sideOffset={8} className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 shadow-lg w-[320px] max-w-[90vw]">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col flex-1 min-w-0">
                    <label className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">开始</label>
                    <input
                      type="date"
                      value={from || ''}
                      onChange={(e) => onDateChange({ from: e.target.value || undefined, to })}
                      className="w-full min-w-0 h-8 rounded-md border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 px-2 text-xs text-gray-900 dark:text-gray-100 focus:outline-none"
                      aria-label="开始日期"
                      title="开始日期"
                    />
                  </div>
                  <span className="text-gray-400 pt-5">—</span>
                  <div className="flex flex-col flex-1 min-w-0">
                    <label className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">结束</label>
                    <input
                      type="date"
                      value={to || ''}
                      onChange={(e) => onDateChange({ from, to: e.target.value || undefined })}
                      className="w-full min-w-0 h-8 rounded-md border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 px-2 text-xs text-gray-900 dark:text-gray-100 focus:outline-none"
                      aria-label="结束日期"
                      title="结束日期"
                    />
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => onDateChange({ from: undefined, to: undefined })}
                    className="h-8 px-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    重置
                  </button>
                </div>
                <Popover.Arrow className="fill-white dark:fill-gray-800" />
              </Popover.Content>
            </Popover.Root>

            {/* Toggles */}
            <div className="flex items-center gap-2 ml-2">
              {/* Time format toggle */}
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={() => onToggleTimeFormat?.()}
                    aria-pressed={showAbsoluteTime}
                    className={`h-9 w-9 rounded-full border flex items-center justify-center transition-colors ${
                      showAbsoluteTime
                        ? 'border-violet-500/60 bg-violet-500/10 text-violet-600 dark:text-violet-300'
                        : 'border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    title="切换时间显示"
                  >
                    {showAbsoluteTime ? (
                      <Calendar className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Content sideOffset={8} className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-xs text-gray-700 dark:text-gray-200 shadow">
                  切换时间显示
                  <Tooltip.Arrow className="fill-white dark:fill-gray-800" />
                </Tooltip.Content>
              </Tooltip.Root>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <div>
                    <DisplayModeToggle />
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Content sideOffset={8} className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-xs text-gray-700 dark:text-gray-200 shadow">
                  切换显示模式
                  <Tooltip.Arrow className="fill-white dark:fill-gray-800" />
                </Tooltip.Content>
              </Tooltip.Root>

              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <div>
                    <ThemeToggle />
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Content sideOffset={8} className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-xs text-gray-700 dark:text-gray-200 shadow">
                  切换主题
                  <Tooltip.Arrow className="fill-white dark:fill-gray-800" />
                </Tooltip.Content>
              </Tooltip.Root>
            </div>
          </Toolbar.Root>
        </div>
      </div>
    </Tooltip.Provider>
  )
}
