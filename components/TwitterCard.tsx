'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { TwitterPost } from '@/lib/supabase'
import { formatDistanceToNow, format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import ImageModal from './ImageModal'
import { Clock, Eye } from 'lucide-react'

interface TwitterCardProps {
  post: TwitterPost
}

export default function TwitterCard({ post }: TwitterCardProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showAbsoluteTime, setShowAbsoluteTime] = useState(false)
  const [viewCount, setViewCount] = useState<number>(0)

  // 初始化查看次数
  useEffect(() => {
    const count = parseInt(localStorage.getItem(`view_count_${post.id}`) || '0')
    setViewCount(count)
  }, [post.id])

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    
    // 记录点击查看大图的次数
    const key = `view_count_${post.id}`
    const currentCount = parseInt(localStorage.getItem(key) || '0')
    const newCount = currentCount + 1
    localStorage.setItem(key, newCount.toString())
    setViewCount(newCount)
  }

  const handleContentClick = () => {
    // 如果有图片，点击文字内容时打开第一张图片
    if (post.images && post.images.length > 0) {
      setSelectedImage(post.images[0])
      
      // 记录点击查看大图的次数
      const key = `view_count_${post.id}`
      const currentCount = parseInt(localStorage.getItem(key) || '0')
      const newCount = currentCount + 1
      localStorage.setItem(key, newCount.toString())
      setViewCount(newCount)
    }
  }

  const handleCloseModal = () => {
    setSelectedImage(null)
  }

  const toggleTimeFormat = () => {
    setShowAbsoluteTime(!showAbsoluteTime)
  }

  return (
    <>
      <div className="bg-white dark:bg-[#0d1117] rounded-lg shadow-sm border border-gray-200/60 dark:border-gray-800/60 overflow-hidden hover:shadow-lg hover:border-gray-300/60 dark:hover:border-gray-700/60 transition-all duration-200">
        {/* 内容 */}
        <div className="p-4">
          <p 
            className={`text-gray-900 dark:text-gray-100 text-sm leading-relaxed whitespace-pre-wrap mb-3 font-normal image-only-mode:hidden ${
              post.images && post.images.length > 0 ? 'cursor-pointer hover:text-violet-600 dark:hover:text-violet-400 transition-colors' : ''
            }`}
            onClick={handleContentClick}
            title={post.images && post.images.length > 0 ? '点击查看图片' : ''}
          >
            {post.content}
          </p>
          
          {/* 发布时间和原链接 */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <button
              onClick={toggleTimeFormat}
              className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer"
              title="点击切换时间格式"
            >
              <Clock className="w-3 h-3" />
              <span className="font-medium">
                {post.tweet_created_at && (
                  showAbsoluteTime 
                    ? format(new Date(post.tweet_created_at), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })
                    : formatDistanceToNow(new Date(post.tweet_created_at), {
                        addSuffix: true,
                        locale: zhCN
                      })
                )}
              </span>
            </button>
            <div className="flex items-center space-x-2">
              {/* 已读标记和查看次数 */}
              {viewCount > 0 && (
                <div className="flex items-center space-x-1 text-gray-400 dark:text-gray-500">
                  <Eye className="w-3 h-3" />
                  <span className="text-xs font-medium">{viewCount}</span>
                </div>
              )}
              {post.tweet_url && (
                <a
                  href={post.tweet_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-0.5 hover:text-violet-600 dark:hover:text-violet-400 transition-colors font-medium"
                >
                  <span>查看原文</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 图片 */}
        {post.images && post.images.length > 0 && (
          <div className="px-4 pb-4">
            <div className={`flex flex-col gap-2 ${
              post.images.length === 1 ? '' :
              post.images.length === 2 ? 'sm:grid sm:grid-cols-2' :
              post.images.length === 3 ? 'sm:grid sm:grid-cols-2' :
              'sm:grid sm:grid-cols-2'
            }`}>
              {post.images.map((image, index) => (
                <div
                  key={index}
                  className={`relative bg-gray-50 dark:bg-gray-900 rounded-md overflow-hidden cursor-pointer hover:opacity-95 transition-opacity ${
                    post.images.length === 3 && index === 0 ? 'sm:row-span-2' : ''
                  }`}
                  onClick={() => handleImageClick(image)}
                >
                  <Image
                    src={image}
                    alt={`图片 ${index + 1}`}
                    width={800}
                    height={600}
                    className="w-full h-auto object-contain rounded-md"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{
                      maxHeight: post.images.length === 1 ? '320px' : '200px'
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-5 transition-all duration-200 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 图片查看模态框 */}
      <ImageModal
        isOpen={!!selectedImage}
        imageUrl={selectedImage || ''}
        images={post.images}
        content={post.content}
        tweetUrl={post.tweet_url}
        tweetCreatedAt={post.tweet_created_at}
        onClose={handleCloseModal}
      />
    </>
  )
}