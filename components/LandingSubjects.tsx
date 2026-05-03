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
    <section className="py-16 md:py-20 px-4 md:px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-4">Tutte le materie</h2>
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

        <div className="flex gap-3 animate-subjects-scroll" style={{ width: 'max-content' }}>
          {items.map((s, i) => (
            <div
              key={`${s.id}-${i}`}
              className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 whitespace-nowrap flex-shrink-0 hover:border-gray-400 hover:bg-white transition-colors"
            >
              <BookOpen className="w-4 h-4 text-pink-400 flex-shrink-0" />
              <span className="text-sm font-semibold text-gray-800">{s.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
