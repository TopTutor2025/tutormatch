import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const { subscriptionId, autoRenew } = await request.json()

  // Verify the subscription belongs to this student
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('stripe_subscription_id, student_id')
    .eq('id', subscriptionId)
    .single()

  if (!sub || sub.student_id !== user.id) {
    return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
  }
  if (!sub.stripe_subscription_id) {
    return NextResponse.json({ error: 'Abbonamento non gestito da Stripe' }, { status: 400 })
  }

  await stripe.subscriptions.update(sub.stripe_subscription_id, {
    cancel_at_period_end: !autoRenew,
  })

  await supabaseAdmin.from('subscriptions').update({
    auto_renew: autoRenew,
    cancel_at_period_end: !autoRenew,
  }).eq('id', subscriptionId)

  return NextResponse.json({ success: true, auto_renew: autoRenew })
}
