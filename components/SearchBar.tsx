'use client'

import { useState, useEffect } from 'react'

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
          className="h-9 w-full pl-10 pr-9 rounded-xl border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-surface-light dark:bg-terminal-surface-dark text-sm placeholder-terminal-text-muted-light dark:placeholder-terminal-text-muted-dark text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:ring-2 focus:ring-terminal-accent-light/40 dark:focus:ring-terminal-accent-dark/50 focus:border-terminal-accent-light dark:focus:border-terminal-accent-dark"
          placeholder="搜索内容关键词..."
        />
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-terminal-text-muted-light dark:text-terminal-text-muted-dark">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 104.238 12.016l3.748 3.748a.75.75 0 101.06-1.06l-3.748-3.748A6.75 6.75 0 0010.5 3.75zm-5.25 6.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  )
}

