import { createClient } from '@/lib/supabase/server'
import { BookOpen } from 'lucide-react'

export default async function LandingSubjects() {
  const supabase = await createClient()
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')
    .eq('active', true)
    .order('name')

  if (!subjects || subjects.length === 0) return null

  // Duplicate list for seamless loop
  const items = [...subjects, ...subjects]

  return (
    <section className="py-12 md:py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-3">Tutte le materie</h2>
          <p className="text-base md:text-lg text-gray-500">
            {subjects.length} materie disponibili, con nuovi tutor aggiunti ogni settimana
          </p>
        </div>
      </div>

      {/* Ticker scrolling */}
      <div className="relative">
        {/* Left/right fade */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div
          className="flex gap-2"
          style={{
            width: 'max-content',
            animation: 'tickerScroll 30s linear infinite',
          }}
        >
          {items.map((s, i) => (
            <div
              key={`${s.id}-${i}`}
              className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 whitespace-nowrap flex-shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700">{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
