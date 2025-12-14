'use client'

import { useState, useEffect } from 'react'

interface CryptoPriceTickerProps {
    prices: Record<string, { price: number; percent: number }> | null
    dir: Record<string, 'up' | 'down' | 'none'>
    onSymbolClick?: (symbol: string) => void
}

export default function CryptoPriceTicker({ prices, dir, onSymbolClick }: CryptoPriceTickerProps) {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT']
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        const timer = setInterval(() => {
            setIsAnimating(true)
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % symbols.length)
                setIsAnimating(false)
            }, 300)
        }, 6000)

        return () => clearInterval(timer)
    }, [])

    const fmtPrice = (n?: number) => {
        if (typeof n !== 'number' || isNaN(n)) return '—'
        return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n)
    }

    const s = symbols[currentIndex]
    const alias = s.replace('USDT', '')
    const item = prices?.[s]

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 hidden sm:block">
            <div
                className={`relative flex items-center gap-2 h-12 px-4 rounded-lg backdrop-blur-sm overflow-hidden transition-all-gentle
                    bg-black/90 border border-orange-500/30 shadow-[0_0_20px_rgba(251,146,60,0.3)]
                    dark:bg-black/98 dark:border-fuchsia-400/50 dark:shadow-[0_0_35px_rgba(255,0,128,0.6),0_0_35px_rgba(255,128,0,0.5),0_0_35px_rgba(0,255,200,0.4)]
                    ${onSymbolClick ? 'cursor-pointer hover:shadow-[0_0_30px_rgba(251,146,60,0.5)] dark:hover:shadow-[0_0_50px_rgba(255,0,128,0.8),0_0_50px_rgba(255,128,0,0.7),0_0_50px_rgba(0,255,200,0.6)] active:scale-95' : ''}
                `}
                onClick={() => onSymbolClick?.(s)}
            >
                {/* Light mode: 橙色辉光管背景 */}
                <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent dark:hidden" />

                {/* Dark mode: 酸性美学多彩背景 */}
                <div className="hidden dark:block absolute inset-0 bg-gradient-to-r from-orange-500/12 via-fuchsia-500/15 to-cyan-400/12" />
                <div className="hidden dark:block absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/12 to-lime-400/10" />
                <div className="hidden dark:block absolute inset-0 bg-gradient-to-br from-blue-500/8 via-fuchsia-400/10 to-orange-400/8" />

                <div className={`relative flex items-center gap-2 transition-all duration-300 ${isAnimating ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
                    {/* Symbol - 橙→粉→青 */}
                    <span className="font-mono text-base font-bold text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)] dark:font-black dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-orange-400 dark:via-fuchsia-400 dark:to-cyan-300 dark:drop-shadow-[0_0_18px_rgba(255,128,0,0.8),0_0_18px_rgba(255,0,128,0.6)]">
                        {alias}
                    </span>

                    {/* Price - 洋红→紫→荧光绿 */}
                    <span className="font-mono text-base font-bold tabular-nums text-orange-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.6)] dark:font-black dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-fuchsia-400 dark:via-purple-400 dark:to-lime-300 dark:drop-shadow-[0_0_18px_rgba(255,0,128,0.8),0_0_18px_rgba(132,204,22,0.6)]">
                        ${fmtPrice(item?.price)}
                    </span>
                </div>
            </div>
        </div>
    )
}
