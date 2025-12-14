'use client'

import { useEffect, useState } from 'react'
import { ChartLine, VideoCamera, Play } from 'phosphor-react'

export default function BrandBadge() {
    const [isLive, setIsLive] = useState(false)
    const [liveUrl, setLiveUrl] = useState<string | undefined>()

    // 检测YouTube直播状态
    const checkLiveStatus = async () => {
        // 只在晚上8-11点检测（使用本地时间）
        const hour = new Date().getHours()

        // 不在直播时间段，跳过检测
        if (hour < 20 || hour >= 23) {
            setIsLive(false)
            setLiveUrl(undefined)
            return
        }

        try {
            const response = await fetch('/api/youtube-live')
            const data = await response.json()
            setIsLive(data.isLive || false)
            setLiveUrl(data.liveUrl)
        } catch (error) {
            console.error('Failed to check live status:', error)
        }
    }

    useEffect(() => {
        // 初始检查
        checkLiveStatus()

        // 每2分钟轮询一次
        const interval = setInterval(checkLiveStatus, 2 * 60 * 1000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="fixed top-4 left-4 z-40 hidden md:flex">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl backdrop-blur-sm">
                <a
                    href="https://x.com/CycleStudies"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 group"
                    title="CycleStudies"
                >
                    <ChartLine
                        className="h-5 w-5 text-terminal-accent-light dark:text-terminal-accent-dark flex-shrink-0 group-hover:scale-110 transition-transform"
                        weight="duotone"
                    />
                    <span className="hidden xl:block text-sm font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark whitespace-nowrap">
                        百萬Eric
                    </span>
                </a>

                <div className="hidden lg:flex items-center gap-1 ml-2 pl-2 border-l border-terminal-border-light dark:border-terminal-border-dark">
                    <a
                        href="https://space.bilibili.com/40257375"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:bg-terminal-state-hover-light dark:hover:bg-terminal-state-hover-dark transition-all-gentle active:scale-95"
                        title="Bilibili"
                    >
                        <VideoCamera className="w-4 h-4" weight="duotone" />
                    </a>

                    {/* YouTube按钮 - 直播时跳转到直播页，hover包含绿点 */}
                    <div className="relative">
                        <a
                            href={isLive && liveUrl ? liveUrl : "https://www.youtube.com/channel/UC0h5WHVgdGyBk5cbB8XiUxw"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`relative h-8 rounded-lg flex items-center justify-center text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:bg-terminal-state-hover-light dark:hover:bg-terminal-state-hover-dark transition-all-gentle active:scale-95 group ${isLive ? 'w-14 pr-5 pl-2' : 'w-8'}`}
                            title={isLive ? "正在直播！点击观看" : "YouTube"}
                        >
                            <Play className="w-4 h-4" weight="duotone" />

                            {/* 直播指示器 - 绿色脉动圆点（图标右侧，在按钮内） */}
                            {isLive && (
                                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-[#16181d]"></span>
                                </span>
                            )}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
