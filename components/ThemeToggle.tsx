'use client'

import { useEffect, useState } from 'react'
import * as Toggle from '@radix-ui/react-toggle'
import { Sun, Moon } from 'lucide-react'

interface ThemeToggleProps {
  className?: string
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark')
    setIsDark(isDarkMode)
  }, [])

  const handlePressedChange = (pressed: boolean) => {
    setIsDark(pressed)
    if (pressed) {
      document.documentElement.classList.add('dark')
      try { localStorage.setItem('theme', 'dark') } catch {}
    } else {
      document.documentElement.classList.remove('dark')
      try { localStorage.setItem('theme', 'light') } catch {}
    }
  }

  return (
    <Toggle.Root
      pressed={isDark}
      onPressedChange={handlePressedChange}
      className={`h-9 w-9 rounded-lg border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-surface-light dark:bg-terminal-surface-dark flex items-center justify-center transition-all hover:border-terminal-accent-light dark:hover:border-terminal-accent-dark hover:shadow-[0_0_12px_rgba(6,182,212,0.3)] data-[state=on]:border-terminal-accent-light data-[state=on]:dark:border-terminal-accent-dark ${className}`}
      aria-label="切换主题"
    >
      {isDark ? (
        <Moon className="w-5 h-5 text-gray-300" />
      ) : (
        // Custom full-ray sun to avoid any visual 'missing petal' on some renderers
        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      )}
    </Toggle.Root>
  )
}
 