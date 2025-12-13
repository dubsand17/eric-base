'use client'

import { Timer, Calendar } from 'phosphor-react'

interface TimeFormatToggleProps {
    showAbsoluteTime?: boolean
    onToggleTimeFormat?: () => void
    className?: string
}

export default function TimeFormatToggle({
    showAbsoluteTime = false,
    onToggleTimeFormat,
    className = ''
}: TimeFormatToggleProps) {
    return (
        <button
            onClick={() => onToggleTimeFormat?.()}
            aria-pressed={showAbsoluteTime}
            className={`h-9 w-9 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark glass-light dark:glass-dark flex items-center justify-center transition-all-gentle hover:border-terminal-borderHover-light dark:hover:border-terminal-borderHover-dark hover:shadow-soft active:scale-95 ${className}`}
            title="切换时间显示"
        >
            <div className="relative w-5 h-5 flex items-center justify-center">
                {/* Relative Time Icon */}
                <div
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${showAbsoluteTime
                        ? 'opacity-0 rotate-180 scale-50'
                        : 'opacity-100 rotate-0 scale-100'
                        }`}
                >
                    <Timer className="w-5 h-5 text-terminal-text-primary-light dark:text-terminal-text-primary-dark" weight="duotone" />
                </div>
                {/* Absolute Time Icon */}
                <div
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${showAbsoluteTime
                        ? 'opacity-100 rotate-0 scale-100'
                        : 'opacity-0 -rotate-180 scale-50'
                        }`}
                >
                    <Calendar className="w-5 h-5 text-terminal-text-primary-light dark:text-terminal-text-primary-dark" weight="duotone" />
                </div>
            </div>
        </button>
    )
}
