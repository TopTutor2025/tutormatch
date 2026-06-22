import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { generateMeetLink } from '@/lib/utils'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: NextRequest) {
  try {
    // Verifica che l'utente sia admin
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

    const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })

    const { student_id, tutor_id, slot_id, subject_id, grade, mode, topic, address, hours_used } = await request.json()

    const meet_link = mode === 'online' ? generateMeetLink() : null
    const hoursNeeded = hours_used ?? 1

    // Priorità: lezione di prova (solo online) -> ore spot -> ore del grado
    const gradeField = grade === 'medie' ? 'hour_credits_medie' : grade === 'superiori' ? 'hour_credits_superiori' : 'hour_credits_universita'
    const { data: sp } = await supabaseAdmin
      .from('student_profiles').select(`hour_credits_trial, hour_credits_spot, ${gradeField}`).eq('id', student_id).single()
    const useTrial = !!sp && mode === 'online' && ((sp as any).hour_credits_trial || 0) >= 1
    const useSpot = !useTrial && !!sp && ((sp as any).hour_credits_spot || 0) >= hoursNeeded

    const { error } = await supabaseAdmin.from('bookings').insert({
      student_id, tutor_id, slot_id, subject_id, grade, mode,
      topic: topic?.trim(),
      address: mode !== 'online' ? address : null,
      meet_link,
      status: 'confermato',
      hours_used: hoursNeeded,
      used_spot: useSpot,
      used_trial: useTrial,
    })

    if (error) {
      console.error('Admin booking insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Aggiorna lo slot (e l'eventuale secondo slot presenza) a "prenotato"
    await supabaseAdmin.from('calendar_slots').update({ status: 'prenotato' }).eq('id', slot_id)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Admin booking error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
