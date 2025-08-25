'use client'

import { useEffect, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import * as Toggle from '@radix-ui/react-toggle'

interface DisplayModeToggleProps {
  className?: string
}

export default function DisplayModeToggle({ className = '' }: DisplayModeToggleProps) {
  const [isTextHidden, setIsTextHidden] = useState(false)

  useEffect(() => {
    // 从localStorage读取用户偏好设置
    const savedPreference = localStorage.getItem('display-mode')
    if (savedPreference === 'image-only') {
      setIsTextHidden(true)
      document.documentElement.classList.add('image-only-mode')
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
      className={`p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 data-[state=on]:ring-2 data-[state=on]:ring-violet-500/40 ${className}`}
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