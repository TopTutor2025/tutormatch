import { createClient } from '@/lib/supabase/server'
import SubjectsTicker from './SubjectsTicker'
import { GraduationCap, Video, Layers } from 'lucide-react'

export default async function LandingSubjects() {
  const supabase = await createClient()
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')
    .eq('active', true)
    .order('name')

  if (!subjects || subjects.length === 0) return null

  return (
    <section className="relative overflow-hidden py-12 md:py-24 px-4 md:px-6 bg-[#060a08]">
      <div className="absolute top-1/2 -translate-y-1/2 -left-24 w-[440px] h-[440px] bg-emerald-500/10 blur-[140px] pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">

          {/* Left: testo */}
          <div className="min-w-0 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 md:mb-6">
              Tutte le materie,<br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">un solo posto</span>
            </h2>
            <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-6">
              Dai fondamentali delle medie alle materie universitarie più complesse.
              Trovi un tutor per ogni esigenza.
            </p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="inline-flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/20 rounded-2xl px-4 py-2.5">
                <GraduationCap className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-sm font-semibold text-emerald-300">{subjects.length} materie disponibili</span>
              </span>
              <span className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-2.5">
                <Layers className="w-4 h-4 text-gray-300 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-300">Medie · Superiori · Università</span>
              </span>
              <span className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-2.5">
                <Video className="w-4 h-4 text-gray-300 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-300">Online e in presenza</span>
              </span>
            </div>
          </div>

          {/* Right: card scrollabili */}
          <div className="min-w-0 w-full">
            <div className="relative rounded-3xl p-4 md:p-6 bg-white/[0.04] border border-white/10 w-full">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-3xl pointer-events-none" />
              <div className="relative [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
                <SubjectsTicker subjects={subjects} />
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">← scorri per vedere tutte le materie →</p>
          </div>

        </div>
      </div>
    </section>
  )
}
