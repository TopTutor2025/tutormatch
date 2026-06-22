'use client'
import { useRef } from 'react'
import {
  BookOpen, Calculator, Atom, FlaskConical, Dna, Microscope, ScrollText,
  Landmark, Hourglass, Globe, Languages, Code, Brain, Palette, Music,
  TrendingUp, Scale, type LucideIcon,
} from 'lucide-react'

interface Subject { id: string; name: string }

type Style = { icon: LucideIcon; grad: string }

const SUBJECT_STYLE: Record<string, Style> = {
  matematica: { icon: Calculator, grad: 'from-blue-400 to-indigo-500' },
  fisica: { icon: Atom, grad: 'from-cyan-400 to-blue-500' },
  chimica: { icon: FlaskConical, grad: 'from-emerald-400 to-teal-500' },
  biologia: { icon: Dna, grad: 'from-green-400 to-emerald-500' },
  scienze: { icon: Microscope, grad: 'from-lime-400 to-green-500' },
  italiano: { icon: BookOpen, grad: 'from-rose-400 to-pink-500' },
  latino: { icon: ScrollText, grad: 'from-amber-400 to-orange-500' },
  greco: { icon: Landmark, grad: 'from-orange-400 to-amber-500' },
  storia: { icon: Hourglass, grad: 'from-yellow-400 to-amber-500' },
  geografia: { icon: Globe, grad: 'from-teal-400 to-cyan-500' },
  inglese: { icon: Languages, grad: 'from-red-400 to-rose-500' },
  francese: { icon: Languages, grad: 'from-blue-400 to-indigo-500' },
  spagnolo: { icon: Languages, grad: 'from-amber-400 to-red-500' },
  tedesco: { icon: Languages, grad: 'from-yellow-400 to-yellow-600' },
  informatica: { icon: Code, grad: 'from-violet-400 to-purple-500' },
  filosofia: { icon: Brain, grad: 'from-fuchsia-400 to-purple-500' },
  arte: { icon: Palette, grad: 'from-pink-400 to-fuchsia-500' },
  musica: { icon: Music, grad: 'from-purple-400 to-pink-500' },
  economia: { icon: TrendingUp, grad: 'from-emerald-400 to-green-500' },
  diritto: { icon: Scale, grad: 'from-slate-400 to-gray-500' },
}

const FALLBACKS: Style[] = [
  { icon: BookOpen, grad: 'from-emerald-400 to-teal-500' },
  { icon: Brain, grad: 'from-fuchsia-400 to-purple-500' },
  { icon: Globe, grad: 'from-cyan-400 to-blue-500' },
  { icon: ScrollText, grad: 'from-amber-400 to-orange-500' },
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
      className="flex gap-3 overflow-x-auto cursor-grab active:cursor-grabbing py-1"
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
        const { icon: Icon, grad } = styleFor(s.name, i)
        return (
          <div
            key={s.id}
            className="group flex-shrink-0 bg-white/[0.05] rounded-2xl border border-white/10 p-4 flex flex-col items-center justify-center gap-2.5 select-none hover:border-emerald-400/40 hover:bg-white/[0.08] hover:-translate-y-1 transition-all duration-300"
            style={{ width: '128px', height: '128px' }}
          >
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <span className="text-xs font-semibold text-gray-100 text-center leading-tight">{s.name}</span>
          </div>
        )
      })}
    </div>
  )
}
