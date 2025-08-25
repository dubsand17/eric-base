'use client'

import { useState } from 'react'
import Image from 'next/image'
import { TwitterPost } from '@/lib/supabase'
import { formatDistanceToNow, format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import ImageModal from './ImageModal'
import { Clock } from 'lucide-react'

interface TwitterCardProps {
  post: TwitterPost
}

export default function TwitterCard({ post }: TwitterCardProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showAbsoluteTime, setShowAbsoluteTime] = useState(false)

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl)
  }

  const handleContentClick = () => {
    // 如果有图片，点击文字内容时打开第一张图片
    if (post.images && post.images.length > 0) {
      setSelectedImage(post.images[0])
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
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300">
        {/* 内容 */}
        <div className="p-6">
          <p 
            className={`text-gray-900 dark:text-gray-100 text-base leading-relaxed whitespace-pre-wrap mb-4 ${
              post.images && post.images.length > 0 ? 'cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors' : ''
            }`}
            onClick={handleContentClick}
            title={post.images && post.images.length > 0 ? '点击查看图片' : ''}
          >
            {post.content}
          </p>
          
          {/* 发布时间和原链接 */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <button
              onClick={toggleTimeFormat}
              className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer"
              title="点击切换时间格式"
            >
              <Clock className="w-4 h-4" />
              <span>
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
            {post.tweet_url && (
              <a
                href={post.tweet_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                <span>查看原文</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* 图片 */}
        {post.images && post.images.length > 0 && (
          <div className="px-6 pb-6">
            <div className={`flex flex-col gap-3 ${
              post.images.length === 1 ? '' :
              post.images.length === 2 ? 'sm:grid sm:grid-cols-2' :
              post.images.length === 3 ? 'sm:grid sm:grid-cols-2' :
              'sm:grid sm:grid-cols-2'
            }`}>
              {post.images.map((image, index) => (
                <div
                  key={index}
                  className={`relative bg-gray-100 dark:bg-gray-700 rounded-2xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity ${
                    post.images.length === 3 && index === 0 ? 'sm:row-span-2' : ''
                  }`}
                  onClick={() => handleImageClick(image)}
                >
                  <Image
                    src={image}
                    alt={`图片 ${index + 1}`}
                    width={800}
                    height={600}
                    className="w-full h-auto object-contain rounded-2xl"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{
                      maxHeight: post.images.length === 1 ? '500px' : '300px'
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 rounded-2xl" />
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