'use client'

import { useState } from 'react'
import { Shuffle, ArrowLeft, X } from 'phosphor-react'

interface WanderControlsProps {
    onShuffle: () => void
    onPrevious: () => void
    onExit: () => void
    canGoPrevious: boolean
    currentIndex?: number
    totalViewed?: number
}

export default function WanderControls({
    onShuffle,
    onPrevious,
    onExit,
    canGoPrevious,
    currentIndex,
    totalViewed
}: WanderControlsProps) {
    const [isShuffling, setIsShuffling] = useState(false)

    const handleShuffle = () => {
        setIsShuffling(true)
        onShuffle()
        setTimeout(() => setIsShuffling(false), 500)
    }

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50">
            {/* 上一条按钮 */}
            <button
                onClick={onPrevious}
                disabled={!canGoPrevious}
                className="glass-light dark:glass-dark rounded-full p-4 border border-terminal-border-light dark:border-terminal-border-dark hover:border-terminal-borderHover-light dark:hover:border-terminal-borderHover-dark transition-all-gentle hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-soft-md group"
                title="上一条 (←)"
            >
                <ArrowLeft
                    className="w-6 h-6 text-terminal-text-primary-light dark:text-terminal-text-primary-dark group-hover:text-terminal-accent-light dark:group-hover:text-terminal-accent-dark transition-colors-gentle"
                    weight="duotone"
                />
            </button>

            {/* 随机按钮 - 点击时旋转 */}
            <button
                onClick={handleShuffle}
                className="glass-light dark:glass-dark rounded-full px-8 py-4 border border-terminal-border-light dark:border-terminal-border-dark hover:border-terminal-borderHover-light dark:hover:border-terminal-borderHover-dark transition-all-gentle hover:scale-105 active:scale-95 shadow-soft-lg group"
                title="随机 (Space)"
            >
                <div className="flex items-center gap-3">
                    <Shuffle
                        className={`w-6 h-6 text-terminal-accent-light dark:text-terminal-accent-dark transition-all duration-500 ${isShuffling ? 'rotate-180' : 'rotate-0'}`}
                        weight="duotone"
                    />
                    <span className="text-terminal-text-primary-light dark:text-terminal-text-primary-dark font-semibold text-lg">
                        随机
                    </span>
                </div>
            </button>

            {/* 退出按钮 */}
            <button
                onClick={onExit}
                className="glass-light dark:glass-dark rounded-full p-4 border border-terminal-border-light dark:border-terminal-border-dark hover:border-terminal-borderHover-light dark:hover:border-terminal-borderHover-dark transition-all-gentle hover:scale-105 active:scale-95 shadow-soft-md group"
                title="退出 (ESC)"
            >
                <X
                    className="w-6 h-6 text-terminal-text-primary-light dark:text-terminal-text-primary-dark group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors-gentle"
                    weight="duotone"
                />
            </button>

            {/* 进度提示 */}
            {totalViewed !== undefined && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 glass-light dark:glass-dark rounded-full px-4 py-2 border border-terminal-border-light dark:border-terminal-border-dark shadow-soft-md">
                    <span className="text-xs text-terminal-text-secondary-light dark:text-terminal-text-secondary-dark font-medium">
                        已浏览 {totalViewed} 条
                    </span>
                </div>
            )}
        </div>
    )
}
