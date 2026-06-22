'use client'
import { useState, useEffect } from 'react'
import { Video } from 'lucide-react'

const ITEMS = [
  { subject: 'Matematica', when: 'Domani 15:00' },
  { subject: 'Inglese', when: 'Oggi 17:30' },
  { subject: 'Fisica', when: 'Domani 09:00' },
  { subject: 'Storia', when: 'Mercoledì 16:00' },
  { subject: 'Chimica', when: 'Venerdì 18:00' },
  { subject: 'Latino', when: 'Giovedì 14:30' },
  { subject: 'Inglese', when: 'Domani 11:00' },
]

export default function BookingTicker({ compact = false }: { compact?: boolean }) {
  const [i, setI] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setI(v => (v + 1) % ITEMS.length), 2800)
    return () => clearInterval(t)
  }, [])

  const item = ITEMS[i]

  return (
    <div className={`bg-black text-white rounded-2xl ${compact ? 'p-3' : 'p-4 mx-2'} flex items-center gap-3 shadow-xl`}>
      <div className={`${compact ? 'w-8 h-8' : 'w-9 h-9'} bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Video className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">Lezione confermata!</p>
        <p key={i} className="chip-line-anim text-xs text-white/60 truncate">
          {item.subject} · {item.when}
        </p>
      </div>
      <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
    </div>
  )
}
