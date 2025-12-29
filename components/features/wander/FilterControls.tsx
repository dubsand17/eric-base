'use client'

import { useState, useRef, useEffect } from 'react'
import { SortAscending, SortDescending, ChatCircle, ArrowsClockwise, Heart, Eye, CalendarBlank } from 'phosphor-react'

export type SortField = 'date' | 'comments' | 'retweets' | 'likes' | 'views'
export type SortOrder = 'asc' | 'desc'

interface FilterControlsProps {
    sortBy: SortField
    sortOrder: SortOrder
    onSortChange: (sortBy: SortField, sortOrder: SortOrder) => void
}

const sortOptions = [
    { value: 'date' as SortField, label: '时间', icon: CalendarBlank },
    { value: 'comments' as SortField, label: '评论', icon: ChatCircle },
    { value: 'retweets' as SortField, label: '转发', icon: ArrowsClockwise },
    { value: 'likes' as SortField, label: '点赞', icon: Heart },
    { value: 'views' as SortField, label: '观看', icon: Eye },
]

export default function FilterControls({ sortBy, sortOrder, onSortChange }: FilterControlsProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // 点击外部关闭下拉菜单
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const handleSortFieldChange = (field: SortField) => {
        onSortChange(field, sortOrder)
        setIsOpen(false)
    }

    const handleSortOrderToggle = () => {
        onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')
    }

    const currentOption = sortOptions.find(opt => opt.value === sortBy)
    const CurrentIcon = currentOption?.icon || CalendarBlank

    return (
        <div className="relative flex items-center gap-2" ref={dropdownRef}>
            {/* 排序字段选择器 */}
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="h-11 px-3 flex items-center gap-1.5 transition-all-gentle hover:bg-terminal-state-hover-light dark:hover:bg-terminal-state-hover-dark"
                >
                    <CurrentIcon
                        className="w-4 h-4 text-terminal-accent-light dark:text-terminal-accent-dark"
                        weight="duotone"
                    />
                    <span className="text-xs font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark whitespace-nowrap">
                        {currentOption?.label}
                    </span>
                    {/* 修复：asc = 升序 = 向下箭头（数字从小到大），desc = 降序 = 向上箭头（数字从大到小） */}
                    {sortOrder === 'asc' ? (
                        <SortDescending className="w-3.5 h-3.5 text-terminal-text-secondary-light dark:text-terminal-text-secondary-dark" weight="duotone" />
                    ) : (
                        <SortAscending className="w-3.5 h-3.5 text-terminal-text-secondary-light dark:text-terminal-text-secondary-dark" weight="duotone" />
                    )}
                </button>

                {/* 下拉菜单 */}
                {isOpen && (
                    <div className="absolute top-full mt-2 right-0 bg-white dark:bg-[#16181d] rounded-xl border border-terminal-border-light dark:border-terminal-border-dark shadow-soft-lg overflow-hidden min-w-[160px]" style={{ zIndex: 9999 }}>
                        {/* 排序字段选项 */}
                        <div className="border-b border-terminal-border-light dark:border-terminal-border-dark">
                            {sortOptions.map((option) => {
                                const Icon = option.icon
                                const isActive = option.value === sortBy

                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => handleSortFieldChange(option.value)}
                                        className={`w-full px-3 py-2 flex items-center gap-2 transition-colors ${isActive
                                            ? 'bg-terminal-accent-light/10 dark:bg-terminal-accent-dark/10 text-terminal-accent-light dark:text-terminal-accent-dark'
                                            : 'text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:bg-terminal-bg-secondary-light dark:hover:bg-terminal-bg-secondary-dark'
                                            }`}
                                    >
                                        <Icon
                                            className="w-4 h-4"
                                            weight={isActive ? 'fill' : 'duotone'}
                                        />
                                        <span className="text-xs font-medium">{option.label}</span>
                                    </button>
                                )
                            })}
                        </div>

                        {/* 排序方向选项 */}
                        <div className="p-1">
                            <button
                                onClick={() => {
                                    handleSortOrderToggle()
                                    setIsOpen(false)
                                }}
                                className="w-full px-3 py-2 flex items-center gap-2 text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:bg-terminal-bg-secondary-light dark:hover:bg-terminal-bg-secondary-dark transition-colors rounded-lg"
                            >
                                {/* 修复：显示切换后的状态 */}
                                {sortOrder === 'desc' ? (
                                    <>
                                        <SortDescending className="w-4 h-4" weight="duotone" />
                                        <span className="text-xs font-medium">切换为升序</span>
                                    </>
                                ) : (
                                    <>
                                        <SortAscending className="w-4 h-4" weight="duotone" />
                                        <span className="text-xs font-medium">切换为降序</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
