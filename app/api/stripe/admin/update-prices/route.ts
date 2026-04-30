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
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })

  const { subscription_monthly, subscription_annual } = await request.json()

  const productIdMensile = process.env.STRIPE_PRODUCT_ID_MENSILE!
  const productIdAnnuale = process.env.STRIPE_PRODUCT_ID_ANNUALE!

  if (!productIdMensile || !productIdAnnuale) {
    return NextResponse.json({ error: 'STRIPE_PRODUCT_ID_MENSILE e STRIPE_PRODUCT_ID_ANNUALE non configurati in .env.local' }, { status: 500 })
  }

  // Create new Stripe Prices
  const [priceMensile, priceAnnuale] = await Promise.all([
    stripe.prices.create({
      product: productIdMensile,
      unit_amount: Math.round(subscription_monthly * 100),
      currency: 'eur',
      recurring: { interval: 'month' },
    }),
    stripe.prices.create({
      product: productIdAnnuale,
      unit_amount: Math.round(subscription_annual * 100),
      currency: 'eur',
      recurring: { interval: 'year' },
    }),
  ])

  // Update pricing_config with new Price IDs
  const { data: pricing } = await supabaseAdmin.from('pricing_config').select('id').single()
  await supabaseAdmin.from('pricing_config').update({
    stripe_price_id_mensile: priceMensile.id,
    stripe_price_id_annuale: priceAnnuale.id,
  }).eq('id', pricing!.id)

  // Update all active recurring subscriptions to new price — no proration (takes effect at next renewal)
  const { data: activeSubs } = await supabaseAdmin
    .from('subscriptions')
    .select('id, type, stripe_subscription_id')
    .eq('status', 'attivo')
    .not('stripe_subscription_id', 'is', null)

  if (activeSubs?.length) {
    await Promise.all(activeSubs.map(async (sub) => {
      const newPriceId = sub.type === 'mensile' ? priceMensile.id : priceAnnuale.id
      try {
        const stripeSub = await stripe.subscriptions.retrieve(sub.stripe_subscription_id)
        await stripe.subscriptions.update(sub.stripe_subscription_id, {
          items: [{ id: stripeSub.items.data[0].id, price: newPriceId }],
          proration_behavior: 'none', // no charge now, new price at next renewal
        })
        await supabaseAdmin.from('subscriptions').update({ stripe_price_id: newPriceId }).eq('id', sub.id)
      } catch {
        // Skip if Stripe sub no longer exists
      }
    }))
  }

  return NextResponse.json({
    success: true,
    price_mensile: priceMensile.id,
    price_annuale: priceAnnuale.id,
    updated_subscriptions: activeSubs?.length ?? 0,
  })
}
