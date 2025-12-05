'use client'

import { useEffect, useState } from 'react'
import { MagnifyingGlass, EyeSlash } from 'phosphor-react'
import * as Toggle from '@radix-ui/react-toggle'

interface DisplayModeToggleProps {
  className?: string
}

export default function DisplayModeToggle({ className = '' }: DisplayModeToggleProps) {
  const [isTextHidden, setIsTextHidden] = useState(true)

  useEffect(() => {
    // 从localStorage读取用户偏好设置；无则采用默认：仅图片
    const savedPreference = localStorage.getItem('display-mode')
    if (!savedPreference) {
      document.documentElement.classList.add('image-only-mode')
      localStorage.setItem('display-mode', 'image-only')
      setIsTextHidden(true)
      return
    }
    if (savedPreference === 'image-only') {
      setIsTextHidden(true)
      document.documentElement.classList.add('image-only-mode')
    } else {
      setIsTextHidden(false)
      document.documentElement.classList.remove('image-only-mode')
    }
  }, [])

  const handlePressedChange = (pressed: boolean) => {
    setIsTextHidden(pressed)
    if (pressed) {
      document.documentElement.classList.add('image-only-mode')
      localStorage.setItem('display-mode', 'image-only')
    } else {
      document.documentElement.classList.remove('image-only-mode')
      localStorage.setItem('display-mode', 'full-content')
    }
  }

  return (
    <Toggle.Root
      pressed={isTextHidden}
      onPressedChange={handlePressedChange}
      className={`h-9 w-9 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark glass-light dark:glass-dark flex items-center justify-center transition-all hover:border-terminal-accent-light dark:hover:border-terminal-accent-dark data-[state=on]:border-terminal-accent-light data-[state=on]:dark:border-terminal-accent-dark ${className}`}
      aria-label="切换显示模式"
      title={isTextHidden ? "显示文字内容" : "仅显示图片"}
    >
      {isTextHidden ? (
        <EyeSlash className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      ) : (
        <MagnifyingGlass className="w-5 h-5 text-violet-500" />
      )}
    </Toggle.Root>
  )
}