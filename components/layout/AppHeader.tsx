'use client'

import BrandBadge from '@/components/layout/BrandBadge'
import ToolsBadge from '@/components/layout/ToolsBadge'
import SearchBar from '@/components/layout/SearchBar'
import { SortField, SortOrder } from '@/components/features/wander/FilterControls'

interface AppHeaderProps {
    query: string
    onQueryChange: (v: string) => void
    from?: string
    to?: string
    onDateChange: (next: { from?: string; to?: string }) => void
    showAbsoluteTime?: boolean
    onToggleTimeFormat?: () => void
    sortBy?: SortField
    sortOrder?: SortOrder
    onSortChange?: (sortBy: SortField, sortOrder: SortOrder) => void
}

export default function AppHeader({
    query,
    onQueryChange,
    from,
    to,
    onDateChange,
    showAbsoluteTime,
    onToggleTimeFormat,
    sortBy,
    sortOrder,
    onSortChange
}: AppHeaderProps) {
    return (
        <>
            {/* Fixed navigation area with matching background - prevents content scroll-through */}
            <div className="fixed top-0 left-0 right-0 h-20 bg-terminal-bg-light dark:bg-terminal-bg-dark z-30" />

            {/* Pills on top of nav area */}
            <BrandBadge />
            <SearchBar
                query={query}
                onQueryChange={onQueryChange}
                from={from}
                to={to}
                onDateChange={onDateChange}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
            />
            <ToolsBadge
                showAbsoluteTime={showAbsoluteTime}
                onToggleTimeFormat={onToggleTimeFormat}
            />
        </>
    )
}
