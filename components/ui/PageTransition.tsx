'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [isTransitioning, setIsTransitioning] = useState(false)

    useEffect(() => {
        // 页面切换时触发过渡
        setIsTransitioning(true)
        const timer = setTimeout(() => {
            setIsTransitioning(false)
        }, 300)

        return () => clearTimeout(timer)
    }, [pathname])

    return (
        <div
            className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'
                }`}
        >
            {children}
        </div>
    )
}
