'use client'
import { useRef, useEffect } from 'react'
import { BookOpen } from 'lucide-react'

interface Subject { id: string; name: string }

export default function SubjectsTicker({ subjects }: { subjects: Subject[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isPaused = useRef(false)
  const isUserScrolling = useRef(false)
  const userScrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<number | null>(null)

  // Duplicate for seamless loop
  const items = [...subjects, ...subjects]

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const speed = 0.6 // px per frame

    function step() {
      if (!isPaused.current && !isUserScrolling.current && el) {
        el.scrollLeft += speed
        // Reset to start when halfway (seamless loop)
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0
        }
      }
      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)

    // Pause on hover
    const pause = () => { isPaused.current = true }
    const resume = () => { isPaused.current = false }

    // Detect manual scroll (touch/mouse drag)
    const onScrollStart = () => {
      isUserScrolling.current = true
      if (userScrollTimeout.current) clearTimeout(userScrollTimeout.current)
      userScrollTimeout.current = setTimeout(() => {
        isUserScrolling.current = false
      }, 1500)
    }

    el.addEventListener('mouseenter', pause)
    el.addEventListener('mouseleave', resume)
    el.addEventListener('touchstart', onScrollStart, { passive: true })
    el.addEventListener('scroll', onScrollStart, { passive: true })

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (userScrollTimeout.current) clearTimeout(userScrollTimeout.current)
      el.removeEventListener('mouseenter', pause)
      el.removeEventListener('mouseleave', resume)
      el.removeEventListener('touchstart', onScrollStart)
      el.removeEventListener('scroll', onScrollStart)
    }
  }, [])

  return (
    <div className="relative">
      {/* Fade laterali */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <div
        ref={containerRef}
        className="flex gap-2 overflow-x-auto cursor-grab active:cursor-grabbing"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>
        {items.map((s, i) => (
          <div
            key={`${s.id}-${i}`}
            className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 whitespace-nowrap flex-shrink-0 select-none"
          >
            <BookOpen className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
