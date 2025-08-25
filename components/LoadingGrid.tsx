import SkeletonCard from './SkeletonCard'

export default function LoadingGrid() {
  return (
    <div className="masonry-grid w-full">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="masonry-item">
          <SkeletonCard />
        </div>
      ))}
    </div>
  )
} 