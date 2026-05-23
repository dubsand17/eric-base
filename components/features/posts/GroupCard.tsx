'use client'

import Image from 'next/image'
import Link from 'next/link'
import { PostGroup } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Files } from 'phosphor-react'

interface GroupCardProps {
  group: PostGroup
}

export default function GroupCard({ group }: GroupCardProps) {
  return (
    <Link href={`/group/${group.id}`}>
      <div className="glass-light dark:glass-dark rounded-2xl border border-terminal-border-light dark:border-terminal-border-dark overflow-hidden hover:shadow-soft-md hover:border-terminal-borderHover-light dark:hover:border-terminal-borderHover-dark transition-all-gentle hover:scale-[1.005] active:scale-[0.998] cursor-pointer">
        {/* 封面图 */}
        <div className="relative">
          <Image
            src={group.cover_image}
            alt={group.title || '主题'}
            width={800}
            height={600}
            className="w-full h-auto object-contain animate-fade-in"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ maxHeight: '320px' }}
          />
          {/* 推文计数角标 */}
          {(group.post_count ?? 0) > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
              <Files className="w-3.5 h-3.5" weight="duotone" />
              <span>{group.post_count}</span>
            </div>
          )}
        </div>

        {/* 信息 */}
        <div className="p-4">
          {group.title && (
            <h3 className="text-sm font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark truncate mb-1">
              {group.title}
            </h3>
          )}
          {group.latest_post_at && (
            <p className="text-xs text-terminal-text-secondary-light dark:text-terminal-text-secondary-dark">
              {formatDistanceToNow(new Date(group.latest_post_at), {
                addSuffix: true,
                locale: zhCN
              })}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
