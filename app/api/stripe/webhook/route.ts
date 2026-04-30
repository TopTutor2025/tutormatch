import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature non valida' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode === 'payment' && session.metadata?.type === 'hours') {
        const { student_id, grade, hours, price_per_hour } = session.metadata
        const hoursNum = parseInt(hours)
        const pricePerHour = parseFloat(price_per_hour)
        const field = grade === 'medie' ? 'hour_credits_medie' : grade === 'superiori' ? 'hour_credits_superiori' : 'hour_credits_universita'

        const { data: sp } = await supabaseAdmin.from('student_profiles').select(field).eq('id', student_id).single()
        if (sp) {
          await supabaseAdmin.from('student_profiles').update({
            [field]: ((sp as any)[field] || 0) + hoursNum
          }).eq('id', student_id)
        }
        await supabaseAdmin.from('hour_purchases').insert({
          student_id,
          grade,
          hours: hoursNum,
          price_per_hour: pricePerHour,
          total_price: pricePerHour * hoursNum,
        })
      }
      break
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice
      const stripeSubId = (invoice as any).subscription as string
      if (!stripeSubId) break

      const subscription = await stripe.subscriptions.retrieve(stripeSubId)
      const { student_id, sub_type } = subscription.metadata
      if (!student_id) break

      const priceId = subscription.items.data[0]?.price.id
      const periodEnd = new Date(subscription.current_period_end * 1000)
      const periodStart = new Date(subscription.current_period_start * 1000)

      // Check if subscription already exists in DB
      const { data: existing } = await supabaseAdmin
        .from('subscriptions').select('id').eq('stripe_subscription_id', stripeSubId).maybeSingle()

      if (existing) {
        // Renewal: update period
        await supabaseAdmin.from('subscriptions').update({
          status: 'attivo',
          starts_at: periodStart.toISOString(),
          expires_at: periodEnd.toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          auto_renew: !subscription.cancel_at_period_end,
        }).eq('stripe_subscription_id', stripeSubId)
      } else {
        // New subscription
        const price = (invoice as any).amount_paid / 100
        await supabaseAdmin.from('subscriptions').insert({
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
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const cancelAtEnd = subscription.cancel_at_period_end
      await supabaseAdmin.from('subscriptions')
        .update({ cancel_at_period_end: cancelAtEnd, auto_renew: !cancelAtEnd })
        .eq('stripe_subscription_id', subscription.id)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await supabaseAdmin.from('subscriptions')
        .update({ status: 'scaduto' })
        .eq('stripe_subscription_id', subscription.id)
      break
    }
  }

  return NextResponse.json({ received: true })
}
