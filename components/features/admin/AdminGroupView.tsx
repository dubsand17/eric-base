'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import type { TwitterPost } from '@/lib/supabase'

interface GroupOption {
  id: string
  title: string
  cover_image: string
  post_count: number
}

export default function AdminGroupView() {
  const [posts, setPosts] = useState<TwitterPost[]>([])
  const [groups, setGroups] = useState<GroupOption[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [titleInput, setTitleInput] = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 加载未分组推文和已有分组
  useEffect(() => {
    async function load() {
      try {
        const [postsRes, groupsRes] = await Promise.all([
          fetch('/api/posts?pageSize=500&ungrouped=true'),
          fetch('/api/groups')
        ])
        const postsData = await postsRes.json()
        const groupsData = await groupsRes.json()
        setPosts(postsData.data || [])
        setGroups(groupsData.data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // 每切换到新卡片时聚焦输入框
  useEffect(() => {
    inputRef.current?.focus()
  }, [currentIndex])

  const currentPost = posts[currentIndex]

  const handleAssign = async (groupId: string) => {
    if (!currentPost || saving) return
    setSaving(true)
    try {
      // 关联推文到已有分组
      const res = await fetch('/api/posts/assign-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: currentPost.id, group_id: groupId })
      })
      if (res.ok) {
        // 更新分组计数
        setGroups(prev => prev.map(g =>
          g.id === groupId ? { ...g, post_count: g.post_count + 1 } : g
        ))
        goNext()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleNewGroup = async () => {
    if (!currentPost || !titleInput.trim() || saving) return
    const title = titleInput.trim()

    // 检查是否已有同名分组
    const existing = groups.find(g => g.title === title)
    if (existing) {
      await handleAssign(existing.id)
      setTitleInput('')
      return
    }

    setSaving(true)
    try {
      const coverImage = currentPost.images?.[0] || ''
      // 创建新分组 + 关联推文
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentPost,
          new_group: true,
          new_group_title: title,
          group_id: undefined
        })
      })

      // 直接用 assign-group API: 先建组，再关联
      const groupRes = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cover_image: coverImage, title })
      })

      if (groupRes.ok) {
        const newGroup = await groupRes.json()
        // 关联当前推文
        await fetch('/api/posts/assign-group', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ post_id: currentPost.id, group_id: newGroup.id })
        })

        setGroups(prev => [...prev, {
          id: newGroup.id,
          title,
          cover_image: coverImage,
          post_count: 1
        }])
        setTitleInput('')
        goNext()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const goNext = () => {
    setCurrentIndex(prev => Math.min(prev + 1, posts.length - 1))
    setTitleInput('')
  }

  const goPrev = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0))
    setTitleInput('')
  }

  const handleSkip = () => goNext()

  // 按标题筛选已有分组
  const filteredGroups = titleInput.trim()
    ? groups.filter(g => g.title?.toLowerCase().includes(titleInput.toLowerCase()))
    : groups.sort((a, b) => b.post_count - a.post_count).slice(0, 15)

  if (loading) {
    return (
      <div className="min-h-screen bg-terminal-bg-light dark:bg-terminal-bg-dark flex items-center justify-center text-terminal-text-secondary-light dark:text-terminal-text-secondary-dark">
        加载中...
      </div>
    )
  }

  if (!currentPost) {
    return (
      <div className="min-h-screen bg-terminal-bg-light dark:bg-terminal-bg-dark flex items-center justify-center text-terminal-text-secondary-light dark:text-terminal-text-secondary-dark">
        全部分组完成！🎉
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-terminal-bg-light dark:bg-terminal-bg-dark flex">
      {/* 左侧：当前推文 */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
        {/* 进度 */}
        <div className="text-xs text-terminal-text-muted-light dark:text-terminal-text-muted-dark">
          {currentIndex + 1} / {posts.length}
        </div>

        {/* 图片 */}
        {currentPost.images?.[0] && (
          <Image
            src={currentPost.images[0]}
            alt="推文图片"
            width={600}
            height={450}
            className="rounded-xl object-contain max-h-[50vh]"
            sizes="600px"
            priority
          />
        )}

        {/* 文案 */}
        <p className="text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark max-w-xl text-center line-clamp-3">
          {currentPost.content}
        </p>

        {/* 导航 */}
        <div className="flex gap-3">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="px-3 py-1.5 text-xs rounded-lg border border-terminal-border-light dark:border-terminal-border-dark text-terminal-text-secondary-light dark:text-terminal-text-secondary-dark disabled:opacity-30"
          >
            ← 上一条
          </button>
          <button
            onClick={handleSkip}
            className="px-3 py-1.5 text-xs rounded-lg border border-terminal-border-light dark:border-terminal-border-dark text-terminal-text-secondary-light dark:text-terminal-text-secondary-dark"
          >
            跳过 →
          </button>
        </div>
      </div>

      {/* 右侧：分组选择 */}
      <div className="w-[360px] border-l border-terminal-border-light dark:border-terminal-border-dark flex flex-col">
        {/* 输入新标题 */}
        <div className="p-4 border-b border-terminal-border-light dark:border-terminal-border-dark">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleNewGroup() }}
              placeholder="输入主题标题（或搜索已有）"
              className="flex-1 bg-transparent border border-terminal-border-light dark:border-terminal-border-dark rounded-lg px-3 py-2 text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark outline-none focus:border-terminal-accent-light dark:focus:border-terminal-accent-dark placeholder:text-terminal-text-muted-light dark:placeholder:text-terminal-text-muted-dark"
            />
            <button
              onClick={handleNewGroup}
              disabled={!titleInput.trim() || saving}
              className="px-3 py-2 text-xs rounded-lg bg-terminal-accent-light dark:bg-terminal-accent-dark text-white font-medium disabled:opacity-40"
            >
              新建
            </button>
          </div>
        </div>

        {/* 已有分组列表 */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-xs text-terminal-text-muted-light dark:text-terminal-text-muted-dark mb-2">
            {titleInput ? '匹配的分组' : '已有分组（按数量排序）'}
          </div>
          {filteredGroups.map(g => (
            <div
              key={g.id}
              onClick={() => handleAssign(g.id)}
              className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors mb-1"
            >
              <img
                src={g.cover_image}
                alt=""
                className="w-10 h-10 rounded-md object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark truncate">
                  {g.title || '未命名'}
                </div>
                <div className="text-xs text-terminal-text-muted-light dark:text-terminal-text-muted-dark">
                  {g.post_count} 条
                </div>
              </div>
            </div>
          ))}
          {filteredGroups.length === 0 && titleInput && (
            <div className="text-xs text-terminal-text-muted-light dark:text-terminal-text-muted-dark text-center py-4">
              没有匹配的分组，按 Enter 新建
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
