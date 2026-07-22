import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { sendConfirmEmail } from '@/lib/send-booking-email'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

    const {
      tutor_id, slot_id, second_slot_id, subject_id,
      grade, mode, topic, address, meet_link, hours_used, used_spot, used_trial,
    } = await request.json()

    // Verifica che gli slot siano ancora disponibili (evita doppie prenotazioni)
    const slotIdsToCheck = [slot_id, ...(second_slot_id ? [second_slot_id] : [])]
    const { data: slotRows } = await supabaseAdmin
      .from('calendar_slots').select('id, status').in('id', slotIdsToCheck)
    if (!slotRows || slotRows.length !== slotIdsToCheck.length || slotRows.some(s => s.status !== 'disponibile')) {
      return NextResponse.json({ error: 'Slot non più disponibile. Aggiorna la pagina e riprova.' }, { status: 409 })
    }

    // Usa service role per ottenere sempre l'ID (bypassa RLS SELECT)
    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .insert({
        student_id: user.id,
        tutor_id, slot_id, second_slot_id, subject_id,
        grade, mode, topic, address, meet_link, hours_used,
        used_spot: used_spot ?? false,
        used_trial: used_trial ?? false,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Booking insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Aggiorna lo slot (e l'eventuale secondo slot presenza) a "prenotato"
    await supabaseAdmin.from('calendar_slots').update({ status: 'prenotato' }).eq('id', slot_id)
    if (second_slot_id) {
      await supabaseAdmin.from('calendar_slots').update({ status: 'prenotato' }).eq('id', second_slot_id)
    }

    // Invia email di conferma (awaited: Vercel termina il processo dopo la risposta)
    if (booking?.id) {
      await sendConfirmEmail(booking.id)
    }

    return NextResponse.json({ id: booking?.id })
  } catch (err: any) {
    console.error('Booking error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
