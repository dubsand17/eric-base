'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { TwitterPost } from '@/lib/supabase'
import { formatDistanceToNow, format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { ArrowSquareOut, Eye, Timer, Calendar } from 'phosphor-react'

interface WanderCardProps {
  post: TwitterPost
  showAbsoluteTime?: boolean
  onToggleTimeFormat?: () => void
}

export default function WanderCard({ post, showAbsoluteTime = false, onToggleTimeFormat }: WanderCardProps) {
  const [viewCount, setViewCount] = useState<number>(0)

  // 初始化查看次数
  useEffect(() => {
    const count = parseInt(localStorage.getItem(`view_count_${post.id}`) || '0')
    setViewCount(count)
  }, [post.id])

  const firstImage = post.images && post.images.length > 0 ? post.images[0] : null

  return (
    <div
      className="relative glass-light dark:glass-dark rounded-2xl border border-terminal-border-light dark:border-terminal-border-dark overflow-hidden"
      style={{
        width: 'fit-content',
        boxShadow: '0px 4px 6px -4px rgba(0,0,0,0.05), 0px 6px 11px rgba(0,0,0,0.05)'
      }}
    >
      {/* 左上角蓝色短竖线 */}
      <div className="absolute top-6 left-0 w-0.5 h-6 bg-blue-500 dark:bg-blue-600 rounded-sm" />

      {/* 主容器 - 左右布局 */}
      <div className="flex p-4 gap-4 items-stretch">
        {/* 左侧文字区域 - 米黄色背景（日间）/ 深棕灰色背景（夜间） */}
        <div
          className="flex flex-col overflow-hidden rounded-xl p-4 pt-4"
          style={{
            background: 'var(--wander-card-bg)',
            width: '320px',
            maxHeight: '50vh'
          }}
        >
          <style jsx>{`
            div {
              --wander-card-bg: #FCF6EA;
            }
            :global(.dark) div {
              --wander-card-bg: #1a1512;
            }
          `}</style>

          {/* 文字内容 - 隐藏滚动条但保留滚动功能 */}
          <div className="flex-1 overflow-y-auto mb-4 scrollbar-hide">
            <p className="text-gray-800 dark:text-gray-300 text-base leading-relaxed whitespace-pre-wrap font-normal">
              {post.content}
            </p>
          </div>

          {/* 底部信息 */}
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 flex-shrink-0 pt-2 border-t border-gray-400/30 dark:border-gray-600/30">
            {/* 时间显示 - 支持切换格式 */}
            <div
              onClick={onToggleTimeFormat}
              className="flex items-center space-x-1 hover:text-gray-800 dark:hover:text-gray-200 transition-colors-gentle cursor-pointer"
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
            </div>
            <div className="flex items-center space-x-2">
              {/* 查看次数 */}
              {viewCount > 0 && (
                <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-500">
                  <Eye className="w-3.5 h-3.5" weight="duotone" />
                  <span className="text-xs font-medium">{viewCount}</span>
                </div>
              )}
              {/* 原文链接 */}
              {post.tweet_url && (
                <a
                  href={post.tweet_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-0.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors-gentle font-medium"
                >
                  <span>原文</span>
                  <ArrowSquareOut className="w-3.5 h-3.5" weight="duotone" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 中间虚线分割 - 日间模式 */}
        {firstImage && (
          <>
            <div
              className="w-px flex-shrink-0 dark:hidden"
              style={{
                backgroundImage: 'repeating-linear-gradient(to bottom, rgba(0, 0, 0, 0.15) 0px, rgba(0, 0, 0, 0.15) 8px, transparent 8px, transparent 16px)'
              }}
            />
            <div
              className="w-px flex-shrink-0 hidden dark:block"
              style={{
                backgroundImage: 'repeating-linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 0px, rgba(255, 255, 255, 0.3) 8px, transparent 8px, transparent 16px)'
              }}
            />
          </>
        )}

        {/* 右侧图片区域 - 动态适配宽窄图片 */}
        {firstImage && (
          <div
            className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800"
            style={{
              height: '50vh',
              width: 'auto',
              minWidth: '300px'
            }}
          >
            <Image
              src={firstImage}
              alt="推文图片"
              width={800}
              height={600}
              className="object-contain h-full w-auto"
              style={{
                maxHeight: '50vh'
              }}
              priority
            />
          </div>
        )}
      </div>
    </div>
  )
}
