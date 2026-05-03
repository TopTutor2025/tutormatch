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
      <SubjectsTicker subjects={subjects} />
    </section>
  )
}
