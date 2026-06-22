import { createClient } from '@/lib/supabase/server'
import SubjectsTicker from './SubjectsTicker'

export default async function LandingSubjects() {
  const supabase = await createClient()
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')
    .eq('active', true)
    .order('name')

  if (!subjects || subjects.length === 0) return null

  const mid = Math.ceil(subjects.length / 2)
  const rowOne = subjects.slice(0, mid)
  const rowTwo = subjects.slice(mid)

  return (
    <section className="relative overflow-hidden py-12 md:py-24 bg-[#060a08]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[640px] h-[340px] bg-emerald-500/10 blur-[140px] pointer-events-none" />

      {/* Header centrato */}
      <div className="relative z-10 max-w-3xl mx-auto text-center px-4 md:px-6 mb-10 md:mb-14">
        <h2 className="text-3xl md:text-5xl font-extrabold text-white">
          Tutte le materie,{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">un solo posto</span>
        </h2>
        <p className="text-base md:text-lg text-gray-400 mt-4">
          Dalle medie all&apos;università: {subjects.length} materie e un tutor per ogni esigenza.
        </p>
      </div>

      {/* Due righe di card */}
      <div className="relative z-10 space-y-5 [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]">
        <div className="px-4 md:px-6">
          <SubjectsTicker subjects={rowOne} />
        </div>
        {rowTwo.length > 0 && (
          <div className="px-4 md:px-6">
            <SubjectsTicker subjects={rowTwo} />
          </div>
        )}
      </div>

      <p className="relative z-10 text-xs text-gray-500 text-center mt-8 px-4">← trascina per scorrere le materie →</p>
    </section>
  )
}
