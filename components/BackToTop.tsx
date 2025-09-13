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
      className={`fixed right-6 bottom-6 sm:right-6 sm:bottom-6 z-40 h-10 w-10 rounded-full border border-white/30 dark:border-white/10 bg-white/30 dark:bg-white/5 backdrop-blur-md text-gray-700 dark:text-gray-300 shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-all duration-200 hover:bg-white/40 dark:hover:bg-white/10 hover:shadow-[0_10px_30px_rgba(0,0,0,0.25)] ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}
    >
      <ArrowUp className="w-5 h-5 mx-auto" />
    </button>
  )
}
