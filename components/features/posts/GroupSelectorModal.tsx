'use client'

import { useEffect, useState, useRef } from 'react'
import type { PostGroup } from '@/lib/supabase'

interface GroupSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (groupId: string) => void
  onCreateNew: (title: string) => void
}

export default function GroupSelectorModal({ isOpen, onClose, onSelect, onCreateNew }: GroupSelectorModalProps) {
  const [groups, setGroups] = useState<PostGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [titleInput, setTitleInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return
    setTitleInput('')
    setLoading(true)
    fetch('/api/groups')
      .then(r => r.json())
      .then(d => setGroups(d.data || []))
      .catch(() => {})
      .finally(() => {
        setLoading(false)
        setTimeout(() => inputRef.current?.focus(), 50)
      })
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const filtered = titleInput.trim()
    ? groups.filter(g => g.title?.toLowerCase().includes(titleInput.toLowerCase()))
    : groups.sort((a, b) => (b.post_count || 0) - (a.post_count || 0)).slice(0, 20)

  const handleCreate = () => {
    const title = titleInput.trim()
    if (!title) return
    // 如果已有同名分组，直接归入
    const existing = groups.find(g => g.title === title)
    if (existing) {
      onSelect(existing.id)
    } else {
      onCreateNew(title)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="glass-light dark:glass-dark rounded-2xl border border-terminal-border-light dark:border-terminal-border-dark w-[380px] max-h-[500px] overflow-hidden flex flex-col shadow-2xl">
        {/* 头部 */}
        <div className="px-5 py-4 border-b border-terminal-border-light dark:border-terminal-border-dark">
          <h3 className="text-sm font-semibold text-terminal-text-primary-light dark:text-terminal-text-primary-dark">
            选择主题分组
          </h3>
        </div>

        {/* 输入框 */}
        <div className="px-4 py-3 border-b border-terminal-border-light dark:border-terminal-border-dark">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
              placeholder="搜索已有分组或输入新名称"
              className="flex-1 bg-transparent border border-terminal-border-light dark:border-terminal-border-dark rounded-lg px-3 py-2 text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark outline-none focus:border-terminal-accent-light dark:focus:border-terminal-accent-dark placeholder:text-terminal-text-muted-light dark:placeholder:text-terminal-text-muted-dark"
            />
            <button
              onClick={handleCreate}
              disabled={!titleInput.trim()}
              className="px-3 py-2 text-xs rounded-lg bg-terminal-accent-light dark:bg-terminal-accent-dark text-white font-medium disabled:opacity-40 transition-opacity"
            >
              新建
            </button>
          </div>
        </div>

        {/* 分组列表 */}
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="text-center py-6 text-xs text-terminal-text-muted-light dark:text-terminal-text-muted-dark">
              加载中...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-6 text-xs text-terminal-text-muted-light dark:text-terminal-text-muted-dark">
              {titleInput ? '没有匹配的分组，按 Enter 新建' : '暂无分组'}
            </div>
          ) : (
            filtered.map(g => (
              <div
                key={g.id}
                onClick={() => onSelect(g.id)}
                className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-white/5 dark:hover:bg-white/5 transition-colors mb-0.5"
              >
                <img
                  src={g.cover_image}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark truncate">
                    {g.title || '未命名'}
                  </div>
                  <div className="text-xs text-terminal-text-muted-light dark:text-terminal-text-muted-dark">
                    {g.post_count || 0} 条
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
