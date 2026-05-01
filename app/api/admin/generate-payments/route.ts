import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: NextRequest) {
  // Verifica che chi chiama sia admin autenticato
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })

  try {
    const { error } = await supabaseAdmin.rpc('generate_monthly_payments')
    if (error) {
      console.error('Error generating payments:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Pagamenti mensili generati con successo',
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('Admin generate payments error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
