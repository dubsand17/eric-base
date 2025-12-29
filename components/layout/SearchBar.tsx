'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlass, FunnelSimple } from 'phosphor-react'
import * as Popover from '@radix-ui/react-popover'
import FilterControls, { SortField, SortOrder } from '@/components/features/wander/FilterControls'

interface SearchBarProps {
    query: string
    onQueryChange: (v: string) => void
    from?: string
    to?: string
    onDateChange: (next: { from?: string; to?: string }) => void
    sortBy?: SortField
    sortOrder?: SortOrder
    onSortChange?: (sortBy: SortField, sortOrder: SortOrder) => void
}

export default function SearchBar({
    query,
    onQueryChange,
    from,
    to,
    onDateChange,
    sortBy,
    sortOrder,
    onSortChange
}: SearchBarProps) {
    const [localQuery, setLocalQuery] = useState(query)

    useEffect(() => {
        setLocalQuery(query)
    }, [query])

    const hasDateFilter = Boolean(from || to)

    return (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-40 w-full max-w-md pl-[68px] pr-4 sm:px-0">
            <div className="relative">
                {/* Main Search Bar with integrated FilterControls */}
                <div className="flex items-center gap-0 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark bg-white dark:bg-[#16181d] shadow-soft-md backdrop-blur-sm overflow-visible">
                    {/* Date Filter Popover - Left */}
                    <Popover.Root>
                        <Popover.Trigger asChild>
                            <button
                                className={`h-11 w-11 flex items-center justify-center transition-all-gentle ${hasDateFilter
                                    ? 'text-terminal-accent-light dark:text-terminal-accent-dark bg-terminal-accent-muted-light dark:bg-terminal-accent-muted-dark'
                                    : 'text-terminal-text-muted-light dark:text-terminal-text-muted-dark hover:text-terminal-text-primary-light dark:hover:text-terminal-text-primary-dark hover:bg-terminal-state-hover-light dark:hover:bg-terminal-state-hover-dark'
                                    }`}
                                title="日期筛选"
                                aria-label="日期筛选"
                            >
                                <FunnelSimple className="w-4 h-4" weight="duotone" />
                            </button>
                        </Popover.Trigger>
                        <Popover.Portal>
                            <Popover.Content
                                side="bottom"
                                align="start"
                                sideOffset={8}
                                className="rounded-xl border border-terminal-border-light dark:border-terminal-border-dark bg-white dark:bg-[#16181d] p-3 shadow-soft-lg w-[320px] max-w-[90vw] animate-scale-in z-50"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <label className="text-[11px] text-terminal-text-muted-light dark:text-terminal-text-muted-dark mb-1">开始</label>
                                        <input
                                            type="date"
                                            value={from || ''}
                                            onChange={(e) => onDateChange({ from: e.target.value || undefined, to })}
                                            className="w-full min-w-0 h-8 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark glass-light dark:glass-dark px-2 text-xs text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:border-terminal-accent-light dark:focus:border-terminal-accent-dark focus:shadow-glow-accent transition-all-gentle"
                                            aria-label="开始日期"
                                        />
                                    </div>
                                    <span className="text-terminal-text-muted-light dark:text-terminal-text-muted-dark pt-5">—</span>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <label className="text-[11px] text-terminal-text-muted-light dark:text-terminal-text-muted-dark mb-1">结束</label>
                                        <input
                                            type="date"
                                            value={to || ''}
                                            onChange={(e) => onDateChange({ from, to: e.target.value || undefined })}
                                            className="w-full min-w-0 h-8 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark glass-light dark:glass-dark px-2 text-xs text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:border-terminal-accent-light dark:focus:border-terminal-accent-dark focus:shadow-glow-accent transition-all-gentle"
                                            aria-label="结束日期"
                                        />
                                    </div>
                                </div>
                                <div className="mt-3 flex justify-end">
                                    <button
                                        onClick={() => onDateChange({ from: undefined, to: undefined })}
                                        className="text-xs text-terminal-text-secondary-light dark:text-terminal-text-secondary-dark hover:text-terminal-text-primary-light dark:hover:text-terminal-text-primary-dark transition-colors-gentle px-3 py-1.5 rounded-lg hover:bg-terminal-state-hover-light dark:hover:bg-terminal-state-hover-dark"
                                    >
                                        清除
                                    </button>
                                </div>
                            </Popover.Content>
                        </Popover.Portal>
                    </Popover.Root>

                    {/* Search Input */}
                    <input
                        value={localQuery}
                        onChange={(e) => {
                            setLocalQuery(e.target.value)
                            onQueryChange?.(e.target.value)
                        }}
                        className="flex-1 h-11 px-3 bg-transparent text-sm placeholder-terminal-text-muted-light dark:placeholder-terminal-text-muted-dark text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none"
                        placeholder="Search"
                    />

                    {/* Search Icon */}
                    <div className="h-11 w-11 flex items-center justify-center text-terminal-text-muted-light dark:text-terminal-text-muted-dark pointer-events-none">
                        <MagnifyingGlass className="w-4 h-4" weight="duotone" />
                    </div>

                    {/* FilterControls - Right */}
                    {sortBy && sortOrder && onSortChange && (
                        <div className="border-l border-terminal-border-light dark:border-terminal-border-dark">
                            <FilterControls
                                sortBy={sortBy}
                                sortOrder={sortOrder}
                                onSortChange={onSortChange}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
