'use client'

import { useEffect, useState } from 'react'

interface TypewriterTextProps {
  text: string
  speed?: number
  className?: string
  onComplete?: () => void
}

export default function TypewriterText({ 
  text, 
  speed = 80, 
  className = '', 
  onComplete 
}: TypewriterTextProps) {
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    // Reset when text changes
    setHighlightedIndex(-1)
    setIsComplete(false)
  }, [text])

  useEffect(() => {
    if (highlightedIndex < text.length - 1 && !isComplete) {
      const timer = setTimeout(() => {
        setHighlightedIndex(prev => prev + 1)
      }, speed)

      return () => clearTimeout(timer)
    } else if (highlightedIndex >= text.length - 1 && !isComplete) {
      const completeTimer = setTimeout(() => {
        setIsComplete(true)
        onComplete?.()
      }, speed)

      return () => clearTimeout(completeTimer)
    }
  }, [highlightedIndex, text.length, speed, isComplete, onComplete])

  return (
    <div className={className}>
      <span className="whitespace-pre-wrap">
        {text.split('').map((char, index) => (
          <span
            key={index}
            className={`px-0.5 ${
              index === highlightedIndex 
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-sm' 
                : 'px-0.5'
            }`}
          >
            {char}
          </span>
        ))}
      </span>
    </div>
  )
}
