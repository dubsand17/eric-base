export default function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
      {/* 内容骨架 */}
      <div className="p-6">
        <div className="space-y-3 mb-4">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
        
        {/* 时间骨架 */}
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
      </div>

      {/* 图片骨架 */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
          <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
        </div>
      </div>
    </div>
  )
} 