'use client'

import { useEffect, useState } from 'react'
import * as Toggle from '@radix-ui/react-toggle'
import { Sun, Moon } from 'phosphor-react'

interface ThemeToggleProps {
  className?: string
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  // 从 localStorage 或 DOM 初始化主题状态，避免闪烁
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return true // SSR 默认深色
    try {
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        return savedTheme === 'dark'
      }
    } catch { }
    return document.documentElement.classList.contains('dark')
  })

  useEffect(() => {
    // 确保状态与 DOM 同步
    const isDarkMode = document.documentElement.classList.contains('dark')
    if (isDarkMode !== isDark) {
      setIsDark(isDarkMode)
    }
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
      className={`h-9 w-9 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark glass-light dark:glass-dark flex items-center justify-center transition-all-gentle hover:border-terminal-borderHover-light dark:hover:border-terminal-borderHover-dark hover:shadow-soft active:scale-95 ${className}`}
      aria-label="切换主题"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {/* Light mode icon */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isDark
            ? 'opacity-0 rotate-180 scale-50'
            : 'opacity-100 rotate-0 scale-100'
            }`}
        >
          <Sun className="w-5 h-5 text-terminal-text-primary-light dark:text-terminal-text-primary-dark" weight="duotone" />
        </div>
        {/* Dark mode icon */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isDark
            ? 'opacity-100 rotate-0 scale-100'
            : 'opacity-0 -rotate-180 scale-50'
            }`}
        >
          <Moon className="w-5 h-5 text-terminal-text-primary-light dark:text-terminal-text-primary-dark" weight="duotone" />
        </div>
      </div>
    </Toggle.Root>
  )
}
