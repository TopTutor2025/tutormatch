import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

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
      grade, mode, topic, address, meet_link, hours_used,
    } = await request.json()

    // Usa service role per ottenere sempre l'ID della prenotazione (bypassa RLS SELECT)
    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .insert({
        student_id: user.id,
        tutor_id, slot_id, second_slot_id, subject_id,
        grade, mode, topic, address, meet_link, hours_used,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Booking insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Invia email di conferma (fire & forget)
    if (booking?.id) {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'confirm', bookingId: booking.id }),
      }).catch((e) => console.error('Email fire&forget error:', e))
    }

    return NextResponse.json({ id: booking?.id })
  } catch (err: any) {
    console.error('Booking error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
