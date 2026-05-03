'use client'
import { useState, useRef } from 'react'
import { BookOpen } from 'lucide-react'

interface Subject { id: string; name: string }

export default function SubjectsTicker({ subjects }: { subjects: Subject[] }) {
  const [paused, setPaused] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef<{ x: number; scrollX: number } | null>(null)

  // Duplicate for seamless loop
  const items = [...subjects, ...subjects]

  // Mouse drag handlers
  function onMouseDown(e: React.MouseEvent) {
    setPaused(true)
    dragStart.current = { x: e.clientX, scrollX: 0 }
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragStart.current || !trackRef.current) return
    const delta = dragStart.current.x - e.clientX
    trackRef.current.style.animationDelay = `${delta * 0.05}s`
  }

  function onMouseUp() {
    dragStart.current = null
    setPaused(false)
  }

  return (
    <div
      className="relative overflow-hidden cursor-grab active:cursor-grabbing"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => { setPaused(false); dragStart.current = null }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      {/* Fade laterali */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <div
        ref={trackRef}
        className={`flex gap-2 ticker-track${paused ? ' paused' : ''}`}
        style={{ width: 'max-content' }}
      >
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
