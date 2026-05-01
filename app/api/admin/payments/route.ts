import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(request: NextRequest) {
  // Verifica che chi chiama sia admin autenticato
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })

  // Usa service role per bypassare RLS e leggere tutti i pagamenti
  const { data: payments, error } = await supabaseAdmin
    .from('tutor_payments')
    .select('*')
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!payments?.length) return NextResponse.json({ data: [] })

  // Recupera dati tutor separatamente
  const tutorIds = [...new Set(payments.map(p => p.tutor_id))]

  const { data: tutorProfiles } = await supabaseAdmin
    .from('tutor_profiles')
    .select('*')
    .in('id', tutorIds)

  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .in('id', tutorIds)

  const tpMap = Object.fromEntries((tutorProfiles || []).map(t => [t.id, t]))
  const profMap = Object.fromEntries((profiles || []).map(p => [p.id, p]))

  const data = payments.map(p => ({
    ...p,
    tutor: tpMap[p.tutor_id]
      ? { ...tpMap[p.tutor_id], profile: profMap[p.tutor_id] || null }
      : null,
  }))

  return NextResponse.json({ data })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })

  const { id, status } = await request.json()
  if (!id || !status) return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('tutor_payments')
    .update({ status })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
