'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { TwitterPost, PostGroup } from '@/lib/supabase'
import { formatDistanceToNow, format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { ArrowLeft, ArrowSquareOut, ChatCircle, ArrowsClockwise, Heart, Eye, PencilSimple, Check, X, Trash, FolderPlus } from 'phosphor-react'
import ImageModal from '@/components/features/image/ImageModal'
import GroupSelectorModal from '@/components/features/posts/GroupSelectorModal'

function PostContent({ content, isActive }: { content: string; isActive: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const contentRef = useRef<HTMLParagraphElement>(null)
  const [isClamped, setIsClamped] = useState(false)

  useEffect(() => {
    if (contentRef.current) {
      setIsClamped(contentRef.current.scrollHeight > contentRef.current.clientHeight + 1)
    }
  }, [content])

  return (
    <div>
      <p
        ref={contentRef}
        className={`whitespace-pre-wrap ${expanded ? '' : 'line-clamp-3'}`}
      >
        {content}
      </p>
      {(isClamped || expanded) && (
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
          className={`mt-1 text-xs font-medium transition-colors ${
            isActive
              ? 'text-terminal-accent-light dark:text-terminal-accent-dark'
              : 'text-terminal-text-muted-light dark:text-terminal-text-muted-dark hover:text-terminal-text-primary-light dark:hover:text-terminal-text-primary-dark'
          }`}
        >
          {expanded ? '收起' : '展开全文'}
        </button>
      )}
    </div>
  )
}

interface GroupDetailViewProps {
  groupId: string
}

export default function GroupDetailView({ groupId }: GroupDetailViewProps) {
  const [group, setGroup] = useState<PostGroup | null>(null)
  const [posts, setPosts] = useState<TwitterPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)
  const [groupModalOpen, setGroupModalOpen] = useState(false)
  const [movingPostId, setMovingPostId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/groups/${groupId}`)
        if (!res.ok) throw new Error('加载分组失败')
        const data = await res.json()
        setGroup(data.group)
        setPosts(data.posts || [])
        if (data.posts?.length > 0) {
          setSelectedPostId(data.posts[0].id)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [groupId])

  const selectedPost = posts.find(p => p.id === selectedPostId) || null

  const startRename = () => {
    setRenameValue(group?.title || '')
    setIsRenaming(true)
    setTimeout(() => renameInputRef.current?.focus(), 50)
  }

  const submitRename = async () => {
    if (!group) return
    const newTitle = renameValue.trim()
    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle || null })
      })
      if (res.ok) {
        setGroup({ ...group, title: newTitle || null })
      }
    } catch (err) {
      console.error('重命名失败:', err)
    }
    setIsRenaming(false)
  }

  const cancelRename = () => {
    setIsRenaming(false)
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('确定删除这条推文？')) return
    try {
      const res = await fetch(`/api/posts?id=${postId}`, { method: 'DELETE' })
      if (res.ok) {
        const newPosts = posts.filter(p => p.id !== postId)
        setPosts(newPosts)
        if (selectedPostId === postId) {
          setSelectedPostId(newPosts[0]?.id || null)
        }
      }
    } catch (err) {
      console.error('删除失败:', err)
    }
  }

  const handleOpenMoveGroup = (postId: string) => {
    setMovingPostId(postId)
    setGroupModalOpen(true)
  }

  const handleMoveToGroup = async (targetGroupId: string) => {
    if (!movingPostId) return
    try {
      const res = await fetch('/api/posts/assign-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: movingPostId, group_id: targetGroupId })
      })
      if (res.ok) {
        const newPosts = posts.filter(p => p.id !== movingPostId)
        setPosts(newPosts)
        if (selectedPostId === movingPostId) {
          setSelectedPostId(newPosts[0]?.id || null)
        }
      }
    } catch (err) {
      console.error('移动分组失败:', err)
    }
    setGroupModalOpen(false)
    setMovingPostId(null)
  }

  const handleCreateNewGroupAndMove = async (title: string) => {
    if (!movingPostId) return
    const post = posts.find(p => p.id === movingPostId)
    const coverImage = post?.images?.[0] || group?.cover_image || ''
    try {
      const groupRes = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cover_image: coverImage, title })
      })
      if (groupRes.ok) {
        const newGroup = await groupRes.json()
        await handleMoveToGroup(newGroup.id)
      }
    } catch (err) {
      console.error('创建分组失败:', err)
      setGroupModalOpen(false)
      setMovingPostId(null)
    }
  }

  const formatNumber = (num: number | undefined) => {
    if (!num || num === 0) return '0'
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-terminal-bg-light dark:bg-terminal-bg-dark flex items-center justify-center">
        <div className="text-terminal-text-secondary-light dark:text-terminal-text-secondary-dark text-sm">
          加载中...
        </div>
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-terminal-bg-light dark:bg-terminal-bg-dark flex flex-col items-center justify-center gap-4">
        <p className="text-terminal-text-secondary-light dark:text-terminal-text-secondary-dark text-sm">
          {error || '分组不存在'}
        </p>
        <Link
          href="/"
          className="text-sm text-terminal-accent-light dark:text-terminal-accent-dark hover:underline"
        >
          返回首页
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-terminal-bg-light dark:bg-terminal-bg-dark flex flex-col">
      {/* 顶部 */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-terminal-border-light dark:border-terminal-border-dark">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-terminal-text-secondary-light dark:text-terminal-text-secondary-dark hover:text-terminal-text-primary-light dark:hover:text-terminal-text-primary-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" weight="bold" />
          <span>返回</span>
        </Link>
        {isRenaming ? (
          <div className="flex items-center gap-1.5">
            <input
              ref={renameInputRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitRename(); if (e.key === 'Escape') cancelRename(); }}
              className="text-sm font-medium bg-transparent border-b border-terminal-accent-light dark:border-terminal-accent-dark text-terminal-text-primary-light dark:text-terminal-text-primary-dark outline-none px-1 py-0.5 w-48"
              placeholder="输入主题名称"
            />
            <button onClick={submitRename} className="text-terminal-accent-light dark:text-terminal-accent-dark hover:opacity-80 transition-opacity">
              <Check className="w-4 h-4" weight="bold" />
            </button>
            <button onClick={cancelRename} className="text-terminal-text-muted-light dark:text-terminal-text-muted-dark hover:opacity-80 transition-opacity">
              <X className="w-4 h-4" weight="bold" />
            </button>
          </div>
        ) : (
          <button
            onClick={startRename}
            className="flex items-center gap-1.5 group/rename"
          >
            <h1 className="text-sm font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark">
              {group.title || '未命名主题'}
            </h1>
            <PencilSimple className="w-3.5 h-3.5 text-terminal-text-muted-light dark:text-terminal-text-muted-dark opacity-0 group-hover/rename:opacity-100 transition-opacity" weight="duotone" />
          </button>
        )}
        <span className="text-xs text-terminal-text-muted-light dark:text-terminal-text-muted-dark">
          {posts.length} 条推文
        </span>
      </div>

      {/* 主内容 master-detail */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* 左侧：时间线 */}
        <div className="lg:w-[400px] xl:w-[440px] lg:border-r border-terminal-border-light dark:border-terminal-border-dark overflow-y-auto no-scrollbar">
          <div className="p-4">
            {posts.map((post, index) => {
              const isActive = post.id === selectedPostId
              const isLast = index === posts.length - 1

              return (
                <div
                  key={post.id}
                  className="flex gap-3 cursor-pointer group"
                  onClick={() => setSelectedPostId(post.id)}
                >
                  {/* 时间线轨道 */}
                  <div className="flex flex-col items-center flex-shrink-0 w-4">
                    {/* 圆点 */}
                    <div
                      className={`w-3 h-3 rounded-full border-2 mt-1 transition-colors ${
                        isActive
                          ? 'bg-terminal-accent-light dark:bg-terminal-accent-dark border-terminal-accent-light dark:border-terminal-accent-dark'
                          : 'bg-transparent border-terminal-border-light dark:border-terminal-border-dark group-hover:border-terminal-text-secondary-light dark:group-hover:border-terminal-text-secondary-dark'
                      }`}
                    />
                    {/* 连接线 */}
                    {!isLast && (
                      <div className="w-px flex-1 bg-terminal-border-light dark:bg-terminal-border-dark mt-1" />
                    )}
                  </div>

                  {/* 内容 */}
                  <div className={`flex-1 pb-6 ${isLast ? 'pb-2' : ''}`}>
                    {/* 时间 */}
                    <div className="text-xs text-terminal-text-muted-light dark:text-terminal-text-muted-dark mb-1">
                      {post.tweet_created_at
                        ? format(new Date(post.tweet_created_at), 'yyyy/MM/dd HH:mm', { locale: zhCN })
                        : ''}
                    </div>

                    {/* 文案 */}
                    <div
                      className={`text-sm leading-relaxed rounded-xl p-3 transition-all ${
                        isActive
                          ? 'glass-active-light dark:glass-active-dark text-terminal-text-primary-light dark:text-terminal-text-primary-dark'
                          : 'text-terminal-text-secondary-light dark:text-terminal-text-secondary-dark hover:text-terminal-text-primary-light dark:hover:text-terminal-text-primary-dark'
                      }`}
                    >
                      <PostContent content={post.content} isActive={isActive} />

                      {/* 互动数据 */}
                      <div className="flex items-center gap-3 mt-2 text-xs text-terminal-text-muted-light dark:text-terminal-text-muted-dark">
                        <span className="flex items-center gap-0.5">
                          <ChatCircle className="w-3 h-3" weight="duotone" />
                          {formatNumber(post.comment_count)}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <ArrowsClockwise className="w-3 h-3" weight="duotone" />
                          {formatNumber(post.retweet_count)}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Heart className="w-3 h-3" weight="duotone" />
                          {formatNumber(post.like_count)}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Eye className="w-3 h-3" weight="duotone" />
                          {formatNumber(post.view_count)}
                        </span>
                        {post.tweet_url && (
                          <a
                            href={post.tweet_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-0.5 hover:text-terminal-accent-light dark:hover:text-terminal-accent-dark ml-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            原文
                            <ArrowSquareOut className="w-3 h-3" weight="duotone" />
                          </a>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id) }}
                          className="flex items-center gap-0.5 hover:text-red-500 ml-1 transition-colors"
                          title="删除推文"
                        >
                          <Trash className="w-3 h-3" weight="duotone" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenMoveGroup(post.id) }}
                          className="flex items-center gap-0.5 hover:text-terminal-accent-light dark:hover:text-terminal-accent-dark ml-1 transition-colors"
                          title="移动到其他分组"
                        >
                          <FolderPlus className="w-3 h-3" weight="duotone" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 右侧：固定主题图 */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
          <div
            className="relative max-w-full max-h-full cursor-pointer"
            onClick={() => setShowImageModal(true)}
          >
            <Image
              src={group.cover_image}
              alt={group.title || '主题图片'}
              width={1200}
              height={900}
              className="rounded-2xl object-contain animate-fade-in max-h-[calc(100vh-120px)]"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
            />
          </div>
        </div>
      </div>

      {/* 图片查看模态框 */}
      <ImageModal
        isOpen={showImageModal}
        imageUrl={group.cover_image}
        images={[group.cover_image]}
        content={selectedPost?.content || ''}
        tweetUrl={selectedPost?.tweet_url}
        tweetCreatedAt={selectedPost?.tweet_created_at}
        onClose={() => setShowImageModal(false)}
      />

      {/* 分组选择模态框 */}
      <GroupSelectorModal
        isOpen={groupModalOpen}
        onClose={() => { setGroupModalOpen(false); setMovingPostId(null) }}
        onSelect={handleMoveToGroup}
        onCreateNew={handleCreateNewGroupAndMove}
      />
    </div>
  )
}
