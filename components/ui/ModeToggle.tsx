'use client'

import { useRouter, usePathname } from 'next/navigation'
import { GridFour, Shuffle } from 'phosphor-react'

export default function ModeToggle() {
    const router = useRouter()
    const pathname = usePathname()
    const isWanderMode = pathname === '/wander'

    const handleToggle = () => {
        if (isWanderMode) {
            router.push('/')
        } else {
            router.push('/wander')
        }
    }

    return (
        <button
            onClick={handleToggle}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:bg-terminal-state-hover-light dark:hover:bg-terminal-state-hover-dark transition-all-gentle active:scale-95"
            title={isWanderMode ? '切换到正常模式' : '切换到漫步模式'}
        >
            {isWanderMode ? (
                <GridFour className="w-4 h-4" weight="duotone" />
            ) : (
                <Shuffle className="w-4 h-4" weight="duotone" />
            )}
        </button>
    )
}
