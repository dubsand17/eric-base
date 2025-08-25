export default function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#0d1117] rounded-lg shadow-sm border border-gray-200/60 dark:border-gray-800/60 overflow-hidden animate-pulse">
      {/* 内容骨架 */}
      <div className="p-4">
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-gray-200/80 dark:bg-gray-700/80 rounded w-full"></div>
          <div className="h-4 bg-gray-200/80 dark:bg-gray-700/80 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200/80 dark:bg-gray-700/80 rounded w-3/4"></div>
        </div>
        
        {/* 时间和链接骨架 */}
        <div className="flex items-center justify-between">
          <div className="h-3 bg-gray-200/60 dark:bg-gray-700/60 rounded w-16"></div>
          <div className="h-3 bg-gray-200/60 dark:bg-gray-700/60 rounded w-12"></div>
        </div>
      </div>

      {/* 图片骨架 */}
      <div className="px-4 pb-4">
        <div className="flex flex-col gap-2">
          <div className="aspect-[4/3] bg-gray-200/60 dark:bg-gray-700/60 rounded-md"></div>
        </div>
      </div>
    </div>
  )
} 