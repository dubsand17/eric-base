'use client'

import { useRouter, usePathname } from 'next/navigation'
import { GridFour, Shuffle } from 'phosphor-react'
import { useState, useEffect } from 'react'

export default function ModeToggle() {
    const router = useRouter()
    const pathname = usePathname()
    const isWanderMode = pathname === '/wander'
    const [isPrefetched, setIsPrefetched] = useState(false)
    const [isTransitioning, setIsTransitioning] = useState(false)

    // 预加载目标页面
    useEffect(() => {
        if (!isPrefetched) {
            router.prefetch(isWanderMode ? '/' : '/wander')
            setIsPrefetched(true)
        }
    }, [router, isWanderMode, isPrefetched])

    const handleToggle = () => {
        // 先触发过渡动画
        setIsTransitioning(true)

        // 300ms 后执行导航（等待缩放动画完成一半）
        setTimeout(() => {
            if (isWanderMode) {
                router.push('/')
            } else {
                router.push('/wander')
            }
        }, 300)

        // 600ms 后重置状态（等待完整动画结束）
        setTimeout(() => {
            setIsTransitioning(false)
        }, 600)
    }

    return (
        <>
            {/* 全屏遮罩 - 缩放+淡入淡出效果 */}
            <div
                className={`fixed inset-0 bg-terminal-bg-light dark:bg-terminal-bg-dark z-50 transition-all duration-500 ease-in-out ${isTransitioning
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-95 pointer-events-none'
                    }`}
            />

            <button
                onClick={handleToggle}
                disabled={isTransitioning}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:bg-terminal-state-hover-light dark:hover:bg-terminal-state-hover-dark transition-all-gentle active:scale-95 disabled:opacity-50"
                title={isWanderMode ? '切换到正常模式' : '切换到漫步模式'}
            >
                {isWanderMode ? (
                    <GridFour className="w-4 h-4" weight="duotone" />
                ) : (
                    <Shuffle className="w-4 h-4" weight="duotone" />
                )}
            </button>
        </>
    )
}
