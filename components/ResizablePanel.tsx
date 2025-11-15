'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface ResizablePanelProps {
  left: React.ReactNode
  right: React.ReactNode
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  onLeftWidthChange?: (width: number, pixelWidth: number) => void
  onClose?: () => void
}

export default function ResizablePanel({ left, right, defaultWidth = 50, minWidth = 30, maxWidth = 70, onLeftWidthChange, onClose }: ResizablePanelProps) {
  const [leftWidth, setLeftWidth] = useState(defaultWidth)
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const leftContainerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100

    // 限制在最小和最大宽度之间
    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newLeftWidth))
    setLeftWidth(clampedWidth)
    
    // 通知父组件左侧宽度变化
    if (onLeftWidthChange) {
      const pixelWidth = (clampedWidth / 100) * containerRect.width
      onLeftWidthChange(clampedWidth, pixelWidth)
    }
  }, [isResizing, minWidth, maxWidth, onLeftWidthChange])

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  // 当左侧宽度或容器大小变化时，通知父组件
  useEffect(() => {
    if (!containerRef.current || !onLeftWidthChange) return

    const updateWidth = () => {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect()
        const pixelWidth = (leftWidth / 100) * containerRect.width
        onLeftWidthChange(leftWidth, pixelWidth)
      }
    }

    // 初始化时立即更新
    updateWidth()

    // 监听容器大小变化
    const resizeObserver = new ResizeObserver(updateWidth)
    resizeObserver.observe(containerRef.current)
    
    return () => resizeObserver.disconnect()
  }, [leftWidth, onLeftWidthChange])

  return (
    <div ref={containerRef} className="flex h-full w-full relative">
      {/* 左侧内容 */}
      <div 
        ref={leftContainerRef}
        className="overflow-y-auto flex-shrink-0 h-full no-scrollbar" 
        style={{ width: `${leftWidth}%` }}
      >
        {left}
      </div>

      {/* 拖拽条 */}
      <div
        className="flex-shrink-0 relative group z-10"
        style={{ width: '4px' }}
      >
        {/* 拖拽区域 */}
        <div
          className="absolute inset-0 bg-terminal-border-light/50 dark:bg-terminal-border-dark/50 hover:bg-terminal-accent-light dark:hover:bg-terminal-accent-dark cursor-col-resize transition-colors"
          onMouseDown={handleMouseDown}
        >
          {/* 拖拽指示器 */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 flex items-center justify-center pointer-events-none">
            <div className="w-0.5 h-10 bg-terminal-border-light dark:bg-terminal-border-dark group-hover:bg-terminal-accent-light dark:group-hover:bg-terminal-accent-dark rounded-full transition-colors opacity-60 group-hover:opacity-100" />
          </div>
        </div>
        
        {/* 收起按钮 - 固定在拖拽条上方，独立于拖拽区域 */}
        {onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onClose()
            }}
            onMouseDown={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
            className="absolute top-4 left-1/2 -translate-x-1/2 w-7 h-7 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark glass-light dark:glass-dark text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:border-terminal-accent-light dark:hover:border-terminal-accent-dark transition-all duration-200 z-20 shadow-lg pointer-events-auto cursor-pointer flex items-center justify-center"
            aria-label="收起 K 线图"
            title="收起 K 线图"
          >
            <svg 
              className="w-3.5 h-3.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* 右侧内容 */}
      <div 
        className="overflow-hidden flex-shrink-0 h-full" 
        style={{ width: `${100 - leftWidth}%` }}
      >
        {right}
      </div>
    </div>
  )
}

