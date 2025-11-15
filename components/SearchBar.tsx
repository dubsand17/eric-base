'use client'

import { useState, useEffect } from 'react'
import { ScanSearch } from 'lucide-react'

interface SearchBarProps {
  query: string
  onQueryChange: (v: string) => void
}

export default function SearchBar({ query, onQueryChange }: SearchBarProps) {
  const [localQuery, setLocalQuery] = useState(query)

  useEffect(() => {
    setLocalQuery(query)
  }, [query])

  return (
    <div className="flex-1 min-w-0 sm:flex-none">
      <div className="relative w-full sm:w-[200px] md:w-[280px] lg:w-[320px]">
        <input
          value={localQuery}
          onChange={(e) => {
            setLocalQuery(e.target.value)
            onQueryChange?.(e.target.value)
          }}
          className="h-9 w-full pl-10 pr-9 rounded-xl border border-terminal-border-light dark:border-terminal-border-dark glass-light dark:glass-dark text-sm placeholder-terminal-text-muted-light dark:placeholder-terminal-text-muted-dark text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:ring-2 focus:ring-terminal-accent-light/40 dark:focus:ring-terminal-accent-dark/50 focus:border-terminal-accent-light dark:focus:border-terminal-accent-dark"
          placeholder="搜索内容关键词..."
        />
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-terminal-text-muted-light dark:text-terminal-text-muted-dark">
          <ScanSearch className="w-4 h-4" />
        </div>
      </div>
    </div>
  )
}

