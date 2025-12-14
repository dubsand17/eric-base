'use client'

import { useEffect, useLayoutEffect, useMemo, useState, useRef } from 'react'
import PostCard from './PostCard'
import PostCardSkeleton from './PostCardSkeleton'
import { TwitterPost } from '@/lib/supabase'

interface PostsGridProps {
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

export default function PostsGrid({ posts, loadingMore = false, showAbsoluteTime = false, onToggleTimeFormat, containerWidth }: PostsGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // 初始化时使用更合理的默认值，避免闪烁
  // 客户端：立即使用窗口宽度计算（避免 SSR/hydration 不匹配）
  // 服务端：使用中等屏幕的3列作为保守默认值（适合大多数屏幕）
  const [colCount, setColCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      // 客户端：立即使用窗口宽度计算，确保初始值正确
      return getColumnCount(window.innerWidth)
    }
    // 服务端：使用3列作为保守默认值（适合 1024px-1920px 的屏幕）
    return 4
  })

  // 使用 useLayoutEffect 在 DOM 更新之前同步执行，减少闪烁
  useLayoutEffect(() => {
    const updateColumnCount = () => {
      let newCount: number | null = null

      if (containerWidth !== undefined && containerWidth > 0) {
        // 如果提供了容器宽度，使用它
        newCount = getColumnCount(containerWidth)
      } else if (containerRef.current) {
        // 否则使用容器的实际宽度
        const width = containerRef.current.offsetWidth
        if (width > 0) {
          newCount = getColumnCount(width)
        }
      } else if (typeof window !== 'undefined') {
        // 最后回退到窗口宽度
        newCount = getColumnCount(window.innerWidth)
      }

      // 使用函数式更新，确保总是获取最新的 colCount 值
      if (newCount !== null) {
        setColCount((prevCount) => {
          // 只有在新值不同时才更新，避免不必要的重新渲染
          return newCount !== prevCount ? newCount! : prevCount
        })
      }
    }

    // 立即更新一次（在 DOM 更新之前）
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

  // 按"横向阅读顺序"分配到列：index % colCount
  const effectiveColCount = colCount

  const columns = useMemo(() => {
    const cols: TwitterPost[][] = Array.from({ length: effectiveColCount }, () => [])
    posts.forEach((post, i) => {
      const c = i % effectiveColCount
      cols[c].push(post)
    })
    return cols
  }, [posts, effectiveColCount])

  return (
    <div ref={containerRef} className="w-full px-4 py-2 md:py-3">
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${effectiveColCount}, 1fr)` }}
      >
        {(() => {
          // 计算最短列索引（以条目数量近似列高度）
          const minIndex = columns.reduce((min, col, idx, arr) => (
            arr[idx].length < arr[min].length ? idx : min
          ), 0)

          return columns.map((col, colIndex) => (
            <div key={`col-${colIndex}`} className="flex flex-col gap-4">
              {col.map((post) => (
                <PostCard key={post.id} post={post} showAbsoluteTime={showAbsoluteTime} onToggleTimeFormat={onToggleTimeFormat} />
              ))}
              {loadingMore && colIndex === minIndex && (
                <PostCardSkeleton />
              )}
            </div>
          ))
        })()}
      </div>
    </div>
  )
}