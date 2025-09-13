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
        {/* 背景装饰 */}
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-gradient-to-b from-white/40 via-transparent to-transparent dark:from-white/10 blur-xl" />

        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-500/15 to-blue-500/15 text-violet-600 dark:text-violet-300">
            {isSearching ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : isNoResults ? (
              <Search className="h-7 w-7" />
            ) : (
              <LineChart className="h-7 w-7" />
            )}
          </div>

          <h3 className="mb-2 text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>

          {/* 学习/交易员导向的建议 */}
          <div className="mx-auto grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
            <Tip icon={<Search className="h-4 w-4" />} title="精准搜索" desc="支持关键词与时间过滤" />
            <Tip icon={<BookOpen className="h-4 w-4" />} title="边学边记" desc="沉淀可复用交易知识库" />
            <Tip icon={<LineChart className="h-4 w-4" />} title="聚焦有效信息" desc="筛掉噪音，保留高置信度洞见" />
          </div>

          {/* 动作区 */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {isSearching && (
              <span className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/30 dark:bg-white/5 backdrop-blur-md px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> 正在为你检索
              </span>
            )}
            {isNoResults && (
              <button
                onClick={onClear}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-md px-3 py-1.5 text-xs text-gray-800 hover:bg-white/50 dark:text-gray-200 dark:hover:bg-white/10 transition"
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
    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/30 dark:bg-white/5 backdrop-blur-md p-3 text-left">
      <div className="mb-1 flex items-center gap-2 text-gray-900 dark:text-gray-100">
        <span className="text-violet-600 dark:text-violet-300">{icon}</span>
        <span className="text-sm font-medium">{title}</span>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400">{desc}</p>
    </div>
  )
}