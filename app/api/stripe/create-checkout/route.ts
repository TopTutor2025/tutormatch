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

  const { type, subType, grade, hours } = await request.json()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  // Get or create Stripe customer
  const { data: sp } = await supabaseAdmin
    .from('student_profiles').select('stripe_customer_id').eq('id', user.id).single()
  const { data: profile } = await supabaseAdmin
    .from('profiles').select('email, first_name, last_name').eq('id', user.id).single()

  let customerId = sp?.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email,
      name: `${profile?.first_name} ${profile?.last_name}`,
      metadata: { student_id: user.id },
    })
    customerId = customer.id
    await supabaseAdmin.from('student_profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }

  if (type === 'subscription') {
    // Get current price ID from pricing_config
    const { data: pricing } = await supabaseAdmin.from('pricing_config').select('*').single()
    const priceId = subType === 'mensile' ? pricing?.stripe_price_id_mensile : pricing?.stripe_price_id_annuale
    if (!priceId) {
      return NextResponse.json({ error: 'Prezzi Stripe non configurati. Vai su Admin → Prezzi e salva i prezzi.' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        metadata: { student_id: user.id, sub_type: subType },
      },
      success_url: `${appUrl}/studente/abbonamento?success=1`,
      cancel_url: `${appUrl}/studente/abbonamento`,
      locale: 'it',
    })
    return NextResponse.json({ url: session.url })
  }

  if (type === 'hours') {
    const { data: pricing } = await supabaseAdmin.from('pricing_config').select('*').single()
    const rate = grade === 'universita' ? pricing?.hour_rate_universita : pricing?.hour_rate_medie
    const totalCents = Math.round(rate * hours * 100)

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: totalCents,
          product_data: {
            name: `${hours}h lezione - ${grade === 'medie' ? 'Scuola Media' : grade === 'superiori' ? 'Scuola Superiore' : 'Università'}`,
          },
        },
      }],
      metadata: {
        type: 'hours',
        student_id: user.id,
        grade,
        hours: String(hours),
        price_per_hour: String(rate),
      },
      success_url: `${appUrl}/studente/ore?success=1`,
      cancel_url: `${appUrl}/studente/ore`,
      locale: 'it',
    })
    return NextResponse.json({ url: session.url })
  }

  return NextResponse.json({ error: 'Tipo non valido' }, { status: 400 })
}
