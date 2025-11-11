'use client'

import { useRef, useEffect } from 'react'
import MasonryGrid from '@/components/MasonryGrid'
import type { TwitterPost } from '@/lib/supabase'

interface PaginationData {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface PostsListProps {
  posts: TwitterPost[]
  pagination: PaginationData
  loadingMore: boolean
  showAbsoluteTime: boolean
  onToggleTimeFormat: () => void
  onLoadMore: () => void
  containerWidth?: number
}

export default function PostsList({ 
  posts, 
  pagination, 
  loadingMore, 
  showAbsoluteTime, 
  onToggleTimeFormat, 
  onLoadMore,
  containerWidth
}: PostsListProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // 底部哨兵自动加载更多
  useEffect(() => {
    if (!sentinelRef.current) return
    if (pagination.page >= pagination.totalPages) return

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry.isIntersecting && !loadingMore) {
        onLoadMore()
      }
    }, { root: null, rootMargin: '600px', threshold: 0 })

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [pagination.page, pagination.totalPages, loadingMore, onLoadMore])

  return (
    <>
      <MasonryGrid 
        posts={posts} 
        loadingMore={loadingMore} 
        showAbsoluteTime={showAbsoluteTime} 
        onToggleTimeFormat={onToggleTimeFormat}
        containerWidth={containerWidth}
      />

      <div ref={sentinelRef} className="h-1" />

      {pagination.page < pagination.totalPages && !loadingMore && (
        <div className="w-full flex justify-center py-6">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            加载更多
          </button>
        </div>
      )}

      {pagination.page >= pagination.totalPages && posts.length > 0 && (
        <div className="w-full flex justify-center py-8 text-sm text-gray-500 dark:text-gray-400">
          已加载完毕 · 共 {pagination.total} 条知识点
        </div>
      )}
    </>
  )
}

