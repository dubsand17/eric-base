'use client'

import { useEffect, useMemo, useState } from 'react'
import ThemeToggle from '@/components/ThemeToggle'
import DisplayModeToggle from '@/components/DisplayModeToggle'

interface NavbarProps {
  query: string
  onQueryChange: (v: string) => void
  from?: string
  to?: string
  onDateChange: (next: { from?: string; to?: string }) => void
}

export default function Navbar({ query, onQueryChange, from, to, onDateChange }: NavbarProps) {
  const [localQuery, setLocalQuery] = useState(query)

  useEffect(() => {
    setLocalQuery(query)
  }, [query])

  // Basic Linear-like top bar with translucency and border
  return (
    <div className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/70 dark:border-gray-800/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-14 flex items-center gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2 mr-2">
            <img src="/icon.svg" alt="logo" className="h-6 w-6" />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">百万Eric</span>
          </div>

          {/* Search */}
          <div className="flex-1">
            <div className="relative max-w-xl w-full">
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

          {/* Date range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={from || ''}
              onChange={(e) => onDateChange({ from: e.target.value || undefined, to })}
              className="h-9 rounded-md border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 px-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none"
              aria-label="开始日期"
              title="开始日期"
            />
            <span className="text-gray-400">—</span>
            <input
              type="date"
              value={to || ''}
              onChange={(e) => onDateChange({ from, to: e.target.value || undefined })}
              className="h-9 rounded-md border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 px-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none"
              aria-label="结束日期"
              title="结束日期"
            />
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-2 ml-2">
            <DisplayModeToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  )
}
