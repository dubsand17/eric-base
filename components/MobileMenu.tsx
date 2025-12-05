'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { GridFour, X, ArrowUpRight, Broadcast, YoutubeLogo } from 'phosphor-react'
import ThemeToggle from '@/components/ThemeToggle'
import DisplayModeToggle from '@/components/DisplayModeToggle'

interface MobileMenuProps {
  showAbsoluteTime?: boolean
  onToggleTimeFormat?: () => void
}

export default function MobileMenu({ showAbsoluteTime = false, onToggleTimeFormat }: MobileMenuProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          className="sm:hidden h-9 w-9 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark glass-light dark:glass-dark text-terminal-text-primary-light dark:text-terminal-text-primary-dark flex items-center justify-center hover:border-terminal-accent-light dark:hover:border-terminal-accent-dark transition"
          aria-label="打开菜单"
        >
          <GridFour className="w-5 h-5" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 max-h-[80vh] w-full border-t border-terminal-border-light dark:border-terminal-border-dark glass-light dark:glass-dark shadow-lg rounded-t-2xl data-[state=open]:animate-in data-[state=closed]:animate-out flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <div className="absolute left-1/2 -translate-x-1/2 top-1.5 h-1.5 w-10 rounded-full bg-terminal-accent-light/30 dark:bg-terminal-accent-dark/40" />
            <a
              href="https://x.com/CycleStudies"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
              aria-label="前往 CycleStudies 的 X 主页"
            >
              <img src="/icon.svg" alt="logo" className="h-5 w-5" />
              <span className="text-sm font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark">快速设置</span>
            </a>
            <Dialog.Close asChild>
              <button aria-label="关闭" className="h-8 w-8 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark glass-light dark:glass-dark flex items-center justify-center text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:border-terminal-accent-light dark:hover:border-terminal-accent-dark transition">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>
          <div className="h-full flex flex-col overflow-hidden px-4">
            <div className="flex-1 overflow-y-auto space-y-4 pb-4">
              {/* 品牌与主页 */}
              <div className="rounded-xl border border-terminal-border-light dark:border-terminal-border-dark glass-light dark:glass-dark p-3">
                <div className="flex items-center gap-3">
                  <img src="https://pbs.twimg.com/profile_images/1982606819244605440/2IYiLUQI_400x400.jpg" alt="品牌" className="h-6 w-6 rounded" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark truncate">百萬 Eric | Day Trader</div>
                    <div className="text-xs text-terminal-text-secondary-light dark:text-terminal-text-secondary-dark truncate">美股自营基金日内交易员 | 纽约大学数据科学 | 极限运动 | Proprietary Day Trader | NYU Data Science | X Sports</div>
                  </div>
                  <a
                    href="https://x.com/CycleStudies"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 h-8 px-2 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark glass-light dark:glass-dark text-xs text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:border-terminal-accent-light dark:hover:border-terminal-accent-dark"
                  >
                    访问 X 主页 <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* 社交链接 */}
              <div className="rounded-xl border border-terminal-border-light dark:border-terminal-border-dark glass-light dark:glass-dark p-3">
                <div className="mb-2 text-xs font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark">关注频道</div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://space.bilibili.com/40257375"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 h-9 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark glass-light dark:glass-dark text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:border-terminal-accent-light dark:hover:border-terminal-accent-dark"
                    aria-label="Bilibili 空间"
                  >
                    <Broadcast className="w-4 h-4" />
                    <span className="text-xs sm:text-[13px]">Bilibili</span>
                  </a>
                  <a
                    href="https://www.youtube.com/channel/UC0h5WHVgdGyBk5cbB8XiUxw"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 h-9 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark glass-light dark:glass-dark text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:border-terminal-accent-light dark:hover:border-terminal-accent-dark"
                    aria-label="YouTube 频道"
                  >
                    <YoutubeLogo className="w-5 h-5" />
                    <span className="text-xs sm:text-[13px]">YouTube</span>
                  </a>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 px-1 pb-4 pt-3" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 14px)' }}>
              <div className="rounded-xl border border-terminal-border-light dark:border-terminal-border-dark glass-light dark:glass-dark p-3 space-y-3">
                {/* 时间格式 */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark">时间格式</span>
                  <div className="inline-flex rounded-xl border border-terminal-border-light dark:border-terminal-border-dark glass-light dark:glass-dark overflow-hidden">
                    <button
                      className={`px-3 h-8 text-xs transition ${!showAbsoluteTime ? 'bg-terminal-accent-light dark:bg-terminal-accent-dark text-white' : 'bg-transparent text-terminal-text-primary-light dark:text-terminal-text-primary-dark'}`}
                      aria-pressed={!showAbsoluteTime}
                      onClick={() => { if (showAbsoluteTime) onToggleTimeFormat?.() }}
                    >相对时间</button>
                    <button
                      className={`px-3 h-8 text-xs transition ${showAbsoluteTime ? 'bg-terminal-accent-light dark:bg-terminal-accent-dark text-white' : 'bg-transparent text-terminal-text-primary-light dark:text-terminal-text-primary-dark'}`}
                      aria-pressed={showAbsoluteTime}
                      onClick={() => { if (!showAbsoluteTime) onToggleTimeFormat?.() }}
                    >绝对时间</button>
                  </div>
                </div>
                {/* 显示模式 */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark">显示模式</span>
                  <DisplayModeToggle />
                </div>
                {/* 主题 */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark">主题</span>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

