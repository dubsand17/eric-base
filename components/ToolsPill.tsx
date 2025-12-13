'use client'

import ThemeToggle from '@/components/ThemeToggle'
import DisplayModeToggle from '@/components/DisplayModeToggle'
import TimeFormatToggle from '@/components/TimeFormatToggle'
import PositionBuilder from '@/components/PositionBuilder'

interface ToolsPillProps {
    showAbsoluteTime?: boolean
    onToggleTimeFormat?: () => void
}

export default function ToolsPill({ showAbsoluteTime = false, onToggleTimeFormat }: ToolsPillProps) {
    return (
        <div className="fixed top-4 right-4 z-40 hidden md:flex items-center">
            <div className="flex items-center gap-1 px-2 py-2 rounded-xl backdrop-blur-sm">
                {/* Theme Toggle */}
                <ThemeToggle className="h-9 w-9" />

                {/* Display Mode Toggle */}
                <DisplayModeToggle className="h-9 w-9" />

                {/* Time Format Toggle */}
                <TimeFormatToggle
                    showAbsoluteTime={showAbsoluteTime}
                    onToggleTimeFormat={onToggleTimeFormat}
                />

                {/* Position Builder */}
                <PositionBuilder />
            </div>
        </div>
    )
}
