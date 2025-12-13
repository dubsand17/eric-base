'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { TwitterPost } from '@/lib/supabase'
import { formatDistanceToNow, format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import ImageModal from '@/components/features/image/ImageModal'
import { Timer, Eye, Calendar, ArrowSquareOut } from 'phosphor-react'

interface TwitterCardProps {
  post: TwitterPost
  showAbsoluteTime?: boolean
  onToggleTimeFormat?: () => void
}

export default function TwitterCard({ post, showAbsoluteTime = false, onToggleTimeFormat }: TwitterCardProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
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
    onToggleTimeFormat?.()
  }

  return (
    <>
      <div className="glass-light dark:glass-dark rounded-2xl border border-terminal-border-light dark:border-terminal-border-dark overflow-hidden hover:shadow-soft-md hover:border-terminal-borderHover-light dark:hover:border-terminal-borderHover-dark transition-all-gentle hover:scale-[1.005] active:scale-[0.998]">
        {/* 内容 */}
        <div className="p-5">
          <p
            className={`text-terminal-text-primary-light dark:text-terminal-text-primary-dark text-sm leading-relaxed whitespace-pre-wrap mb-3 font-normal image-only-mode:hidden ${post.images && post.images.length > 0 ? 'cursor-pointer hover:text-terminal-secondary-light dark:hover:text-terminal-secondary-dark transition-colors-gentle' : ''
              }`}
            onClick={handleContentClick}
            title={post.images && post.images.length > 0 ? '点击查看图片' : ''}
          >
            {post.content}
          </p>

          {/* 发布时间和原链接 */}
          <div className="flex items-center justify-between text-xs text-terminal-text-secondary-light dark:text-terminal-text-secondary-dark">
            <button
              onClick={toggleTimeFormat}
              className="flex items-center space-x-1 hover:text-terminal-text-primary-light dark:hover:text-terminal-text-primary-dark transition-colors-gentle cursor-pointer"
              title="点击切换时间格式"
            >
              {showAbsoluteTime ? (
                <Calendar className="w-3.5 h-3.5" weight="duotone" />
              ) : (
                <Timer className="w-3.5 h-3.5" weight="duotone" />
              )}
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
                <div className="flex items-center space-x-1 text-terminal-text-tertiary-light dark:text-terminal-text-tertiary-dark">
                  <Eye className="w-3.5 h-3.5" weight="duotone" />
                  <span className="text-xs font-medium">{viewCount}</span>
                </div>
              )}
              {post.tweet_url && (
                <a
                  href={post.tweet_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-0.5 hover:text-terminal-accent-light dark:hover:text-terminal-accent-dark transition-colors-gentle font-medium"
                >
                  <span>查看原文</span>
                  <ArrowSquareOut className="w-3.5 h-3.5" weight="duotone" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 图片 */}
        {post.images && post.images.length > 0 && (
          <div className="px-5 pb-5">
            <div className={`flex flex-col gap-2 ${post.images.length === 1 ? '' :
              post.images.length === 2 ? 'sm:grid sm:grid-cols-2' :
                post.images.length === 3 ? 'sm:grid sm:grid-cols-2' :
                  'sm:grid sm:grid-cols-2'
              }`}>
              {post.images.map((image, index) => (
                <div
                  key={index}
                  className={`relative rounded-lg overflow-hidden cursor-pointer hover:opacity-95 transition-opacity ${post.images.length === 3 && index === 0 ? 'sm:row-span-2' : ''
                    }`}
                  onClick={() => handleImageClick(image)}
                >
                  <Image
                    src={image}
                    alt={`图片 ${index + 1}`}
                    width={800}
                    height={600}
                    className="w-full h-auto object-contain rounded-lg animate-fade-in"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{
                      maxHeight: post.images.length === 1 ? '320px' : '200px'
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-5 transition-all duration-200 rounded-lg" />
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