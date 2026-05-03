import { createClient } from '@/lib/supabase/server'
import SubjectsTicker from './SubjectsTicker'
import { GraduationCap } from 'lucide-react'

export default async function LandingSubjects() {
  const supabase = await createClient()
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')
    .eq('active', true)
    .order('name')

  if (!subjects || subjects.length === 0) return null

  return (
    <section className="py-16 md:py-24 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">

          {/* Left: testo */}
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-6">
              Tutte le materie,<br />un solo posto
            </h2>
            <div className="space-y-4 text-gray-500 text-base md:text-lg leading-relaxed">
              <p>
                Dai fondamentali delle medie alle materie universitarie più complesse.
                Trovi un tutor per ogni esigenza.
              </p>
              <div className="flex items-center gap-3 bg-pink-50 border border-pink-100 rounded-2xl px-5 py-3 w-fit">
                <GraduationCap className="w-5 h-5 text-pink-500 flex-shrink-0" />
                <span className="text-sm font-semibold text-pink-700">{subjects.length} materie disponibili</span>
              </div>
            </div>
          </div>

          {/* Right: card scrollabili */}
          <div className="bg-gradient-to-br from-pink-50 to-white rounded-3xl p-6 border border-pink-100 overflow-hidden">
            <SubjectsTicker subjects={subjects} />
          </div>

        </div>
      </div>
    </section>
  )
}
