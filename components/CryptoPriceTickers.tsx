'use client'

import { useState, useEffect, useRef } from 'react'

interface CryptoPriceTickersProps {
  prices: Record<string, { price: number; percent: number }> | null
  dir: Record<string, 'up' | 'down' | 'none'>
  onSymbolClick?: (symbol: string) => void
  variant?: 'full' | 'single' | 'mobile'
}

export default function CryptoPriceTickers({ prices, dir, onSymbolClick, variant = 'full' }: CryptoPriceTickersProps) {
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

  const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT']

  if (variant === 'single') {
    const s = 'BTCUSDT'
    const alias = 'BTC'
    const item = prices?.[s]
    const d = dir[s] || 'none'
    const color = d === 'up' ? 'text-terminal-success-light dark:text-terminal-success-dark' : d === 'down' ? 'text-terminal-error-light dark:text-terminal-error-dark' : 'text-terminal-text-muted-light dark:text-terminal-text-muted-dark'

    return (
      <div
        className={`flex items-center gap-1 h-7 px-2 rounded-xl border border-terminal-border-light dark:border-terminal-border-dark glass-light dark:glass-dark text-xs text-terminal-text-primary-light dark:text-terminal-text-primary-dark ${onSymbolClick ? 'cursor-pointer hover:border-terminal-borderHover-light dark:hover:border-terminal-borderHover-dark hover:shadow-soft transition-all-gentle active:scale-95' : ''}`}
        onClick={() => onSymbolClick?.(s)}
      >
        <span className="font-medium">{alias}</span>
        <span className={`tabular-nums ${color} transition-colors-gentle`}>{fmtPrice(item?.price)}</span>
      </div>
    )
  }

  if (variant === 'mobile') {
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % symbols.length)
      }, 3000) // Rotate every 3 seconds

      return () => clearInterval(timer)
    }, [])

    const s = symbols[currentIndex]
    const alias = s.replace('USDT', '')
    const item = prices?.[s]
    const d = dir[s] || 'none'
    const color = d === 'up' ? 'text-terminal-success-light dark:text-terminal-success-dark' : d === 'down' ? 'text-terminal-error-light dark:text-terminal-error-dark' : 'text-terminal-text-muted-light dark:text-terminal-text-muted-dark'

    return (
      <div
        className={`flex items-center gap-1.5 h-7 px-2.5 rounded-xl border border-terminal-border-light dark:border-terminal-border-dark bg-white dark:bg-[#16181d] text-xs text-terminal-text-primary-light dark:text-terminal-text-primary-dark ${onSymbolClick ? 'cursor-pointer hover:border-terminal-borderHover-light dark:hover:border-terminal-borderHover-dark hover:shadow-soft transition-all-gentle active:scale-95' : ''}`}
        onClick={() => onSymbolClick?.(s)}
      >
        <span className="font-medium">{alias}</span>
        <span className={`tabular-nums ${color} transition-colors-gentle`}>{fmtPrice(item?.price)}</span>
      </div>
    )
  }

  // Full variant
  return (
    <div className="hidden xl:flex items-center gap-2">
      {symbols.map((s) => {
        const alias = s.replace('USDT', '')
        const item = prices?.[s]
        const d = dir[s] || 'none'
        const color = d === 'up' ? 'text-terminal-success-light dark:text-terminal-success-dark' : d === 'down' ? 'text-terminal-error-light dark:text-terminal-error-dark' : 'text-terminal-text-muted-light dark:text-terminal-text-muted-dark'
        const p = item?.percent
        const percentColor = (typeof p === 'number' && !isNaN(p)) ? (p > 0 ? 'text-terminal-success-light dark:text-terminal-success-dark' : p < 0 ? 'text-terminal-error-light dark:text-terminal-error-dark' : 'text-terminal-text-muted-light dark:text-terminal-text-muted-dark') : 'text-terminal-text-muted-light dark:text-terminal-text-muted-dark'
        return (
          <div
            key={s}
            className={`flex items-center gap-1 h-7 px-2 rounded-xl border border-terminal-border-light dark:border-terminal-border-dark glass-light dark:glass-dark text-xs text-terminal-text-primary-light dark:text-terminal-text-primary-dark ${onSymbolClick ? 'cursor-pointer hover:border-terminal-borderHover-light dark:hover:border-terminal-borderHover-dark hover:shadow-soft transition-all-gentle active:scale-95' : ''}`}
            onClick={() => onSymbolClick?.(s)}
          >
            <span className="font-medium">{alias}</span>
            <span className={`tabular-nums ${color} transition-colors-gentle`}>{fmtPrice(item?.price)}</span>
            <span className={`tabular-nums ${percentColor} transition-colors-gentle`}>{fmtPct(item?.percent)}</span>
          </div>
        )
      })}
    </div>
  )
}

