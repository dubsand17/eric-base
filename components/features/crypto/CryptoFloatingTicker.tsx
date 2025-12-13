'use client'

import { useState, useEffect } from 'react'

interface CryptoFloatingTickerProps {
    prices: Record<string, { price: number; percent: number }> | null
    dir: Record<string, 'up' | 'down' | 'none'>
    onSymbolClick?: (symbol: string) => void
}

export default function CryptoFloatingTicker({ prices, dir, onSymbolClick }: CryptoFloatingTickerProps) {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT']
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        const timer = setInterval(() => {
            setIsAnimating(true)
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % symbols.length)
                setIsAnimating(false)
            }, 300) // Animation duration
        }, 6000) // 6 seconds between rotations

        return () => clearInterval(timer)
    }, [])

    const fmtPrice = (n?: number) => {
        if (typeof n !== 'number' || isNaN(n)) return '—'
        return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n)
    }

    const s = symbols[currentIndex]
    const alias = s.replace('USDT', '')
    const item = prices?.[s]
    const d = dir[s] || 'none'
    const color = d === 'up'
        ? 'text-terminal-success-light dark:text-terminal-success-dark'
        : d === 'down'
            ? 'text-terminal-error-light dark:text-terminal-error-dark'
            : 'text-terminal-text-muted-light dark:text-terminal-text-muted-dark'

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 hidden sm:block">
            <div
                className={`relative flex items-center gap-2 h-12 px-4 rounded-lg bg-black/90 border border-orange-500/30 shadow-[0_0_20px_rgba(251,146,60,0.3)] backdrop-blur-sm overflow-hidden ${onSymbolClick ? 'cursor-pointer hover:shadow-[0_0_30px_rgba(251,146,60,0.5)] transition-all-gentle active:scale-95' : ''
                    }`}
                onClick={() => onSymbolClick?.(s)}
            >
                {/* Nixie tube glow effect background */}
                <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />

                <div className={`relative flex items-center gap-2 transition-all duration-300 ${isAnimating ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'
                    }`}>
                    <span className="font-mono text-base font-bold text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]">
                        {alias}
                    </span>
                    <span className="font-mono text-base font-bold tabular-nums text-orange-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.6)] transition-opacity-gentle">
                        ${fmtPrice(item?.price)}
                    </span>
                </div>
            </div>
        </div>
    )
}
