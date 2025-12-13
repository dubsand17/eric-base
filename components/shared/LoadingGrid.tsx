import { useEffect, useMemo, useState } from 'react'
import SkeletonCard from '@/components/posts/SkeletonCard'

interface LoadingGridProps {
  count?: number
}

function getColumnCount(width: number): number {
  if (width <= 640) return 1
  if (width <= 1024) return 2
  if (width <= 1400) return 3
  return 4
}

export default function LoadingGrid({ count = 12 }: LoadingGridProps) {
  // 初始列数设为 4，首帧在大屏占满；挂载后根据窗口更新
  const [colCount, setColCount] = useState<number>(4)

  useEffect(() => {
    const onResize = () => setColCount(getColumnCount(window.innerWidth))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const columns = useMemo(() => {
    const cols: number[][] = Array.from({ length: colCount }, () => [])
    const items = Array.from({ length: count }, (_, i) => i)
    items.forEach((i) => {
      cols[i % colCount].push(i)
    })
    return cols
  }, [count, colCount])

  return (
    <div className="w-full px-4 py-2 md:py-3">
      <div className={'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'}>
        {columns.map((col, colIndex) => (
          <div key={`sk-col-${colIndex}`} className="flex flex-col gap-4">
            {col.map((i) => (
              <SkeletonCard key={`sk-${i}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}