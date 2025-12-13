'use client'

import BrandPill from '@/components/BrandPill'
import ToolsPill from '@/components/ToolsPill'
import SearchBarWithFilter from '@/components/SearchBarWithFilter'

interface TopOverlayProps {
    query: string
    onQueryChange: (v: string) => void
    from?: string
    to?: string
    onDateChange: (next: { from?: string; to?: string }) => void
    showAbsoluteTime?: boolean
    onToggleTimeFormat?: () => void
}

export default function TopOverlay({
    query,
    onQueryChange,
    from,
    to,
    onDateChange,
    showAbsoluteTime,
    onToggleTimeFormat
}: TopOverlayProps) {
    return (
        <>
            {/* Fixed navigation area with matching background - prevents content scroll-through */}
            <div className="fixed top-0 left-0 right-0 h-20 bg-terminal-bg-light dark:bg-terminal-bg-dark z-30" />

            {/* Pills on top of nav area */}
            <BrandPill />
            <SearchBarWithFilter
                query={query}
                onQueryChange={onQueryChange}
                from={from}
                to={to}
                onDateChange={onDateChange}
            />
            <ToolsPill
                showAbsoluteTime={showAbsoluteTime}
                onToggleTimeFormat={onToggleTimeFormat}
            />
        </>
    )
}
