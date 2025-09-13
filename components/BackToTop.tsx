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
      className={`fixed right-6 bottom-6 sm:right-6 sm:bottom-6 z-40 h-10 w-10 rounded-full border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 shadow transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}
    >
      <ArrowUp className="w-5 h-5 mx-auto" />
    </button>
  )
}
