"use client"

import { useEffect, useRef, useState } from 'react'
import AppHeader from '@/components/layout/AppHeader'
import CryptoPriceTicker from '@/components/features/crypto/CryptoPriceTicker'
import PostsList from '@/components/features/posts/PostsList'
import GroupsGrid from '@/components/features/posts/GroupsGrid'
import LoadingState from '@/components/shared/LoadingState'
import ErrorState from '@/components/shared/ErrorState'
import EmptyState from '@/components/shared/EmptyState'
import TradingChart from '@/components/features/trading/TradingChart'
import ResizablePanel from '@/components/features/trading/ResizablePanel'
import MobileMenu from '@/components/layout/MobileMenu'
import FilterControls, { SortField, SortOrder } from '@/components/features/wander/FilterControls'
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
  const [sortBy, setSortBy] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // K线图和加密货币相关
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  const [isWideScreen, setIsWideScreen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [leftContainerWidth, setLeftContainerWidth] = useState<number | undefined>(undefined)

  // 加密货币价格数据
  const [prices, setPrices] = useState<Record<string, { price: number; percent: number }> | null>(null)
  const prevRef = useRef<Record<string, { price: number; percent: number }> | null>(null)
  const [pulse, setPulse] = useState<Record<string, 'up' | 'down' | undefined>>({})
  const [dir, setDir] = useState<Record<string, 'up' | 'down' | 'none'>>({})

  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const cacheRef = useRef<Map<string, { ts: number; data: PostsResponse }>>(new Map())
  const skipFirstFiltersRunRef = useRef(true)
  const requestIdRef = useRef(0)
  const [hasSearched, setHasSearched] = useState(false)
  const [fetchingInitial, setFetchingInitial] = useState(false)

  // 获取加密货币价格
  useEffect(() => {
    let timer: number | undefined
    const load = async () => {
      try {
        const res = await fetch('/api/crypto?fresh=1', { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        const map: Record<string, { price: number; percent: number }> = {}
        for (const item of json.data as Array<{ symbol: string; price: number; percent: number }>) {
          map[item.symbol] = { price: item.price, percent: item.percent }
        }

        const prev = prevRef.current
        const toPulse: Record<string, 'up' | 'down'> = {}
        const toDir: Record<string, 'up' | 'down' | 'none'> = {}
        for (const s of Object.keys(map)) {
          const oldP = prev?.[s]?.price
          const newP = map[s]?.price
          if (typeof oldP === 'number' && typeof newP === 'number') {
            if (newP > oldP) { toPulse[s] = 'up'; toDir[s] = 'up' }
            else if (newP < oldP) { toPulse[s] = 'down'; toDir[s] = 'down' }
            else { toDir[s] = 'none' }
          } else {
            toDir[s] = 'none'
          }
        }

        if (Object.keys(toPulse).length) {
          setPulse((p) => ({ ...p, ...toPulse }))
          window.setTimeout(() => {
            setPulse((p) => {
              const next = { ...p }
              for (const s of Object.keys(toPulse)) next[s] = undefined
              return next
            })
          }, 1200)
        }

        setDir(toDir)
        setPrices(map)
        prevRef.current = map
      } catch (e) {
        console.warn('Fetch /api/crypto failed:', e)
      }
    }
    load()
    timer = window.setInterval(load, 5000)
    return () => { if (timer) window.clearInterval(timer) }
  }, [])

  // 检测屏幕宽度和主题
  useEffect(() => {
    const checkScreenWidth = () => {
      const wide = window.innerWidth >= 1024
      setIsWideScreen((prev) => {
        if (prev && !wide) {
          setSelectedSymbol(null)
        }
        return wide
      })
    }

    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(isDark ? 'dark' : 'light')
    }

    checkScreenWidth()
    checkTheme()

    window.addEventListener('resize', checkScreenWidth)

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedSymbol) {
        setSelectedSymbol(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedSymbol])

  const handleSymbolClick = (symbol: string) => {
    if (!isWideScreen) {
      const tradingViewSymbol = getTradingViewSymbol(symbol)
      window.open(`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(tradingViewSymbol)}`, '_blank')
      return
    }

    if (!selectedSymbol) {
      setSelectedSymbol(symbol)
    } else if (selectedSymbol === symbol) {
      setSelectedSymbol(null)
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
      url.searchParams.append('sortBy', sortBy)
      url.searchParams.append('sortOrder', sortOrder)
      url.searchParams.append('ungrouped', 'true')

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
        return null
      }
      console.error('Error fetching posts:', err)
      setError(err instanceof Error ? err.message : '获取数据失败')
      return null
    } finally {
      const isLatest = requestIdRef.current === reqId
      if (isLatest) {
        setLoading(false)
        setLoadingMore(false)
      }
    }
  }

  useEffect(() => {
    if (skipFirstFiltersRunRef.current) {
      skipFirstFiltersRunRef.current = false
      if (initialPosts.length === 0 && !loading) {
        const controller = new AbortController()
        fetchPosts(1, controller.signal)
        return () => controller.abort()
      }
      return
    }
    const controller = new AbortController()
    if (debouncedQuery || from || to) {
      setHasSearched(true)
    }
    setLoading(true)
    setFetchingInitial(true)
    setPosts([])
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchPosts(1, controller.signal)
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, from, to, sortBy, sortOrder])

  const handleLoadMore = () => {
    fetchPosts(pagination.page + 1)
  }

  const handleSortChange = (newSortBy: SortField, newSortOrder: SortOrder) => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
  }

  const renderMainContent = () => {
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
              <div className="flex-1 min-h-0 glass-light dark:glass-dark rounded-2xl border border-terminal-border-light dark:border-terminal-border-dark mb-1 overflow-hidden">
                <div className="h-full w-full p-2">
                  <TradingChart
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

    return (
      <div className="h-full overflow-y-auto no-scrollbar">
        <GroupsGrid />
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
      <div className="min-h-screen bg-terminal-bg-light dark:bg-terminal-bg-dark">
        <AppHeader
          query={query}
          onQueryChange={setQuery}
          from={from}
          to={to}
          onDateChange={({ from: f, to: t }) => { setFrom(f); setTo(t) }}
          showAbsoluteTime={showAbsoluteTime}
          onToggleTimeFormat={() => setShowAbsoluteTime((v) => !v)}
        />
        <div className="md:hidden fixed top-4 left-4 z-40">
          <MobileMenu showAbsoluteTime={showAbsoluteTime} onToggleTimeFormat={() => setShowAbsoluteTime((v) => !v)} />
        </div>
        <div className="pt-20">
          <LoadingState />
        </div>
        <CryptoPriceTicker prices={prices} dir={dir} onSymbolClick={handleSymbolClick} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-terminal-bg-light dark:bg-terminal-bg-dark">
        <AppHeader
          query={query}
          onQueryChange={setQuery}
          from={from}
          to={to}
          onDateChange={({ from: f, to: t }) => { setFrom(f); setTo(t) }}
          showAbsoluteTime={showAbsoluteTime}
          onToggleTimeFormat={() => setShowAbsoluteTime((v) => !v)}
        />
        <div className="md:hidden fixed top-5 left-4 z-40">
          <MobileMenu showAbsoluteTime={showAbsoluteTime} onToggleTimeFormat={() => setShowAbsoluteTime((v) => !v)} />
        </div>
        <ErrorState error={error} />
        <CryptoPriceTicker prices={prices} dir={dir} onSymbolClick={handleSymbolClick} />
      </div>
    )
  }

  if (!fetchingInitial && posts.length === 0 && hasSearched) {
    return (
      <div className="min-h-screen bg-terminal-bg-light dark:bg-terminal-bg-dark">
        <AppHeader
          query={query}
          onQueryChange={setQuery}
          from={from}
          to={to}
          onDateChange={({ from: f, to: t }) => { setFrom(f); setTo(t) }}
          showAbsoluteTime={showAbsoluteTime}
          onToggleTimeFormat={() => setShowAbsoluteTime((v) => !v)}
        />
        <div className="md:hidden fixed top-5 left-4 z-40">
          <MobileMenu showAbsoluteTime={showAbsoluteTime} onToggleTimeFormat={() => setShowAbsoluteTime((v) => !v)} />
        </div>
        <div className="container mx-auto py-6">
          <EmptyState
            state={'no_results'}
            query={debouncedQuery}
            onClear={() => { setQuery(''); setFrom(undefined); setTo(undefined) }}
          />
        </div>
        <CryptoPriceTicker prices={prices} dir={dir} onSymbolClick={handleSymbolClick} />
      </div>
    )
  }

  const useFixedLayout = isWideScreen && selectedSymbol

  return (
    <div
      className="min-h-screen bg-terminal-bg-light dark:bg-terminal-bg-dark flex flex-col"
      style={useFixedLayout ? { height: '100vh', overflow: 'hidden' } : {}}
    >
      <AppHeader
        query={query}
        onQueryChange={setQuery}
        from={from}
        to={to}
        onDateChange={({ from: f, to: t }) => { setFrom(f); setTo(t) }}
        showAbsoluteTime={showAbsoluteTime}
        onToggleTimeFormat={() => setShowAbsoluteTime((v) => !v)}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
      />
      <div className="md:hidden fixed top-5 left-4 z-40">
        <MobileMenu showAbsoluteTime={showAbsoluteTime} onToggleTimeFormat={() => setShowAbsoluteTime((v) => !v)} />
      </div>
      <div className={useFixedLayout ? "flex-1 min-h-0 overflow-hidden pt-20" : "flex-1 pt-20"}>
        {renderMainContent()}
      </div>
      <CryptoPriceTicker prices={prices} dir={dir} onSymbolClick={handleSymbolClick} />
    </div>
  )
}
