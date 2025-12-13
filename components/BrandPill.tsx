'use client'

import { ChartLine, VideoCamera, Play } from 'phosphor-react'

export default function BrandPill() {
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
                    <a
                        href="https://www.youtube.com/channel/UC0h5WHVgdGyBk5cbB8XiUxw"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:bg-terminal-state-hover-light dark:hover:bg-terminal-state-hover-dark transition-all-gentle active:scale-95"
                        title="YouTube"
                    >
                        <Play className="w-4 h-4" weight="duotone" />
                    </a>
                </div>
            </div>
        </div>
    )
}
