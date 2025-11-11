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
    const color = d === 'up' ? 'text-terminal-up dark:text-terminal-up-dark' : d === 'down' ? 'text-terminal-down' : 'text-terminal-text-muted-light dark:text-terminal-text-muted-dark'
    
    return (
      <div 
        className={`flex items-center gap-1 h-7 px-2 rounded-xl border border-terminal-border-light/30 dark:border-terminal-border-dark bg-terminal-surface-light/40 dark:bg-terminal-surface-dark/40 backdrop-blur-md text-xs text-terminal-text-primary-light dark:text-terminal-text-primary-dark ${onSymbolClick ? 'cursor-pointer hover:border-terminal-accent-light dark:hover:border-terminal-accent-dark transition-colors' : ''}`}
        onClick={() => onSymbolClick?.(s)}
      >
        <span className="font-medium">{alias}</span>
        <span className={`tabular-nums ${color}`}>{fmtPrice(item?.price)}</span>
      </div>
    )
  }

  if (variant === 'mobile') {
    return (
      <div className="hidden sm:hidden">
        {symbols.map((s) => {
          const alias = s.replace('USDT', '')
          const item = prices?.[s]
          const d = dir[s] || 'none'
          const color = d === 'up' ? 'text-emerald-600' : d === 'down' ? 'text-rose-600' : 'text-gray-500'
          const p = item?.percent
          const percentColor = (typeof p === 'number' && !isNaN(p)) ? (p > 0 ? 'text-emerald-600' : p < 0 ? 'text-rose-600' : 'text-gray-500') : 'text-gray-500'
          return (
            <div 
              key={s} 
              className={`flex items-center gap-1 h-6 px-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-white/15 dark:bg-white/5 backdrop-blur-md text-[10px] text-gray-800 dark:text-gray-100 ${onSymbolClick ? 'cursor-pointer' : ''}`}
              onClick={() => onSymbolClick?.(s)}
            >
              <span className="font-medium">{alias}</span>
              <span className={`tabular-nums ${color}`}>{fmtCompact(item?.price)}</span>
              <span className={`tabular-nums ${percentColor}`}>{(() => { const p = item?.percent; return (typeof p !== 'number' || isNaN(p)) ? '—' : (p > 0 ? '▲' : p < 0 ? '▼' : '·') })()}</span>
            </div>
          )
        })}
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
        const color = d === 'up' ? 'text-terminal-up dark:text-terminal-up-dark' : d === 'down' ? 'text-terminal-down' : 'text-terminal-text-muted-light dark:text-terminal-text-muted-dark'
        const p = item?.percent
        const percentColor = (typeof p === 'number' && !isNaN(p)) ? (p > 0 ? 'text-terminal-up dark:text-terminal-up-dark' : p < 0 ? 'text-terminal-down' : 'text-terminal-text-muted-light dark:text-terminal-text-muted-dark') : 'text-terminal-text-muted-light dark:text-terminal-text-muted-dark'
        return (
          <div 
            key={s} 
            className={`flex items-center gap-1 h-7 px-2 rounded-xl border border-terminal-border-light/30 dark:border-terminal-border-dark bg-terminal-surface-light/40 dark:bg-terminal-surface-dark/40 backdrop-blur-md text-xs text-terminal-text-primary-light dark:text-terminal-text-primary-dark ${onSymbolClick ? 'cursor-pointer hover:border-terminal-accent-light dark:hover:border-terminal-accent-dark transition-colors' : ''}`}
            onClick={() => onSymbolClick?.(s)}
          >
            <span className="font-medium">{alias}</span>
            <span className={`tabular-nums ${color}`}>{fmtPrice(item?.price)}</span>
            <span className={`tabular-nums ${percentColor}`}>{fmtPct(item?.percent)}</span>
          </div>
        )
      })}
    </div>
  )
}

