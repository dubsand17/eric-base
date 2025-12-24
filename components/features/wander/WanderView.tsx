'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { TwitterPost } from '@/lib/supabase'
import WanderCard from './WanderCard'
import WanderControls from './WanderControls'
import LoadingState from '@/components/shared/LoadingState'
import BrandBadge from '@/components/layout/BrandBadge'
import ThemeToggle from '@/components/ui/ThemeToggle'

interface WanderViewProps {
    initialPosts: TwitterPost[]
    totalCount: number
}

export default function WanderView({ initialPosts, totalCount }: WanderViewProps) {
    const router = useRouter()
    const [posts, setPosts] = useState<TwitterPost[]>(initialPosts)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [history, setHistory] = useState<number[]>([0])
    const [viewedIndices, setViewedIndices] = useState<Set<number>>(new Set([0])) // 追踪已查看的索引
    const [isLoading, setIsLoading] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)
    const [showAbsoluteTime, setShowAbsoluteTime] = useState(false)

    // 当前显示的 Post
    const currentPost = posts[currentIndex]

    // 预加载更多数据（每次加载20条）
    const loadMorePosts = useCallback(async () => {
        if (isLoading || posts.length >= totalCount) return

        setIsLoading(true)
        try {
            const response = await fetch(`/api/posts?random=true&limit=20&offset=${posts.length}`)
            const result = await response.json()
            if (result.data && result.data.length > 0) {
                setPosts(prev => [...prev, ...result.data])
                console.log(`✓ Loaded ${result.data.length} more posts, total: ${posts.length + result.data.length}`)
            }
        } catch (error) {
            console.error('Failed to load more posts:', error)
        } finally {
            setIsLoading(false)
        }
    }, [isLoading, posts.length, totalCount])

    // 检查是否需要预加载
    const checkAndPreload = useCallback(() => {
        const viewedCount = viewedIndices.size
        const availableCount = posts.length

        // 当已查看数量达到可用数量的80%时，预加载下一批
        if (viewedCount >= availableCount * 0.8 && !isLoading && availableCount < totalCount) {
            console.log(`Preloading: viewed ${viewedCount}/${availableCount} posts`)
            loadMorePosts()
        }
    }, [viewedIndices.size, posts.length, totalCount, isLoading, loadMorePosts])

    // 随机切换
    const handleShuffle = useCallback(() => {
        if (posts.length === 0) return

        setIsAnimating(true)
        setTimeout(() => {
            // 生成一个不同于当前的随机索引
            let newIndex
            do {
                newIndex = Math.floor(Math.random() * posts.length)
            } while (newIndex === currentIndex && posts.length > 1)

            setCurrentIndex(newIndex)
            setHistory(prev => [...prev, newIndex])
            setViewedIndices(prev => {
                const newSet = new Set(prev)
                newSet.add(newIndex)
                return newSet
            })
            setIsAnimating(false)
        }, 300)
    }, [posts.length, currentIndex])

    // 监听 viewedIndices 变化，触发预加载检查
    useEffect(() => {
        checkAndPreload()
    }, [checkAndPreload])

    // 上一条
    const handlePrevious = useCallback(() => {
        if (history.length <= 1) return

        setIsAnimating(true)
        setTimeout(() => {
            const newHistory = [...history]
            newHistory.pop() // 移除当前
            const previousIndex = newHistory[newHistory.length - 1]
            setCurrentIndex(previousIndex)
            setHistory(newHistory)
            setIsAnimating(false)
        }, 300)
    }, [history])

    // 退出
    const handleExit = useCallback(() => {
        router.push('/')
    }, [router])

    // 键盘快捷键
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isAnimating) return

            switch (e.key) {
                case ' ':
                case 'Spacebar':
                    e.preventDefault()
                    handleShuffle()
                    break
                case 'ArrowLeft':
                    e.preventDefault()
                    handlePrevious()
                    break
                case 'Escape':
                    e.preventDefault()
                    handleExit()
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleShuffle, handlePrevious, handleExit, isAnimating])

    if (!currentPost) {
        return <LoadingState />
    }

    return (
        <div className="min-h-screen bg-terminal-bg-light dark:bg-terminal-bg-dark flex items-center justify-center p-4">
            {/* BrandBadge - 左上角 */}
            <BrandBadge />

            {/* ThemeToggle - 右上角 */}
            <div className="fixed top-4 right-4 z-40 hidden md:flex">
                <div className="px-2 py-2 rounded-xl backdrop-blur-sm">
                    <ThemeToggle className="h-9 w-9" />
                </div>
            </div>

            {/* 卡片容器 - 带动画 */}
            <div
                className={`transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                    }`}
            >
                <WanderCard
                    key={currentPost.id}
                    post={currentPost}
                    showAbsoluteTime={showAbsoluteTime}
                    onToggleTimeFormat={() => setShowAbsoluteTime(v => !v)}
                />
            </div>

            {/* 控制按钮 */}
            <WanderControls
                onShuffle={handleShuffle}
                onPrevious={handlePrevious}
                onExit={handleExit}
                canGoPrevious={history.length > 1}
                totalViewed={history.length}
            />

            {/* 加载指示器 */}
            {isLoading && (
                <div className="fixed top-4 right-4 glass-light dark:glass-dark rounded-full px-4 py-2 border border-terminal-border-light dark:border-terminal-border-dark shadow-soft-md">
                    <span className="text-xs text-terminal-text-secondary-light dark:text-terminal-text-secondary-dark font-medium">
                        加载中...
                    </span>
                </div>
            )}
        </div>
    )
}
