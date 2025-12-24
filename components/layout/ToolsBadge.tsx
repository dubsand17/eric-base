'use client'

import ThemeToggle from '@/components/ui/ThemeToggle'
import DisplayModeToggle from '@/components/ui/DisplayModeToggle'
import TimeFormatToggle from '@/components/ui/TimeFormatToggle'
import PositionBuilder from '@/components/features/trading/PositionBuilder'

interface ToolsBadgeProps {
    showAbsoluteTime?: boolean
    onToggleTimeFormat?: () => void
}

export default function ToolsBadge({ showAbsoluteTime = false, onToggleTimeFormat }: ToolsBadgeProps) {
    return (
        <div className="fixed top-4 right-4 z-40 hidden md:flex items-center">
            <div className="flex items-center gap-1 px-2 py-2 rounded-xl backdrop-blur-sm">
                {/* Display Mode Toggle */}
                <DisplayModeToggle className="h-9 w-9" />

                {/* Time Format Toggle */}
                <TimeFormatToggle
                    showAbsoluteTime={showAbsoluteTime}
                    onToggleTimeFormat={onToggleTimeFormat}
                />

                {/* Position Builder */}
                <PositionBuilder />

                {/* Theme Toggle */}
                <ThemeToggle className="h-9 w-9" />
            </div>
        </div>
    )
}
