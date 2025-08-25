"use client"

import { useEffect, useRef, useState } from 'react'
import Navbar from '@/components/Navbar'
import MasonryGrid from '@/components/MasonryGrid'
import LoadingGrid from '@/components/LoadingGrid'
import ErrorState from '@/components/ErrorState'
import EmptyState from '@/components/EmptyState'
import type { TwitterPost } from '@/lib/supabase'

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

interface HomeClientProps {
  initialPosts: TwitterPost[]
  initialPagination: PaginationData
}

export default function HomeClient({ initialPosts, initialPagination }: HomeClientProps) {
  const [posts, setPosts] = useState<TwitterPost[]>(initialPosts)
  const [pagination, setPagination] = useState<PaginationData>(initialPagination)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [query, setQuery] = useState('')
  const [from, setFrom] = useState<string | undefined>(undefined)
  const [to, setTo] = useState<string | undefined>(undefined)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [showAbsoluteTime, setShowAbsoluteTime] = useState(false)

  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const cacheRef = useRef<Map<string, { ts: number; data: PostsResponse }>>(new Map())
  const skipFirstFiltersRunRef = useRef(true)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  async function fetchPosts(page = 1, signal?: AbortSignal) {
    try {
      const isInitialLoad = page === 1
      if (isInitialLoad) setLoading(true)
      else setLoadingMore(true)

      const url = new URL('/api/posts', window.location.origin)
      url.searchParams.append('page', page.toString())
      url.searchParams.append('pageSize', pagination.pageSize.toString())
      if (debouncedQuery) url.searchParams.append('q', debouncedQuery)
      if (from) url.searchParams.append('from', from)
      if (to) url.searchParams.append('to', to)

      const key = url.pathname + '?' + url.searchParams.toString()
      const now = Date.now()
      const cached = cacheRef.current.get(key)
      if (cached && now - cached.ts < 60_000) {
        const result = cached.data
        if (isInitialLoad) setPosts(result.data)
        else setPosts(prev => [...prev, ...result.data])
        setPagination(result.pagination)
        return result.data
      }

      const response = await fetch(url.toString(), { signal, headers: { Accept: 'application/json' } })
      if (!response.ok) throw new Error('Failed to fetch posts')
      const result: PostsResponse = await response.json()

      if (isInitialLoad) setPosts(result.data)
      else setPosts(prev => [...prev, ...result.data])
      setPagination(result.pagination)
      cacheRef.current.set(key, { ts: now, data: result })
      return result.data
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
        // 静默忽略取消
        return null
      }
      console.error('Error fetching posts:', err)
      setError(err instanceof Error ? err.message : '获取数据失败')
      return null
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // 条件变化：重置并加载第一页（带取消未完成请求）
  useEffect(() => {
    // 跳过首次运行，保留 SSR 首屏数据，避免初始就清空/触发请求
    if (skipFirstFiltersRunRef.current) {
      skipFirstFiltersRunRef.current = false
      return
    }
    const controller = new AbortController()
    setPosts([])
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchPosts(1, controller.signal)
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, from, to])

  // 底部哨兵自动加载更多
  useEffect(() => {
    if (!sentinelRef.current) return
    if (pagination.page >= pagination.totalPages) return

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry.isIntersecting && !loadingMore) {
        fetchPosts(pagination.page + 1)
      }
    }, { root: null, rootMargin: '600px', threshold: 0 })

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [pagination.page, pagination.totalPages, loadingMore])

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

      <div ref={sentinelRef} className="h-1" />

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

      {pagination.page >= pagination.totalPages && posts.length > 0 && (
        <div className="w-full flex justify-center py-8 text-sm text-gray-500 dark:text-gray-400">
          已经到底了
        </div>
      )}
    </div>
  )
}
