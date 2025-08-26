'use client'

import { useEffect, useMemo, useState } from 'react'
import TwitterCard from './TwitterCard'
import SkeletonCard from './SkeletonCard'
import { TwitterPost } from '@/lib/supabase'

interface MasonryGridProps {
  posts: TwitterPost[]
  loadingMore?: boolean
  showAbsoluteTime?: boolean
  onToggleTimeFormat?: () => void
}

function getColumnCount(width: number): number {
  if (width < 640) return 1 // sm-
  if (width < 1024) return 2 // md
  if (width < 1536) return 3 // lg (matches lg:grid-cols-3)
  return 4 // 2xl+ (matches 2xl:grid-cols-4)
}

export default function MasonryGrid({ posts, loadingMore = false, showAbsoluteTime = false, onToggleTimeFormat }: MasonryGridProps) {
  // 为了避免 SSR 不一致，同时在大屏首帧尽量占满，初始列数设为 4
  const [colCount, setColCount] = useState<number>(4)

  useEffect(() => {
    // 初始化时设置正确的列数
    setColCount(getColumnCount(window.innerWidth))
    
    const onResize = () => setColCount(getColumnCount(window.innerWidth))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

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
    <div className="w-full px-4 py-4 md:py-6">
      <div
        className={
          // 仅用于列容器，不用网格行，避免强制对齐导致的空隙
          'grid gap-4 ' +
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'
        }
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