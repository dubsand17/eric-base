'use client'

import ThemeToggle from '@/components/ThemeToggle'
import DisplayModeToggle from '@/components/DisplayModeToggle'
import PositionBuilder from '@/components/PositionBuilder'
import { Timer, Calendar } from 'phosphor-react'

interface ToolsPillProps {
    showAbsoluteTime?: boolean
    onToggleTimeFormat?: () => void
}

export default function ToolsPill({ showAbsoluteTime = false, onToggleTimeFormat }: ToolsPillProps) {
    return (
        <div className="fixed top-4 right-4 z-40 hidden md:flex">
            <div className="flex items-center gap-1 px-2 py-2 rounded-xl border border-terminal-border-light dark:border-terminal-border-dark bg-white dark:bg-[#16181d] shadow-soft-md backdrop-blur-sm">
                {/* Theme Toggle */}
                <ThemeToggle className="h-9 w-9" />

                {/* Display Mode Toggle */}
                <DisplayModeToggle className="h-9 w-9" />

                {/* Time Format Toggle */}
                <button
                    onClick={() => onToggleTimeFormat?.()}
                    aria-pressed={showAbsoluteTime}
                    className={`h-9 w-9 rounded-lg border flex items-center justify-center transition-all-gentle active:scale-95 ${showAbsoluteTime
                            ? 'border-terminal-accent-light dark:border-terminal-accent-dark text-terminal-accent-light dark:text-terminal-accent-dark shadow-soft'
                            : 'border-terminal-border-light dark:border-terminal-border-dark text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:border-terminal-borderHover-light dark:hover:border-terminal-borderHover-dark hover:shadow-soft'
                        }`}
                    title="切换时间显示"
                >
                    <div className="relative w-5 h-5 flex items-center justify-center">
                        <div
                            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${showAbsoluteTime ? 'opacity-0 rotate-180 scale-50' : 'opacity-100 rotate-0 scale-100'
                                }`}
                        >
                            <Timer className="w-5 h-5" weight="duotone" />
                        </div>
                        <div
                            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${showAbsoluteTime ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-50'
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
    )
}
