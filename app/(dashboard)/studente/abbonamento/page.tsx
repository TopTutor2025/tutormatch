'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CreditCard, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import Button from '@/components/ui/Button'
import type { Subscription, PricingConfig } from '@/types/database'

export default function AbbonamentoPage() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null)
  const [history, setHistory] = useState<Subscription[]>([])
  const [pricing, setPricing] = useState<PricingConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [redirecting, setRedirecting] = useState<string | null>(null)
  const [togglingRenewal, setTogglingRenewal] = useState(false)
  const [autoRenew, setAutoRenew] = useState(true)

  const justPaid = searchParams.get('success') === '1'

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: subs }, { data: price }] = await Promise.all([
        supabase.from('subscriptions').select('*').eq('student_id', user.id).order('created_at', { ascending: false }),
        supabase.from('pricing_config').select('*').single(),
      ])
      const active = subs?.find((s: any) => s.status === 'attivo') || null
      setActiveSubscription(active)
      setAutoRenew(active?.auto_renew ?? true)
      setHistory(subs || [])
      setPricing(price)
      setLoading(false)
    }
    load()
  }, [])

  async function goToCheckout(subType: 'mensile' | 'annuale') {
    setRedirecting(subType)
    const res = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'subscription', subType }),
    })
    const { url, error } = await res.json()
    if (error) { alert(error); setRedirecting(null); return }
    window.location.href = url
  }

  async function toggleRenewal() {
    if (!activeSubscription) return
    setTogglingRenewal(true)
    const newValue = !autoRenew
    const res = await fetch('/api/stripe/toggle-renewal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId: activeSubscription.id, autoRenew: newValue }),
    })
    const { error } = await res.json()
    if (error) { alert(error) } else { setAutoRenew(newValue) }
    setTogglingRenewal(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black">Abbonamento</h1>
        <p className="text-gray-500 mt-1">Gestisci il tuo abbonamento TutorMatch</p>
      </div>

      {/* Banner pagamento completato */}
      {justPaid && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700 font-medium">Pagamento completato! Il tuo abbonamento è ora attivo.</p>
        </div>
      )}

      {activeSubscription ? (
        <div className="bg-gradient-to-r from-green-50 to-white border border-green-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">Abbonamento {activeSubscription.type === 'mensile' ? 'Mensile' : 'Annuale'} attivo</p>
              <p className="text-sm text-gray-500 mt-1">Attivo dal {formatDate(activeSubscription.starts_at)}</p>
              <p className="text-sm text-gray-500">Scade il {formatDate(activeSubscription.expires_at)}</p>
              <p className="text-sm text-gray-500">Pagato: {formatCurrency(activeSubscription.price)}</p>
            </div>
          </div>

          {/* Toggle rinnovo automatico */}
          {(activeSubscription as any).stripe_subscription_id && (
            <div className="border-t border-green-100 pt-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-sm text-gray-900">Rinnovo automatico</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {autoRenew
                      ? `Si rinnova automaticamente il ${formatDate(activeSubscription.expires_at)}`
                      : `Scade il ${formatDate(activeSubscription.expires_at)} senza rinnovo`}
                  </p>
                </div>
                <button
                  onClick={toggleRenewal}
                  disabled={togglingRenewal}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-60 ${autoRenew ? 'bg-black' : 'bg-gray-300'}`}>
                  {togglingRenewal && <RefreshCw className="absolute inset-0 m-auto w-3 h-3 text-white animate-spin" />}
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${autoRenew ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              {!autoRenew && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  Il rinnovo è disattivato. L'abbonamento non si rinnoverà alla scadenza.
                </p>
              )}
            </div>
          )}

          <div className="border-t border-green-100 pt-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>Puoi acquistare un nuovo abbonamento solo dopo la scadenza di quello attuale</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Mensile */}
          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-gray-600" />
              </div>
              <h3 className="text-lg font-bold">Mensile</h3>
            </div>
            <div className="text-4xl font-extrabold mb-1">{formatCurrency(pricing?.subscription_monthly || 14.99)}</div>
            <p className="text-sm text-gray-400 mb-6">al mese · rinnovo automatico</p>
            <ul className="space-y-2 text-sm text-gray-600 mb-8">
              {['Accesso completo ai tutor', 'Prenotazioni illimitate (salvo ore)', 'Chat con i tutor', 'Storico lezioni'].map(f => (
                <li key={f} className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />{f}</li>
              ))}
            </ul>
            <Button className="w-full" size="lg" loading={redirecting === 'mensile'} onClick={() => goToCheckout('mensile')}>
              Abbonati · {formatCurrency(pricing?.subscription_monthly || 14.99)}/mese
            </Button>
          </div>

          {/* Annuale */}
          <div className="bg-black rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full">Risparmia</div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold">Annuale</h3>
            </div>
            <div className="text-4xl font-extrabold mb-1">{formatCurrency(pricing?.subscription_annual || 99.99)}</div>
            <p className="text-sm text-gray-400 mb-6">all'anno · equivale a {formatCurrency((pricing?.subscription_annual || 99.99) / 12)}/mese</p>
            <ul className="space-y-2 text-sm text-gray-300 mb-8">
              {['Tutto del mensile', 'Accesso 12 mesi', 'Priorità supporto', 'Risparmio garantito'].map(f => (
                <li key={f} className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-pink-400 flex-shrink-0" />{f}</li>
              ))}
            </ul>
            <button onClick={() => goToCheckout('annuale')} disabled={!!redirecting}
              className="w-full bg-white text-black font-bold py-3.5 rounded-2xl hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {redirecting === 'annuale' && <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />}
              Abbonati · {formatCurrency(pricing?.subscription_annual || 99.99)}/anno
            </button>
          </div>
        </div>
      )}

      {/* Storico */}
      {history.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4">Storico abbonamenti</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Tipo', 'Inizio', 'Scadenza', 'Prezzo', 'Stato'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium capitalize whitespace-nowrap">{sub.type}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(sub.starts_at)}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(sub.expires_at)}</td>
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{formatCurrency(sub.price)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          sub.status === 'attivo' ? 'bg-green-100 text-green-700' :
                          sub.status === 'scaduto' ? 'bg-gray-100 text-gray-600' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {sub.status === 'attivo' ? 'Attivo' : sub.status === 'scaduto' ? 'Scaduto' : 'Cancellato'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        </div>
      )}
    </div>
  )
}
