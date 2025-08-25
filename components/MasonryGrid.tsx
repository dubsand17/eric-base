'use client'

import { useEffect, useRef } from 'react'
import TwitterCard from './TwitterCard'
import { TwitterPost } from '@/lib/supabase'

interface MasonryGridProps {
  posts: TwitterPost[]
}

export default function MasonryGrid({ posts }: MasonryGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (gridRef.current) {
        // 触发重新布局，但保持 column 布局
        gridRef.current.style.display = 'none'
        gridRef.current.offsetHeight // 强制重排
        gridRef.current.style.display = 'block'
      }
    })

    if (gridRef.current) {
      resizeObserver.observe(gridRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div 
      ref={gridRef}
      className="masonry-grid w-full px-4 py-8"
    >
      {posts.map((post) => (
        <div key={post.id} className="masonry-item">
          <TwitterCard post={post} />
        </div>
      ))}
    </div>
  )
} 