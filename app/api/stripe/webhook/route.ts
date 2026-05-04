import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function handleSubscriptionUpsert(stripeSubId: string, amountPaid: number) {
  const subscription = await stripe.subscriptions.retrieve(stripeSubId) as any
  const { student_id, sub_type } = subscription.metadata ?? {}

  console.log('[webhook] subscription metadata:', { student_id, sub_type, stripeSubId })

  if (!student_id) {
    console.error('[webhook] ERRORE: student_id mancante nella subscription metadata', stripeSubId)
    return
  }

  const { data: existing, error: selectError } = await supabaseAdmin
    .from('subscriptions').select('id').eq('stripe_subscription_id', stripeSubId).maybeSingle()

  if (selectError) {
    console.error('[webhook] Errore SELECT subscriptions:', selectError)
    return
  }

  const periodStart = new Date(subscription.current_period_start * 1000)
  const periodEnd = new Date(subscription.current_period_end * 1000)
  const priceId = subscription.items.data[0]?.price.id

  if (existing) {
    const { error } = await supabaseAdmin.from('subscriptions').update({
      status: 'attivo',
      starts_at: periodStart.toISOString(),
      expires_at: periodEnd.toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      auto_renew: !subscription.cancel_at_period_end,
    }).eq('stripe_subscription_id', stripeSubId)
    if (error) console.error('[webhook] Errore UPDATE subscriptions:', error)
    else console.log('[webhook] Abbonamento aggiornato (rinnovo):', stripeSubId)
  } else {
    const price = amountPaid / 100
    const { error } = await supabaseAdmin.from('subscriptions').insert({
      student_id,
      type: sub_type || 'mensile',
      status: 'attivo',
      price,
      starts_at: periodStart.toISOString(),
      expires_at: periodEnd.toISOString(),
      stripe_subscription_id: stripeSubId,
      stripe_price_id: priceId,
      auto_renew: true,
      cancel_at_period_end: false,
    })
    if (error) console.error('[webhook] Errore INSERT subscriptions:', error)
    else console.log('[webhook] Nuovo abbonamento inserito:', { student_id, sub_type, stripeSubId })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[webhook] Firma non valida:', err)
    return NextResponse.json({ error: 'Webhook signature non valida' }, { status: 400 })
  }

  console.log('[webhook] Evento ricevuto:', event.type)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('[webhook] checkout mode:', session.mode, 'metadata:', session.metadata)

        // Acquisto ore
        if (session.mode === 'payment' && session.metadata?.type === 'hours') {
          const { student_id, grade, hours, price_per_hour } = session.metadata
          const hoursNum = parseInt(hours)
          const pricePerHour = parseFloat(price_per_hour)
          const field = grade === 'medie' ? 'hour_credits_medie' : grade === 'superiori' ? 'hour_credits_superiori' : 'hour_credits_universita'

          const { data: sp } = await supabaseAdmin.from('student_profiles').select(field).eq('id', student_id).single()
          if (sp) {
            const { error } = await supabaseAdmin.from('student_profiles').update({
              [field]: ((sp as any)[field] || 0) + hoursNum
            }).eq('id', student_id)
            if (error) console.error('[webhook] Errore update ore:', error)
          }
          const { error: insError } = await supabaseAdmin.from('hour_purchases').insert({
            student_id, grade, hours: hoursNum, price_per_hour: pricePerHour,
            total_price: pricePerHour * hoursNum,
          })
          if (insError) console.error('[webhook] Errore insert hour_purchases:', insError)
          else console.log('[webhook] Ore aggiunte:', { student_id, grade, hoursNum })
        }

        // Abbonamento
        if (session.mode === 'subscription' && session.subscription) {
          const stripeSubId = session.subscription as string
          const invoice = await stripe.invoices.list({ subscription: stripeSubId, limit: 1 })
          const amountPaid = invoice.data[0]?.amount_paid ?? 0
          await handleSubscriptionUpsert(stripeSubId, amountPaid)
        }
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const stripeSubId = (invoice as any).subscription as string
        if (!stripeSubId) { console.log('[webhook] invoice.paid senza subscription, skip'); break }
        await handleSubscriptionUpsert(stripeSubId, (invoice as any).amount_paid ?? 0)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const { error } = await supabaseAdmin.from('subscriptions')
          .update({ cancel_at_period_end: subscription.cancel_at_period_end, auto_renew: !subscription.cancel_at_period_end })
          .eq('stripe_subscription_id', subscription.id)
        if (error) console.error('[webhook] Errore subscription.updated:', error)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const { error } = await supabaseAdmin.from('subscriptions')
          .update({ status: 'scaduto' })
          .eq('stripe_subscription_id', subscription.id)
        if (error) console.error('[webhook] Errore subscription.deleted:', error)
        break
      }
    }
  } catch (err) {
    console.error('[webhook] Errore non gestito:', err)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
