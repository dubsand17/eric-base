'use client'

import { useEffect, useRef, useState } from 'react'
import ThemeToggle from '@/components/ThemeToggle'
import DisplayModeToggle from '@/components/DisplayModeToggle'
import PositionBuilder from '@/components/PositionBuilder'
import * as Toolbar from '@radix-ui/react-toolbar'
import * as Popover from '@radix-ui/react-popover'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tooltip from '@radix-ui/react-tooltip'
import * as Separator from '@radix-ui/react-separator'
import { Calendar, Clock, Menu, X, Youtube, Tv, ExternalLink } from 'lucide-react'

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
  const [prices, setPrices] = useState<Record<string, { price: number; percent: number }> | null>(null)
  const prevRef = useRef<Record<string, { price: number; percent: number }> | null>(null)
  const [pulse, setPulse] = useState<Record<string, 'up' | 'down' | undefined>>({})
  const [dir, setDir] = useState<Record<string, 'up' | 'down' | 'none'>>({})

  useEffect(() => {
    setLocalQuery(query)
  }, [query])

  // Fetch crypto prices periodically from our API route
  useEffect(() => {
    let timer: number | undefined
    const load = async () => {
      try {
        const res = await fetch('/api/crypto?fresh=1', { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        const map: Record<string, { price: number; percent: number }> = {}
        for (const item of json.data as Array<{ symbol: string; price: number; percent: number }>) {
          map[item.symbol] = { price: item.price, percent: item.percent }
        }
        // Determine delta vs previous poll for color and animation
        const prev = prevRef.current
        const toPulse: Record<string, 'up' | 'down'> = {}
        const toDir: Record<string, 'up' | 'down' | 'none'> = {}
        for (const s of Object.keys(map)) {
          const oldP = prev?.[s]?.price
          const newP = map[s]?.price
          if (typeof oldP === 'number' && typeof newP === 'number') {
            if (newP > oldP) { toPulse[s] = 'up'; toDir[s] = 'up' }
            else if (newP < oldP) { toPulse[s] = 'down'; toDir[s] = 'down' }
            else { toDir[s] = 'none' }
          } else {
            toDir[s] = 'none'
          }
        }

        // trigger pulse only when changed
        if (Object.keys(toPulse).length) {
          setPulse((p) => ({ ...p, ...toPulse }))
          window.setTimeout(() => {
            setPulse((p) => {
              const next = { ...p }
              for (const s of Object.keys(toPulse)) next[s] = undefined
              return next
            })
          }, 1200)
        }

        setDir(toDir)
        setPrices(map)
        prevRef.current = map
      } catch (e) {
        // keep last successful
        console.warn('Fetch /api/crypto failed:', e)
      }
    }
    load()
    timer = window.setInterval(load, 5000)
    return () => { if (timer) window.clearInterval(timer) }
  }, [])

  const fmtPrice = (n?: number) => {
    if (typeof n !== 'number' || isNaN(n)) return '—'
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n)
  }
  const fmtPct = (n?: number) => {
    if (typeof n !== 'number' || isNaN(n)) return '—'
    const sign = n > 0 ? '+' : ''
    return `${sign}${n.toFixed(2)}%`
  }
  const fmtCompact = (n?: number) => {
    if (typeof n !== 'number' || isNaN(n)) return '—'
    return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
  }

  // Basic Linear-like top bar with Radix Toolbar
  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="sticky top-2 sm:top-3 z-40 bg-transparent">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Glass container */}
          <div className="relative mx-auto rounded-2xl border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-surface-light dark:bg-terminal-surface-dark shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_24px_rgba(6,182,212,0.2)] py-2">
            {/* Gentle vertical sheen */}
            <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-terminal-accent-light/30 dark:via-terminal-accent-dark/40 to-transparent" />
            <Toolbar.Root className="relative h-12 flex items-center gap-3 px-3" aria-label="主工具栏">
            {/* Mobile menu button (only on small screens) -> opens side drawer */}
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button
                  className="sm:hidden h-9 w-9 rounded-lg border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-bg-light dark:bg-terminal-bg-dark text-terminal-text-primary-light dark:text-terminal-text-primary-dark flex items-center justify-center hover:border-terminal-accent-light dark:hover:border-terminal-accent-dark transition"
                  aria-label="打开菜单"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out" />
                <Dialog.Content className="fixed inset-x-0 bottom-0 max-h-[80vh] w-full border-t-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-surface-light dark:bg-terminal-surface-dark shadow-[0_-8px_32px_rgba(0,0,0,0.2)] dark:shadow-[0_-8px_40px_rgba(6,182,212,0.2)] rounded-t-2xl data-[state=open]:animate-in data-[state=closed]:animate-out flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between px-4 pt-3 pb-2">
                    <div className="absolute left-1/2 -translate-x-1/2 top-1.5 h-1.5 w-10 rounded-full bg-terminal-accent-light/30 dark:bg-terminal-accent-dark/40" />
                    <a
                      href="https://x.com/CycleStudies"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                      aria-label="前往 CycleStudies 的 X 主页"
                    >
                      <img src="/icon.svg" alt="logo" className="h-5 w-5" />
                      <span className="text-sm font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark">快速设置</span>
                    </a>
                    <Dialog.Close asChild>
                      <button aria-label="关闭" className="h-8 w-8 rounded-lg border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-bg-light dark:bg-terminal-bg-dark flex items-center justify-center text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:border-terminal-accent-light dark:hover:border-terminal-accent-dark transition">
                        <X className="w-4 h-4" />
                      </button>
                    </Dialog.Close>
                  </div>
                  <div className="h-full flex flex-col overflow-hidden px-4">
                    <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                      {/* 品牌与主页 */}
                      <div className="rounded-xl border-2 border-terminal-border-light dark:border-terminal-border-dark p-3">
                        <div className="flex items-center gap-3">
                          <img src="https://pbs.twimg.com/profile_images/1982606819244605440/2IYiLUQI_400x400.jpg" alt="品牌" className="h-6 w-6 rounded" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark truncate">百萬 Eric | Day Trader</div>
                            <div className="text-xs text-terminal-text-secondary-light dark:text-terminal-text-secondary-dark truncate">美股自营基金日内交易员 | 纽约大学数据科学 | 极限运动 | Proprietary Day Trader | NYU Data Science | X Sports</div>
                          </div>
                          <a
                            href="https://x.com/CycleStudies"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 h-8 px-2 rounded-lg border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-surface-light dark:bg-terminal-surface-dark text-xs text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:border-terminal-accent-light dark:hover:border-terminal-accent-dark"
                          >
                            访问 X 主页 <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      {/* 社交链接 */}
                      <div className="rounded-xl border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-bg-light dark:bg-terminal-bg-dark p-3">
                        <div className="mb-2 text-xs font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark">关注频道</div>
                        <div className="flex items-center gap-2">
                          <a
                            href="https://space.bilibili.com/40257375"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-2 h-9 rounded-lg border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-surface-light dark:bg-terminal-surface-dark text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:border-terminal-accent-light dark:hover:border-terminal-accent-dark"
                            aria-label="Bilibili 空间"
                          >
                            <Tv className="w-4 h-4" />
                            <span className="text-xs sm:text-[13px]">Bilibili</span>
                          </a>
                          <a
                            href="https://www.youtube.com/channel/UC0h5WHVgdGyBk5cbB8XiUxw"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-2 h-9 rounded-lg border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-surface-light dark:bg-terminal-surface-dark text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:border-terminal-accent-light dark:hover:border-terminal-accent-dark"
                            aria-label="YouTube 频道"
                          >
                            <Youtube className="w-5 h-5" />
                            <span className="text-xs sm:text-[13px]">YouTube</span>
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="sticky bottom-0 px-1 pb-4 pt-3" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 14px)' }}>
                      <div className="rounded-xl border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-bg-light dark:bg-terminal-bg-dark p-3 space-y-3">
                        {/* 时间格式 */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark">时间格式</span>
                          <div className="inline-flex rounded-xl border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-surface-light dark:bg-terminal-surface-dark overflow-hidden">
                            <button
                              className={`px-3 h-8 text-xs transition ${!showAbsoluteTime ? 'bg-terminal-accent-light dark:bg-terminal-accent-dark text-white' : 'bg-transparent text-terminal-text-primary-light dark:text-terminal-text-primary-dark'}`}
                              aria-pressed={!showAbsoluteTime}
                              onClick={() => { if (showAbsoluteTime) onToggleTimeFormat?.() }}
                            >相对时间</button>
                            <button
                              className={`px-3 h-8 text-xs transition ${showAbsoluteTime ? 'bg-terminal-accent-light dark:bg-terminal-accent-dark text-white' : 'bg-transparent text-terminal-text-primary-light dark:text-terminal-text-primary-dark'}`}
                              aria-pressed={showAbsoluteTime}
                              onClick={() => { if (!showAbsoluteTime) onToggleTimeFormat?.() }}
                            >绝对时间</button>
                          </div>
                        </div>
                        {/* 显示模式 */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark">显示模式</span>
                          <DisplayModeToggle />
                        </div>
                        {/* 主题 */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark">主题</span>
                          <ThemeToggle />
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>

            {/* Simplified logo for md-lg screens */}
            <a
              href="https://x.com/CycleStudies"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex xl:hidden items-center"
              aria-label="前往 CycleStudies 的 X 主页"
            >
              <img src="/icon.svg" alt="logo" className="h-6 w-6" />
            </a>

            {/* Brand (only show from xl and up to save space) */}
            <div className="hidden xl:flex items-center gap-3 mr-2">
              <a
                href="https://x.com/CycleStudies"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
                aria-label="前往 CycleStudies 的 X 主页"
              >
                <img src="/icon.svg" alt="logo" className="h-6 w-6" />
                <span className="text-sm font-medium leading-none text-terminal-text-primary-light dark:text-terminal-text-primary-dark">百万Eric</span>
              </a>
              {/* Social icons next to brand */}
              <div className="flex items-center gap-1">
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <a
                      href="https://space.bilibili.com/40257375"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 w-8 rounded-lg border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-surface-light dark:bg-terminal-surface-dark text-terminal-text-primary-light dark:text-terminal-text-primary-dark flex items-center justify-center hover:border-terminal-accent-light dark:hover:border-terminal-accent-dark transition"
                      aria-label="前往 Bilibili 空间"
                      title="Bilibili"
                    >
                      <Tv className="w-4 h-4" />
                    </a>
                  </Tooltip.Trigger>
                  <Tooltip.Content sideOffset={8} className="rounded-md border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-surface-light dark:bg-terminal-surface-dark px-2 py-1 text-xs text-terminal-text-primary-light dark:text-terminal-text-primary-dark shadow-lg">
                    Bilibili
                    <Tooltip.Arrow className="fill-terminal-surface-light dark:fill-terminal-surface-dark" />
                  </Tooltip.Content>
                </Tooltip.Root>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <a
                      href="https://www.youtube.com/channel/UC0h5WHVgdGyBk5cbB8XiUxw"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 w-8 rounded-lg border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-surface-light dark:bg-terminal-surface-dark text-terminal-text-primary-light dark:text-terminal-text-primary-dark flex items-center justify-center hover:border-terminal-accent-light dark:hover:border-terminal-accent-dark transition"
                      aria-label="前往 YouTube 频道"
                      title="YouTube"
                    >
                      <Youtube className="w-5 h-5" />
                    </a>
                  </Tooltip.Trigger>
                  <Tooltip.Content sideOffset={8} className="rounded-md border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-surface-light dark:bg-terminal-surface-dark px-2 py-1 text-xs text-terminal-text-primary-light dark:text-terminal-text-primary-dark shadow-lg">
                    YouTube
                    <Tooltip.Arrow className="fill-terminal-surface-light dark:fill-terminal-surface-dark" />
                  </Tooltip.Content>
                </Tooltip.Root>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 min-w-0 sm:flex-none">
              <div className="relative w-full sm:w-[200px] md:w-[280px] lg:w-[320px]">
                <input
                  value={localQuery}
                  onChange={(e) => {
                    setLocalQuery(e.target.value)
                    onQueryChange?.(e.target.value)
                  }}
                  className="h-9 w-full pl-10 pr-9 rounded-xl border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-surface-light dark:bg-terminal-surface-dark text-sm placeholder-terminal-text-muted-light dark:placeholder-terminal-text-muted-dark text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:ring-2 focus:ring-terminal-accent-light/40 dark:focus:ring-terminal-accent-dark/50 focus:border-terminal-accent-light dark:focus:border-terminal-accent-dark"
                  placeholder="搜索内容关键词..."
                />
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-terminal-text-muted-light dark:text-terminal-text-muted-dark">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 104.238 12.016l3.748 3.748a.75.75 0 101.06-1.06l-3.748-3.748A6.75 6.75 0 0010.5 3.75zm-5.25 6.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Date range in Popover */}
            <Popover.Root>
              <Popover.Trigger asChild>
                <button
                  className="h-9 w-auto whitespace-nowrap px-3 rounded-xl border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-surface-light dark:bg-terminal-surface-dark text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:border-terminal-accent-light dark:hover:border-terminal-accent-dark flex items-center gap-2  sm:mr-0 transition"
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

            {/* Position Builder */}
            <PositionBuilder />

            {/* Spacer to push crypto and toggles to the right (hidden on mobile) */}
            <div className="hidden sm:block flex-1" />

            {/* Crypto tickers (right side) - full list only on xl and up */}
            <div className="hidden xl:flex items-center gap-2">
              {['BTCUSDT','ETHUSDT','SOLUSDT'].map((s) => {
                const alias = s.replace('USDT','')
                const item = prices?.[s]
                const d = dir[s] || 'none'
                const color = d === 'up' ? 'text-terminal-up dark:text-terminal-up-dark' : d === 'down' ? 'text-terminal-down' : 'text-terminal-text-muted-light dark:text-terminal-text-muted-dark'
                const p = item?.percent
                const percentColor = (typeof p === 'number' && !isNaN(p)) ? (p > 0 ? 'text-terminal-up dark:text-terminal-up-dark' : p < 0 ? 'text-terminal-down' : 'text-terminal-text-muted-light dark:text-terminal-text-muted-dark') : 'text-terminal-text-muted-light dark:text-terminal-text-muted-dark'
                return (
                  <div key={s} className={`flex items-center gap-1 h-7 px-2 rounded-xl border border-terminal-border-light/30 dark:border-terminal-border-dark bg-terminal-surface-light/40 dark:bg-terminal-surface-dark/40 backdrop-blur-md text-xs text-terminal-text-primary-light dark:text-terminal-text-primary-dark`}>
                    <span className="font-medium">{alias}</span>
                    <span className={`tabular-nums ${color}`}>{fmtPrice(item?.price)}</span>
                    <span className={`tabular-nums ${percentColor}`}>{fmtPct(item?.percent)}</span>
                  </div>
                )
              })}
            </div>

            {/* Single BTC ticker for md–lg only (price only, no percent) */}
            <div className="hidden md:flex xl:hidden items-center gap-2">
              {(() => {
                const s = 'BTCUSDT'
                const alias = 'BTC'
                const item = prices?.[s]
                const d = dir[s] || 'none'
                const color = d === 'up' ? 'text-terminal-up dark:text-terminal-up-dark' : d === 'down' ? 'text-terminal-down' : 'text-terminal-text-muted-light dark:text-terminal-text-muted-dark'
                const p = item?.percent
                const percentColor = (typeof p === 'number' && !isNaN(p)) ? (p > 0 ? 'text-terminal-up dark:text-terminal-up-dark' : p < 0 ? 'text-terminal-down' : 'text-terminal-text-muted-light dark:text-terminal-text-muted-dark') : 'text-terminal-text-muted-light dark:text-terminal-text-muted-dark'
                return (
                  <div className={`flex items-center gap-1 h-7 px-2 rounded-xl border border-terminal-border-light/30 dark:border-terminal-border-dark bg-terminal-surface-light/40 dark:bg-terminal-surface-dark/40 backdrop-blur-md text-xs text-terminal-text-primary-light dark:text-terminal-text-primary-dark`}>
                    <span className="font-medium">{alias}</span>
                    <span className={`tabular-nums ${color}`}>{fmtPrice(item?.price)}</span>
                  </div>
                )
              })()}
            </div>

            {/* Mobile compressed tickers - keep hidden on small screens */}
            <div className="hidden sm:hidden">
              {['BTCUSDT','ETHUSDT','SOLUSDT'].map((s) => {
                const alias = s.replace('USDT','')
                const item = prices?.[s]
                const d = dir[s] || 'none'
                const color = d === 'up' ? 'text-emerald-600' : d === 'down' ? 'text-rose-600' : 'text-gray-500'
                const p = item?.percent
                const percentColor = (typeof p === 'number' && !isNaN(p)) ? (p > 0 ? 'text-emerald-600' : p < 0 ? 'text-rose-600' : 'text-gray-500') : 'text-gray-500'
                return (
                  <div key={s} className={`flex items-center gap-1 h-6 px-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-white/15 dark:bg-white/5 backdrop-blur-md text-[10px] text-gray-800 dark:text-gray-100`}>
                    <span className="font-medium">{alias}</span>
                    <span className={`tabular-nums ${color}`}>{fmtCompact(item?.price)}</span>
                    <span className={`tabular-nums ${percentColor}`}>{(() => { const p = item?.percent; return (typeof p !== 'number' || isNaN(p)) ? '—' : (p > 0 ? '▲' : p < 0 ? '▼' : '·') })()}</span>
                  </div>
                )
              })}
            </div>

            {/* Toggles - hidden on small screens */}
            <div className="hidden sm:flex items-center gap-2">
              {/* Time format toggle */}
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={() => onToggleTimeFormat?.()}
                    aria-pressed={showAbsoluteTime}
                    className={`h-9 w-9 rounded-lg border-2 flex items-center justify-center transition ${
                    showAbsoluteTime
                      ? 'border-terminal-accent-light dark:border-terminal-accent-dark bg-terminal-surface-light dark:bg-terminal-surface-dark text-terminal-accent-light dark:text-terminal-accent-dark hover:shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : 'border-terminal-border-light dark:border-terminal-border-dark bg-terminal-surface-light dark:bg-terminal-surface-dark text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:border-terminal-accent-light dark:hover:border-terminal-accent-dark'
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
                <Tooltip.Content sideOffset={8} className="rounded-md border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-surface-light dark:bg-terminal-surface-dark px-2 py-1 text-xs text-terminal-text-primary-light dark:text-terminal-text-primary-dark shadow-lg">
                  切换时间显示
                  <Tooltip.Arrow className="fill-terminal-surface-light dark:fill-terminal-surface-dark" />
                </Tooltip.Content>
              </Tooltip.Root>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <div>
                    <DisplayModeToggle />
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Content sideOffset={8} className="rounded-md border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-surface-light dark:bg-terminal-surface-dark px-2 py-1 text-xs text-terminal-text-primary-light dark:text-terminal-text-primary-dark shadow-lg">
                  切换显示模式
                  <Tooltip.Arrow className="fill-terminal-surface-light dark:fill-terminal-surface-dark" />
                </Tooltip.Content>
              </Tooltip.Root>

              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <div>
                    <ThemeToggle />
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Content sideOffset={8} className="rounded-md border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-surface-light dark:bg-terminal-surface-dark px-2 py-1 text-xs text-terminal-text-primary-light dark:text-terminal-text-primary-dark shadow-lg">
                  切换主题
                  <Tooltip.Arrow className="fill-terminal-surface-light dark:fill-terminal-surface-dark" />
                </Tooltip.Content>
              </Tooltip.Root>
            </div>
            </Toolbar.Root>
          </div>
        </div>
      </div>
    </Tooltip.Provider>
  )
}
