'use client'

import { useEffect, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
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
      className={`h-9 w-9 rounded-full border border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-md flex items-center justify-center transition hover:bg-white/50 dark:hover:bg-white/10 data-[state=on]:ring-2 data-[state=on]:ring-white/30 ${className}`}
      aria-label="切换显示模式"
      title={isTextHidden ? "显示文字内容" : "仅显示图片"}
    >
      {isTextHidden ? (
        <EyeOff className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      ) : (
        <Eye className="w-5 h-5 text-violet-500" />
      )}
    </Toggle.Root>
  )
}