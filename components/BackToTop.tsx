"use client"

import { useEffect, useState } from "react"
import { CaretCircleUp } from "phosphor-react"

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
      className={`fixed right-6 bottom-6 sm:right-6 sm:bottom-6 z-40 h-10 w-10 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark glass-light dark:glass-dark text-terminal-text-primary-light dark:text-terminal-text-primary-dark shadow-soft-md transition-all-gentle hover:border-terminal-borderHover-light dark:hover:border-terminal-borderHover-dark hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-95 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}
    >
      <CaretCircleUp className="w-5 h-5 mx-auto" weight="duotone" />
    </button>
  )
}
