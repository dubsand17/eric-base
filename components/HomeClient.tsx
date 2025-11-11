"use client"

import { useEffect, useRef, useState } from 'react'
import Navbar from '@/components/Navbar'
import BackToTop from '@/components/BackToTop'
import PostsList from '@/components/PostsList'
import LoadingGrid from '@/components/LoadingGrid'
import ErrorState from '@/components/ErrorState'
import EmptyState from '@/components/EmptyState'
import TradingViewWidget from '@/components/TradingViewWidget'
import ResizablePanel from '@/components/ResizablePanel'
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

// 将交易对符号转换为 TradingView 符号格式
function getTradingViewSymbol(symbol: string): string {
  const symbolMap: Record<string, string> = {
    'BTCUSDT': 'BINANCE:BTCUSDT',
    'ETHUSDT': 'BINANCE:ETHUSDT',
    'SOLUSDT': 'BINANCE:SOLUSDT',
  }
  return symbolMap[symbol] || `BINANCE:${symbol}`
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
  
  // K 线图相关状态
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  const [isWideScreen, setIsWideScreen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [leftContainerWidth, setLeftContainerWidth] = useState<number | undefined>(undefined)

  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const cacheRef = useRef<Map<string, { ts: number; data: PostsResponse }>>(new Map())
  const skipFirstFiltersRunRef = useRef(true)
  const requestIdRef = useRef(0)
  const [hasSearched, setHasSearched] = useState(false)
  const [fetchingInitial, setFetchingInitial] = useState(false)

  // 检测屏幕宽度和主题
  useEffect(() => {
    const checkScreenWidth = () => {
      // 使用 1024px 作为宽屏阈值 (lg breakpoint)
      const wide = window.innerWidth >= 1024
      setIsWideScreen((prev) => {
        // 如果从宽屏变为窄屏,清除选中的符号
        if (prev && !wide) {
          setSelectedSymbol(null)
        }
        return wide
      })
    }
    
    const checkTheme = () => {
      // 检测系统主题或 document 上的 class
      const isDark = document.documentElement.classList.contains('dark') || 
                     window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(isDark ? 'dark' : 'light')
    }

    checkScreenWidth()
    checkTheme()
    
    window.addEventListener('resize', checkScreenWidth)
    
    // 监听主题变化
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => {
      window.removeEventListener('resize', checkScreenWidth)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  // ESC 键盘快捷键关闭 K 线图
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedSymbol) {
        setSelectedSymbol(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedSymbol])

  // 处理加密货币符号点击
  const handleSymbolClick = (symbol: string) => {
    if (!isWideScreen) {
      // 窄屏时跳转到 TradingView
      const tradingViewSymbol = getTradingViewSymbol(symbol)
      const symbolName = symbol.replace('USDT', '')
      window.open(`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(tradingViewSymbol)}`, '_blank')
      return
    }

    // 宽屏时切换显示的符号
    if (selectedSymbol === symbol) {
      setSelectedSymbol(null) // 点击相同符号时关闭
    } else {
      setSelectedSymbol(symbol)
    }
  }

  async function fetchPosts(page = 1, signal?: AbortSignal) {
    const reqId = ++requestIdRef.current
    try {
      const isInitialLoad = page === 1
      if (isInitialLoad) { setLoading(true); setFetchingInitial(true) }
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
        if (isInitialLoad) setFetchingInitial(false)
        return result.data
      }

      const response = await fetch(url.toString(), { signal, headers: { Accept: 'application/json' } })
      if (!response.ok) throw new Error('Failed to fetch posts')
      const result: PostsResponse = await response.json()

      if (isInitialLoad) setPosts(result.data)
      else setPosts(prev => [...prev, ...result.data])
      setPagination(result.pagination)
      cacheRef.current.set(key, { ts: now, data: result })
      if (isInitialLoad) setFetchingInitial(false)
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
      // 仅对最后一次请求生效，避免被取消/过期请求将 loading 错误地置为 false
      // 从而导致 posts 仍为空时短暂落入 EmptyState 分支
      const isLatest = requestIdRef.current === reqId
      if (isLatest) {
        setLoading(false)
        setLoadingMore(false)
      }
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
    // 先标记为加载中，再清空列表，避免一帧内出现 EmptyState 闪烁
    setHasSearched(true)
    setLoading(true)
    setFetchingInitial(true)
    setPosts([])
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchPosts(1, controller.signal)
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, from, to])

  const handleLoadMore = () => {
    fetchPosts(pagination.page + 1)
  }

  // 渲染主要内容区域
  const renderMainContent = () => {
    // 宽屏且选中了符号时，使用 ResizablePanel
    if (isWideScreen && selectedSymbol) {
      const tradingViewSymbol = getTradingViewSymbol(selectedSymbol)
      
      return (
        <ResizablePanel
          left={
            <div className="h-full overflow-y-auto no-scrollbar">
              <PostsList
                posts={posts}
                pagination={pagination}
                loadingMore={loadingMore}
                showAbsoluteTime={showAbsoluteTime}
                onToggleTimeFormat={() => setShowAbsoluteTime((v) => !v)}
                onLoadMore={handleLoadMore}
                containerWidth={leftContainerWidth}
              />
            </div>
          }
          right={
            <div className="h-full flex flex-col px-4 py-4 md:py-6 relative overflow-hidden">
              {/* K 线图容器 - 固定高度，不滚动 */}
              <div className="flex-1 min-h-0 bg-terminal-surface-light dark:bg-terminal-surface-dark rounded-lg border border-terminal-border-light dark:border-terminal-border-dark mb-4 overflow-hidden">
                <div className="h-full w-full p-2">
                  <TradingViewWidget 
                    symbol={tradingViewSymbol} 
                    interval="60"
                    theme={theme}
                  />
                </div>
              </div>
            </div>
          }
          defaultWidth={50}
          minWidth={30}
          maxWidth={70}
          onLeftWidthChange={(percent, pixelWidth) => {
            setLeftContainerWidth(pixelWidth)
          }}
          onClose={() => setSelectedSymbol(null)}
        />
      )
    }

    // 默认情况：只显示帖子列表
    return (
      <div className="h-full overflow-y-auto no-scrollbar">
        <PostsList
          posts={posts}
          pagination={pagination}
          loadingMore={loadingMore}
          showAbsoluteTime={showAbsoluteTime}
          onToggleTimeFormat={() => setShowAbsoluteTime((v) => !v)}
          onLoadMore={handleLoadMore}
        />
      </div>
    )
  }

  if (fetchingInitial && posts.length === 0) {
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
          onSymbolClick={handleSymbolClick}
        />
        <LoadingGrid />
        <BackToTop />
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
          onSymbolClick={handleSymbolClick}
        />
        <ErrorState error={error} />
        <BackToTop />
      </div>
    )
  }

  if (!fetchingInitial && posts.length === 0) {
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
          onSymbolClick={handleSymbolClick}
        />
        <div className="container mx-auto py-6">
          <EmptyState
            state={hasSearched ? 'no_results' : 'idle'}
            query={debouncedQuery}
            onClear={() => { setQuery(''); setFrom(undefined); setTo(undefined) }}
          />
        </div>
        <BackToTop />
      </div>
    )
  }

  // 根据是否显示 K 线图决定布局方式
  const useFixedLayout = isWideScreen && selectedSymbol

  return (
    <div 
      className="min-h-screen bg-[#fafbfc] dark:bg-[#0d1117] flex flex-col" 
      style={useFixedLayout ? { height: '100vh', overflow: 'hidden' } : {}}
    >
      <Navbar
        query={query}
        onQueryChange={setQuery}
        from={from}
        to={to}
        onDateChange={({ from: f, to: t }) => { setFrom(f); setTo(t) }}
        showAbsoluteTime={showAbsoluteTime}
        onToggleTimeFormat={() => setShowAbsoluteTime((v) => !v)}
        onSymbolClick={handleSymbolClick}
      />
      <div className={useFixedLayout ? "flex-1 min-h-0 overflow-hidden" : "flex-1"}>
        {renderMainContent()}
      </div>
      <BackToTop />
    </div>
  )
}
