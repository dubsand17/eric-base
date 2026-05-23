'use client'

import { useEffect, useState, useLayoutEffect, useRef, useMemo } from 'react'
import GroupCard from './GroupCard'
import type { PostGroup } from '@/lib/supabase'

interface GroupsGridProps {
  containerWidth?: number
}

function getColumnCount(width: number | undefined): number {
  if (!width) {
    if (typeof window === 'undefined') return 1
    width = window.innerWidth
  }
  if (width < 640) return 1
  if (width < 960) return 2
  if (width < 1280) return 3
  if (width < 1920) return 4
  return Math.min(6, Math.floor(width / 320))
}

export default function GroupsGrid({ containerWidth }: GroupsGridProps) {
  const [groups, setGroups] = useState<PostGroup[]>([])
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const [colCount, setColCount] = useState<number>(() => {
    if (typeof window !== 'undefined') return getColumnCount(window.innerWidth)
    return 4
  })

  useLayoutEffect(() => {
    const update = () => {
      let w: number | undefined
      if (containerWidth !== undefined && containerWidth > 0) w = containerWidth
      else if (containerRef.current) w = containerRef.current.offsetWidth
      else if (typeof window !== 'undefined') w = window.innerWidth
      if (w) setColCount(prev => { const n = getColumnCount(w); return n !== prev ? n : prev })
    }
    update()
    if (containerWidth !== undefined) return
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [containerWidth])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/groups')
        if (!res.ok) throw new Error('Failed to fetch groups')
        const result = await res.json()
        setGroups(result.data || [])
      } catch (err) {
        console.error('Error fetching groups:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const columns = useMemo(() => {
    const cols: PostGroup[][] = Array.from({ length: colCount }, () => [])
    groups.forEach((g, i) => cols[i % colCount].push(g))
    return cols
  }, [groups, colCount])

  if (loading) {
    // 占位，避免布局跳动
    return (
      <div className="w-full px-4 py-2 md:py-3">
        <div className="mb-3">
          <div className="h-4 w-20 rounded bg-terminal-border-light dark:bg-terminal-border-dark animate-pulse" />
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}>
          {Array.from({ length: colCount }).map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-2xl bg-terminal-border-light dark:bg-terminal-border-dark animate-pulse" />
          ))}
        </div>
      </div>
    )
  }
  if (groups.length === 0) return null

  return (
    <div ref={containerRef} className="w-full px-4 py-2 md:py-3 overflow-hidden">
      <div className="mb-3">
        <h2 className="text-sm font-medium text-terminal-text-secondary-light dark:text-terminal-text-secondary-dark">
          主题分组
        </h2>
      </div>
      <div
        className="grid gap-4 overflow-hidden"
        style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
      >
        {columns.map((col, colIndex) => (
          <div key={`gcol-${colIndex}`} className="flex flex-col gap-4">
            {col.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
