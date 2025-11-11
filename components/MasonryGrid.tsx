'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import TwitterCard from './TwitterCard'
import SkeletonCard from './SkeletonCard'
import { TwitterPost } from '@/lib/supabase'

interface MasonryGridProps {
  posts: TwitterPost[]
  loadingMore?: boolean
  showAbsoluteTime?: boolean
  onToggleTimeFormat?: () => void
  containerWidth?: number // 可选的容器宽度，用于动态计算列数
}

// 根据容器宽度计算列数，最少1列
// 假设每个卡片最小宽度约为320px（包括gap）
function getColumnCount(width: number | undefined): number {
  if (!width) {
    // 如果没有提供宽度，使用窗口宽度
    if (typeof window === 'undefined') return 1
    width = window.innerWidth
  }
  
  // 最少1列
  if (width < 640) return 1 // sm-
  if (width < 960) return 2 // md
  if (width < 1280) return 3 // lg
  if (width < 1920) return 4 // xl
  return Math.min(6, Math.floor(width / 320)) // 最多6列，每个卡片约320px
}

export default function MasonryGrid({ posts, loadingMore = false, showAbsoluteTime = false, onToggleTimeFormat, containerWidth }: MasonryGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [colCount, setColCount] = useState<number>(1)

  useEffect(() => {
    const updateColumnCount = () => {
      if (containerWidth !== undefined && containerWidth > 0) {
        // 如果提供了容器宽度，使用它
        setColCount(getColumnCount(containerWidth))
      } else if (containerRef.current) {
        // 否则使用容器的实际宽度
        const width = containerRef.current.offsetWidth
        if (width > 0) {
          setColCount(getColumnCount(width))
        }
      } else {
        // 最后回退到窗口宽度
        setColCount(getColumnCount(undefined))
      }
    }

    updateColumnCount()
    
    if (containerWidth !== undefined) {
      // 如果提供了容器宽度，直接使用它，不监听窗口resize
      return
    }
    
    // 只有在没有提供容器宽度时才监听窗口resize和容器resize
    const onResize = () => updateColumnCount()
    window.addEventListener('resize', onResize)
    
    // 使用 ResizeObserver 监听容器大小变化
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(updateColumnCount)
      resizeObserver.observe(containerRef.current)
      return () => {
        window.removeEventListener('resize', onResize)
        resizeObserver.disconnect()
      }
    }
    
    return () => window.removeEventListener('resize', onResize)
  }, [containerWidth])

  // 按“横向阅读顺序”分配到列：index % colCount
  const columns = useMemo(() => {
    const cols: TwitterPost[][] = Array.from({ length: colCount }, () => [])
    posts.forEach((post, i) => {
      const c = i % colCount
      cols[c].push(post)
    })
    return cols
  }, [posts, colCount])

  return (
    <div ref={containerRef} className="w-full px-4 py-4 md:py-6">
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}
      >
        {(() => {
          // 计算最短列索引（以条目数量近似列高度）
          const minIndex = columns.reduce((min, col, idx, arr) => (
            arr[idx].length < arr[min].length ? idx : min
          ), 0)

          return columns.map((col, colIndex) => (
            <div key={`col-${colIndex}`} className="flex flex-col gap-4">
              {col.map((post) => (
                <TwitterCard key={post.id} post={post} showAbsoluteTime={showAbsoluteTime} onToggleTimeFormat={onToggleTimeFormat} />
              ))}
              {loadingMore && colIndex === minIndex && (
                <SkeletonCard />
              )}
            </div>
          ))
        })()}
      </div>
    </div>
  )
}