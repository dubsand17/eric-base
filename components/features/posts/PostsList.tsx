'use client'

import { useRef, useEffect } from 'react'
import PostsGrid from './PostsGrid'
import { TwitterPost } from '@/lib/supabase'

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
      <PostsGrid
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
            className="px-6 py-3 rounded-2xl border border-terminal-border-light dark:border-terminal-border-dark glass-light dark:glass-dark text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:glass-active-light dark:hover:glass-active-dark transition-all duration-200 font-medium"
          >
            加载更多
          </button>
        </div>
      )}

      {pagination.page >= pagination.totalPages && posts.length > 0 && (
        <div className="w-full flex justify-center py-8 text-sm text-terminal-text-muted-light dark:text-terminal-text-muted-dark">

        </div>
      )}
    </>
  )
}

