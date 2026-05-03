'use client'
import { useRef } from 'react'
import { BookOpen } from 'lucide-react'

interface Subject { id: string; name: string }

const COLORS = [
  'from-pink-300 to-pink-500',
  'from-blue-300 to-blue-500',
  'from-purple-300 to-purple-500',
  'from-green-300 to-green-500',
  'from-orange-300 to-orange-500',
  'from-yellow-300 to-yellow-500',
  'from-red-300 to-red-500',
  'from-teal-300 to-teal-500',
]

export default function SubjectsTicker({ subjects }: { subjects: Subject[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeftStart = useRef(0)

  function onMouseDown(e: React.MouseEvent) {
    isDragging.current = true
    startX.current = e.pageX - (scrollRef.current?.offsetLeft || 0)
    scrollLeftStart.current = scrollRef.current?.scrollLeft || 0
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging.current || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - (scrollRef.current.offsetLeft || 0)
    const walk = (x - startX.current) * 1.5
    scrollRef.current.scrollLeft = scrollLeftStart.current - walk
  }

  function onMouseUp() { isDragging.current = false }

  return (
    <div
      ref={scrollRef}
      className="flex gap-3 overflow-x-auto cursor-grab active:cursor-grabbing"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
        maxWidth: '100%',
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {subjects.map((s, i) => (
        <div
          key={s.id}
          className="flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex items-center gap-2 select-none"
          style={{ width: '140px' }}
        >
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${COLORS[i % COLORS.length]} flex items-center justify-center flex-shrink-0`}>
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-semibold text-gray-800 leading-tight">{s.name}</span>
        </div>
      ))}
    </div>
  )
}
