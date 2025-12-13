'use client'

import { useEffect, useRef, useState } from 'react'
import ThemeToggle from '@/components/ThemeToggle'
import DisplayModeToggle from '@/components/DisplayModeToggle'
import PositionBuilder from '@/components/PositionBuilder'
import CryptoPriceTickers from '@/components/CryptoPriceTickers'
import SearchBar from '@/components/SearchBar'
import DateFilter from '@/components/DateFilter'
import MobileMenu from '@/components/MobileMenu'
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

  // Fetch crypto prices periodically
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
        console.warn('Fetch /api/crypto failed:', e)
      }
    }
    load()
    timer = window.setInterval(load, 5000)
    return () => { if (timer) window.clearInterval(timer) }
  }, [])

  return (
    <div className="sticky top-2 sm:top-3 z-40 bg-transparent">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto rounded-2xl border border-terminal-border-light dark:border-terminal-border-dark glass-light dark:glass-dark shadow-soft-md py-2.5 px-3 animate-fade-in-up">
          <div className="flex items-center justify-between gap-3">

            {/* Mobile Menu */}
            <div className="md:hidden">
              <MobileMenu showAbsoluteTime={showAbsoluteTime} onToggleTimeFormat={onToggleTimeFormat} />
            </div>

            {/* Left Pill - Brand + Social */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl border border-terminal-border-light dark:border-terminal-border-dark bg-white dark:bg-[#16181d]">
              <a
                href="https://x.com/CycleStudies"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
                title="CycleStudies"
              >
                <ChartLine className="h-5 w-5 text-terminal-accent-light dark:text-terminal-accent-dark flex-shrink-0" weight="duotone" />
                <span className="hidden xl:block text-sm font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark whitespace-nowrap">百万Eric</span>
              </a>
              <div className="hidden lg:flex items-center gap-1 ml-2 pl-2 border-l border-terminal-border-light dark:border-terminal-border-dark">
                <a
                  href="https://space.bilibili.com/40257375"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:bg-terminal-state-hover-light dark:hover:bg-terminal-state-hover-dark transition-all-gentle active:scale-95"
                  title="Bilibili"
                >
                  <VideoCamera className="w-4 h-4" weight="duotone" />
                </a>
                <a
                  href="https://www.youtube.com/channel/UC0h5WHVgdGyBk5cbB8XiUxw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:bg-terminal-state-hover-light dark:hover:bg-terminal-state-hover-dark transition-all-gentle active:scale-95"
                  title="YouTube"
                >
                  <Play className="w-4 h-4" weight="duotone" />
                </a>
              </div>
            </div>

            {/* Center - Crypto Ticker + Search */}
            <div className="flex-1 flex items-center gap-2">
              {/* Rotating Crypto Ticker */}
              <div className="hidden sm:block">
                <CryptoPriceTickers prices={prices} dir={dir} onSymbolClick={onSymbolClick} variant="mobile" />
              </div>

              {/* Date Filter */}
              <DateFilter from={from} to={to} onDateChange={onDateChange} />

              {/* Search Bar */}
              <div className="flex-1">
                <SearchBar query={query} onQueryChange={onQueryChange} />
              </div>
            </div>

            {/* Right Pill - Tools */}
            <div className="hidden md:flex items-center gap-1 px-2 py-2 rounded-xl border border-terminal-border-light dark:border-terminal-border-dark bg-white dark:bg-[#16181d]">
              {/* Theme Toggle */}
              <ThemeToggle className="h-9 w-9" />

              {/* Display Mode Toggle */}
              <DisplayModeToggle className="h-9 w-9" />

              {/* Time Format Toggle */}
              <button
                onClick={() => onToggleTimeFormat?.()}
                aria-pressed={showAbsoluteTime}
                className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all-gentle active:scale-95 ${showAbsoluteTime
                    ? 'bg-terminal-accent-muted-light dark:bg-terminal-accent-muted-dark text-terminal-accent-light dark:text-terminal-accent-dark'
                    : 'text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:bg-terminal-state-hover-light dark:hover:bg-terminal-state-hover-dark'
                  }`}
                title="切换时间显示"
              >
                <div className="relative w-5 h-5 flex items-center justify-center">
                  {/* Relative time icon */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${showAbsoluteTime
                        ? 'opacity-0 rotate-180 scale-50'
                        : 'opacity-100 rotate-0 scale-100'
                      }`}
                  >
                    <Timer className="w-5 h-5" weight="duotone" />
                  </div>
                  {/* Absolute time icon */}
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

              {/* Position Builder */}
              <div className="ml-1 pl-1 border-l border-terminal-border-light dark:border-terminal-border-dark">
                <PositionBuilder />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
