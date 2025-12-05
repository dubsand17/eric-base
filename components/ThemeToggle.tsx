'use client'

import { useEffect, useState } from 'react'
import * as Toggle from '@radix-ui/react-toggle'
import { Sparkle, Lightning } from 'phosphor-react'

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
      try { localStorage.setItem('theme', 'dark') } catch { }
    } else {
      document.documentElement.classList.remove('dark')
      try { localStorage.setItem('theme', 'light') } catch { }
    }
  }

  return (
    <Toggle.Root
      pressed={isDark}
      onPressedChange={handlePressedChange}
      className={`h-9 w-9 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark glass-light dark:glass-dark flex items-center justify-center transition-all hover:border-terminal-accent-light dark:hover:border-terminal-accent-dark data-[state=on]:border-terminal-accent-light data-[state=on]:dark:border-terminal-accent-dark ${className}`}
      aria-label="切换主题"
    >
      {isDark ? (
        <Lightning className="w-5 h-5 text-gray-300" />
      ) : (
        <Sparkle className="w-5 h-5 text-yellow-500" />
      )}
    </Toggle.Root>
  )
}
