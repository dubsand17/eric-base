'use client'

import { useState, useEffect, useRef } from 'react'
import MasonryGrid from '@/components/MasonryGrid'
import { supabase } from '@/lib/supabase'
import EmptyState from '@/components/EmptyState'
import Navbar from '@/components/Navbar'
import LoadingGrid from '@/components/LoadingGrid'
import ErrorState from '@/components/ErrorState'
import { TwitterPost } from '@/lib/supabase'

interface PaginationData {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface PostsResponse {
  data: TwitterPost[]
  pagination: PaginationData
}

export default function Home() {
  const [posts, setPosts] = useState<TwitterPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    pageSize: 30,
    totalPages: 0
  })
  const [loadingMore, setLoadingMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  // 搜索与时间过滤
  const [query, setQuery] = useState('')
  const [from, setFrom] = useState<string | undefined>(undefined)
  const [to, setTo] = useState<string | undefined>(undefined)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  // 全局时间显示：相对/绝对
  const [showAbsoluteTime, setShowAbsoluteTime] = useState(false)
  
  // 获取帖子数据
  async function fetchPosts(page = 1) {
    try {
      const isInitialLoad = page === 1
      if (isInitialLoad) setLoading(true)
      else setLoadingMore(true)
      
      // 构建API URL
      const url = new URL('/api/posts', window.location.origin)
      url.searchParams.append('page', page.toString())
      url.searchParams.append('pageSize', pagination.pageSize.toString())
      if (debouncedQuery) url.searchParams.append('q', debouncedQuery)
      if (from) url.searchParams.append('from', from)
      if (to) url.searchParams.append('to', to)
      
      const response = await fetch(url.toString())
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }
      
      const result: PostsResponse = await response.json()
      
      if (isInitialLoad) setPosts(result.data)
      else setPosts(prev => [...prev, ...result.data])
      
      setPagination(result.pagination)
      return result.data
    } catch (err) {
      console.error('Error fetching posts:', err)
      setError(err instanceof Error ? err.message : '获取数据失败')
      return null
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }
  
  // 加载更多帖子
  const loadMorePosts = () => {
    if (pagination.page < pagination.totalPages && !loadingMore) {
      fetchPosts(pagination.page + 1)
    }
  }
  
  // 初始加载
  useEffect(() => {
    fetchPosts()
  }, [])

  // 搜索关键词防抖
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  // 过滤条件变化时重置列表并重新加载第一页
  useEffect(() => {
    setPosts([])
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchPosts(1)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, from, to])

  // 底部哨兵自动加载更多（IntersectionObserver）
  useEffect(() => {
    if (!sentinelRef.current) return
    if (pagination.page >= pagination.totalPages) return

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry.isIntersecting && !loadingMore) {
        fetchPosts(pagination.page + 1)
      }
    }, {
      root: null,
      rootMargin: '600px',
      threshold: 0
    })

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [pagination.page, pagination.totalPages, loadingMore])

  // 渲染加载状态
  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-[#fafbfc] dark:bg-[#0d1117]">
        <Navbar
          query={query}
          onQueryChange={setQuery}
          from={from}
          to={to}
          onDateChange={({ from: f, to: t }) => { setFrom(f); setTo(t) }}
          showAbsoluteTime={showAbsoluteTime}
          onToggleTimeFormat={() => setShowAbsoluteTime((v) => !v)}
        />
        <LoadingGrid />
      </div>
    )
  }

  // 渲染错误状态
  if (error) {
    return (
      <div className="min-h-screen bg-[#fafbfc] dark:bg-[#0d1117]">
        <Navbar
          query={query}
          onQueryChange={setQuery}
          from={from}
          to={to}
          onDateChange={({ from: f, to: t }) => { setFrom(f); setTo(t) }}
          showAbsoluteTime={showAbsoluteTime}
          onToggleTimeFormat={() => setShowAbsoluteTime((v) => !v)}
        />
        <ErrorState error={error} />
      </div>
    )
  }

  // 渲染空状态
  if (posts.length === 0) {
    return (
      <div className="min-h-screen bg-[#fafbfc] dark:bg-[#0d1117]">
        <Navbar
          query={query}
          onQueryChange={setQuery}
          from={from}
          to={to}
          onDateChange={({ from: f, to: t }) => { setFrom(f); setTo(t) }}
          showAbsoluteTime={showAbsoluteTime}
          onToggleTimeFormat={() => setShowAbsoluteTime((v) => !v)}
        />
        <div className="container mx-auto py-6">
          <EmptyState />
        </div>
      </div>
    )
  }

  // 渲染内容
  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-[#0d1117]">
      <Navbar
        query={query}
        onQueryChange={setQuery}
        from={from}
        to={to}
        onDateChange={({ from: f, to: t }) => { setFrom(f); setTo(t) }}
        showAbsoluteTime={showAbsoluteTime}
        onToggleTimeFormat={() => setShowAbsoluteTime((v) => !v)}
      />
      <MasonryGrid posts={posts} loadingMore={loadingMore} showAbsoluteTime={showAbsoluteTime} onToggleTimeFormat={() => setShowAbsoluteTime((v) => !v)} />

      {/* 底部哨兵（自动加载更多） */}
      <div ref={sentinelRef} className="h-1" />

      {/* 兜底按钮：当没有触发自动加载或用户想手动加载时 */}
      {pagination.page < pagination.totalPages && !loadingMore && (
        <div className="w-full flex justify-center py-6">
          <button
            onClick={() => fetchPosts(pagination.page + 1)}
            className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            加载更多
          </button>
        </div>
      )}

      {/* 没有更多数据提示 */}
      {pagination.page >= pagination.totalPages && posts.length > 0 && (
        <div className="w-full flex justify-center py-8 text-sm text-gray-500 dark:text-gray-400">
          已经到底了
        </div>
      )}
    </div>
  )
}