"use client"

import React from "react"
import { Loader2, Search, LineChart, BookOpen, RefreshCw } from "lucide-react"

type EmptyStateProps = {
  state?: "idle" | "searching" | "no_results"
  query?: string
  onClear?: () => void
}

export default function EmptyState({ state = "idle", query, onClear }: EmptyStateProps) {
  const isSearching = state === "searching"
  const isNoResults = state === "no_results"

  const title = isSearching
    ? "正在搜索…"
    : isNoResults
    ? `没有找到与“${query ?? ""}”匹配的内容`
    : "开始探索优质交易内容"

  const subtitle = isSearching
    ? "为你检索图文、作者与时间区间，稍等片刻"
    : isNoResults
    ? "换个关键词、缩短时间范围，或尝试作者/标签过滤"
    : "收藏、复盘、沉淀你的交易体系：从基本功开始"

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="relative w-full max-w-2xl">
        <div className="rounded-2xl border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-surface-light dark:bg-terminal-surface-dark shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_rgba(6,182,212,0.1)] p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl border-2 border-terminal-accent-light/30 dark:border-terminal-accent-dark/40 bg-terminal-accent-light/5 dark:bg-terminal-accent-dark/10 text-terminal-accent-light dark:text-terminal-accent-dark">
            {isSearching ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : isNoResults ? (
              <Search className="h-7 w-7" />
            ) : (
              <LineChart className="h-7 w-7" />
            )}
          </div>

          <h3 className="mb-2 text-lg font-semibold tracking-tight text-terminal-text-primary-light dark:text-terminal-text-primary-dark">{title}</h3>
          <p className="mb-6 text-sm text-terminal-text-secondary-light dark:text-terminal-text-secondary-dark">{subtitle}</p>

          {/* 学习/交易员导向的建议 */}
          <div className="mx-auto grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
            <Tip icon={<Search className="h-4 w-4" />} title="精准搜索" desc="支持关键词与时间过滤" />
            <Tip icon={<BookOpen className="h-4 w-4" />} title="边学边记" desc="沉淀可复用交易知识库" />
            <Tip icon={<LineChart className="h-4 w-4" />} title="聚焦有效信息" desc="筛掉噪音，保留高置信度洞见" />
          </div>

          {/* 动作区 */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {isSearching && (
              <span className="inline-flex items-center gap-2 rounded-full border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-surface-light dark:bg-terminal-surface-dark px-3 py-1.5 text-xs text-terminal-text-primary-light dark:text-terminal-text-primary-dark">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> 正在为你检索
              </span>
            )}
            {isNoResults && (
              <button
                onClick={onClear}
                className="inline-flex items-center gap-2 rounded-full border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-surface-light dark:bg-terminal-surface-dark px-3 py-1.5 text-xs text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:border-terminal-accent-light dark:hover:border-terminal-accent-dark transition"
              >
                <RefreshCw className="h-3.5 w-3.5" /> 清空条件再试
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Tip({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border-2 border-terminal-border-light/50 dark:border-terminal-border-dark bg-terminal-bg-light dark:bg-terminal-bg-dark p-3 text-left">
      <div className="mb-1 flex items-center gap-2 text-terminal-text-primary-light dark:text-terminal-text-primary-dark">
        <span className="text-terminal-accent-light dark:text-terminal-accent-dark">{icon}</span>
        <span className="text-sm font-medium">{title}</span>
      </div>
      <p className="text-xs text-terminal-text-secondary-light dark:text-terminal-text-secondary-dark">{desc}</p>
    </div>
  )
}