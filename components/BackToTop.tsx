"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop
      setVisible(y > 400)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const scrollToTop = () => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch {
      window.scrollTo(0, 0)
    }
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="回到顶部"
      title="回到顶部"
      className={`fixed right-6 bottom-6 sm:right-6 sm:bottom-6 z-40 h-10 w-10 rounded-lg border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-surface-light dark:bg-terminal-surface-dark text-terminal-text-primary-light dark:text-terminal-text-primary-dark shadow-[0_4px_12px_rgba(0,0,0,0.2)] dark:shadow-[0_4px_16px_rgba(6,182,212,0.15)] transition-all duration-200 hover:border-terminal-accent-light dark:hover:border-terminal-accent-dark hover:shadow-[0_0_16px_rgba(6,182,212,0.4)] ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}
    >
      <ArrowUp className="w-5 h-5 mx-auto" />
    </button>
  )
}
