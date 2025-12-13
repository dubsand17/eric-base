'use client'

import { useEffect, useRef, useState } from 'react'
import ThemeToggle from '@/components/ThemeToggle'
import DisplayModeToggle from '@/components/DisplayModeToggle'
import PositionBuilder from '@/components/PositionBuilder'
import CryptoPriceTickers from '@/components/CryptoPriceTickers'
import SearchBar from '@/components/SearchBar'
import DateFilter from '@/components/DateFilter'
import MobileMenu from '@/components/MobileMenu'
import * as Toolbar from '@radix-ui/react-toolbar'
import * as Tooltip from '@radix-ui/react-tooltip'
import { Timer, Calendar, VideoCamera, Play, ChartLine } from 'phosphor-react'

interface NavbarProps {
  query: string
  onQueryChange: (v: string) => void
  from?: string
  to?: string
  onDateChange: (next: { from?: string; to?: string }) => void
  showAbsoluteTime?: boolean
  onToggleTimeFormat?: () => void
  onSymbolClick?: (symbol: string) => void
}

export default function Navbar({
  query,
  onQueryChange,
  from,
  to,
  onDateChange,
  showAbsoluteTime = false,
  onToggleTimeFormat,
  onSymbolClick
}: NavbarProps) {
  const [prices, setPrices] = useState<Record<string, { price: number; percent: number }> | null>(null)
  const prevRef = useRef<Record<string, { price: number; percent: number }> | null>(null)
  const [pulse, setPulse] = useState<Record<string, 'up' | 'down' | undefined>>({})
  const [dir, setDir] = useState<Record<string, 'up' | 'down' | 'none'>>({})

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

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="sticky top-2 sm:top-3 z-40 bg-transparent">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Glass container */}
          <div className="relative mx-auto rounded-2xl border border-terminal-border-light dark:border-terminal-border-dark glass-light dark:glass-dark shadow-soft-md py-2 animate-fade-in-up">
            <Toolbar.Root className="relative h-12 flex items-center gap-3 px-3" aria-label="主工具栏">
              {/* Mobile menu */}
              <MobileMenu showAbsoluteTime={showAbsoluteTime} onToggleTimeFormat={onToggleTimeFormat} />

              {/* Simplified logo for md-lg screens */}
              <a
                href="https://x.com/CycleStudies"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex xl:hidden items-center"
                aria-label="前往 CycleStudies 的 X 主页"
              >
                <ChartLine className="h-6 w-6 text-terminal-accent-light dark:text-terminal-accent-dark" weight="duotone" />
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
                  <ChartLine className="h-6 w-6 text-terminal-accent-light dark:text-terminal-accent-dark" weight="duotone" />
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
                        className="h-8 w-8 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark glass-light dark:glass-dark text-terminal-text-primary-light dark:text-terminal-text-primary-dark flex items-center justify-center hover:border-terminal-borderHover-light dark:hover:border-terminal-borderHover-dark hover:shadow-soft transition-all-gentle active:scale-95"
                        aria-label="前往 Bilibili 空间"
                        title="Bilibili"
                      >
                        <VideoCamera className="w-5 h-5" weight="duotone" />
                      </a>
                    </Tooltip.Trigger>
                    <Tooltip.Content sideOffset={8} className="rounded-lg border border-terminal-border-light dark:border-terminal-border-dark glass-light dark:glass-dark px-2 py-1 text-xs text-terminal-text-primary-light dark:text-terminal-text-primary-dark shadow-lg">
                      Bilibili
                      <Tooltip.Arrow className="fill-white dark:fill-[#161b22]" />
                    </Tooltip.Content>
                  </Tooltip.Root>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <a
                        href="https://www.youtube.com/channel/UC0h5WHVgdGyBk5cbB8XiUxw"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 w-8 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark glass-light dark:glass-dark text-terminal-text-primary-light dark:text-terminal-text-primary-dark flex items-center justify-center hover:border-terminal-borderHover-light dark:hover:border-terminal-borderHover-dark hover:shadow-soft transition-all-gentle active:scale-95"
                        aria-label="前往 YouTube 频道"
                        title="YouTube"
                      >
                        <Play className="w-5 h-5" weight="duotone" />
                      </a>
                    </Tooltip.Trigger>
                    <Tooltip.Content sideOffset={8} className="rounded-lg border border-terminal-border-light dark:border-terminal-border-dark glass-light dark:glass-dark px-2 py-1 text-xs text-terminal-text-primary-light dark:text-terminal-text-primary-dark shadow-lg">
                      YouTube
                      <Tooltip.Arrow className="fill-white dark:fill-[#161b22]" />
                    </Tooltip.Content>
                  </Tooltip.Root>
                </div>
              </div>

              {/* Search */}
              <SearchBar query={query} onQueryChange={onQueryChange} />

              {/* Date range */}
              <DateFilter from={from} to={to} onDateChange={onDateChange} />

              {/* Position Builder */}
              <PositionBuilder />

              {/* Spacer to push crypto and toggles to the right (hidden on mobile) */}
              <div className="hidden sm:block flex-1" />

              {/* Crypto tickers - full list only on xl and up */}
              <CryptoPriceTickers
                prices={prices}
                dir={dir}
                onSymbolClick={onSymbolClick}
                variant="full"
              />

              {/* Single BTC ticker for md–lg only (hidden on xl and up, hidden on sm and below) */}
              <div className="hidden md:flex xl:hidden items-center gap-2">
                <CryptoPriceTickers
                  prices={prices}
                  dir={dir}
                  onSymbolClick={onSymbolClick}
                  variant="single"
                />
              </div>

              {/* Mobile compressed tickers - hidden on all screens (not used) */}
              <CryptoPriceTickers
                prices={prices}
                dir={dir}
                onSymbolClick={onSymbolClick}
                variant="mobile"
              />

              {/* Toggles - hidden on small screens */}
              <div className="hidden sm:flex items-center gap-2">
                {/* Time format toggle */}
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={() => onToggleTimeFormat?.()}
                      aria-pressed={showAbsoluteTime}
                      className={`h-9 w-9 rounded-lg border flex items-center justify-center transition-all-gentle glass-light dark:glass-dark active:scale-95 ${showAbsoluteTime
                        ? 'border-terminal-accent-light dark:border-terminal-accent-dark text-terminal-accent-light dark:text-terminal-accent-dark shadow-soft'
                        : 'border-terminal-border-light dark:border-terminal-border-dark text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:border-terminal-borderHover-light dark:hover:border-terminal-borderHover-dark hover:shadow-soft'
                        }`}
                      title="切换时间显示"
                    >
                      <div className="relative w-5 h-5 flex items-center justify-center">
                        {/* Relative time icon (Timer) */}
                        <div
                          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${showAbsoluteTime
                              ? 'opacity-0 rotate-180 scale-50'
                              : 'opacity-100 rotate-0 scale-100'
                            }`}
                        >
                          <Timer className="w-5 h-5" weight="duotone" />
                        </div>
                        {/* Absolute time icon (Calendar) */}
                        <div
                          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${showAbsoluteTime
                              ? 'opacity-100 rotate-0 scale-100'
                              : 'opacity-0 -rotate-180 scale-50'
                            }`}
                        >
                          <Calendar className="w-5 h-5" weight="duotone" />
                        </div>
                      </div>
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
