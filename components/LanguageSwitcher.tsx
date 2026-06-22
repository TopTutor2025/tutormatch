'use client'
import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

type Lang = { code: string; label: string; flag: string }

const LANGS: Lang[] = [
  { code: 'it', label: 'Italiano', flag: 'it' },
  { code: 'en', label: 'English', flag: 'gb' },
  { code: 'de', label: 'Deutsch', flag: 'de' },
  { code: 'fr', label: 'Français', flag: 'fr' },
  { code: 'es', label: 'Español', flag: 'es' },
]

export default function LanguageSwitcher({ dropUp = false }: { dropUp?: boolean }) {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('it')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const cur = LANGS.find(l => l.code === current) || LANGS[0]
  const others = LANGS.filter(l => l.code !== current)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Cambia lingua"
        className="flex items-center gap-1 p-1 rounded-full hover:bg-white/10 transition-colors">
        <span className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-white/25 block flex-shrink-0">
          <img src={`https://flagcdn.com/w80/${cur.flag}.png`} alt={cur.label} className="w-full h-full object-cover" />
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className={`absolute right-0 w-44 bg-black/90 backdrop-blur-md border border-white/10 rounded-2xl p-1.5 shadow-2xl z-50 ${dropUp ? 'bottom-full mb-2' : 'mt-2'}`}>
          {others.map(l => (
            <button
              key={l.code}
              onClick={() => { setCurrent(l.code); setOpen(false) }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors text-left">
              <span className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-white/15">
                <img src={`https://flagcdn.com/w80/${l.flag}.png`} alt={l.label} className="w-full h-full object-cover" />
              </span>
              <span className="text-sm text-gray-200">{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
