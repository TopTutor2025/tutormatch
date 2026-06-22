'use client'
import { useRef } from 'react'
import {
  BookOpen, Calculator, Atom, FlaskConical, Dna, Microscope, ScrollText,
  Landmark, Hourglass, Globe, Languages, Code, Brain, Palette, Music,
  TrendingUp, Scale, type LucideIcon,
} from 'lucide-react'

interface Subject { id: string; name: string }

type Style = { icon: LucideIcon; tint: string; color: string }

const SUBJECT_STYLE: Record<string, Style> = {
  matematica: { icon: Calculator, tint: 'bg-blue-500/10 border-blue-500/20', color: 'text-blue-400' },
  fisica: { icon: Atom, tint: 'bg-cyan-500/10 border-cyan-500/20', color: 'text-cyan-400' },
  chimica: { icon: FlaskConical, tint: 'bg-emerald-500/10 border-emerald-500/20', color: 'text-emerald-400' },
  biologia: { icon: Dna, tint: 'bg-green-500/10 border-green-500/20', color: 'text-green-400' },
  scienze: { icon: Microscope, tint: 'bg-lime-500/10 border-lime-500/20', color: 'text-lime-400' },
  italiano: { icon: BookOpen, tint: 'bg-rose-500/10 border-rose-500/20', color: 'text-rose-400' },
  latino: { icon: ScrollText, tint: 'bg-amber-500/10 border-amber-500/20', color: 'text-amber-400' },
  greco: { icon: Landmark, tint: 'bg-orange-500/10 border-orange-500/20', color: 'text-orange-400' },
  storia: { icon: Hourglass, tint: 'bg-yellow-500/10 border-yellow-500/20', color: 'text-yellow-400' },
  geografia: { icon: Globe, tint: 'bg-teal-500/10 border-teal-500/20', color: 'text-teal-400' },
  inglese: { icon: Languages, tint: 'bg-red-500/10 border-red-500/20', color: 'text-red-400' },
  francese: { icon: Languages, tint: 'bg-indigo-500/10 border-indigo-500/20', color: 'text-indigo-400' },
  spagnolo: { icon: Languages, tint: 'bg-amber-500/10 border-amber-500/20', color: 'text-amber-400' },
  tedesco: { icon: Languages, tint: 'bg-yellow-500/10 border-yellow-500/20', color: 'text-yellow-400' },
  informatica: { icon: Code, tint: 'bg-violet-500/10 border-violet-500/20', color: 'text-violet-400' },
  filosofia: { icon: Brain, tint: 'bg-fuchsia-500/10 border-fuchsia-500/20', color: 'text-fuchsia-400' },
  arte: { icon: Palette, tint: 'bg-pink-500/10 border-pink-500/20', color: 'text-pink-400' },
  musica: { icon: Music, tint: 'bg-purple-500/10 border-purple-500/20', color: 'text-purple-400' },
  economia: { icon: TrendingUp, tint: 'bg-emerald-500/10 border-emerald-500/20', color: 'text-emerald-400' },
  diritto: { icon: Scale, tint: 'bg-slate-500/10 border-slate-500/20', color: 'text-slate-300' },
}

const FALLBACKS: Style[] = [
  { icon: BookOpen, tint: 'bg-emerald-500/10 border-emerald-500/20', color: 'text-emerald-400' },
  { icon: Brain, tint: 'bg-fuchsia-500/10 border-fuchsia-500/20', color: 'text-fuchsia-400' },
  { icon: Globe, tint: 'bg-cyan-500/10 border-cyan-500/20', color: 'text-cyan-400' },
  { icon: ScrollText, tint: 'bg-amber-500/10 border-amber-500/20', color: 'text-amber-400' },
]

function styleFor(name: string, i: number): Style {
  const key = name.trim().toLowerCase()
  return SUBJECT_STYLE[key] || FALLBACKS[i % FALLBACKS.length]
}

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
      className="flex gap-4 overflow-x-auto cursor-grab active:cursor-grabbing py-1"
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
      {subjects.map((s, i) => {
        const { icon: Icon, tint, color } = styleFor(s.name, i)
        return (
          <div key={s.id} className="flex-shrink-0 flex flex-col items-center gap-2.5 select-none">
            <div className={`w-32 h-32 md:w-36 md:h-36 rounded-3xl border flex items-center justify-center ${tint} hover:-translate-y-1 hover:brightness-125 transition-all duration-300`}>
              <Icon className={`w-12 h-12 md:w-14 md:h-14 ${color}`} strokeWidth={1.6} />
            </div>
            <span className="text-sm font-medium text-gray-300 text-center w-32 md:w-36 truncate">{s.name}</span>
          </div>
        )
      })}
    </div>
  )
}
