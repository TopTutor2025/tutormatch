'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Clock, Plus, AlertCircle, CheckCircle } from 'lucide-react'
import { formatDate, formatCurrency, GRADE_LABELS } from '@/lib/utils'
import Button from '@/components/ui/Button'
import type { StudentProfile, PricingConfig, HourPurchase, Subscription } from '@/types/database'

export default function OrePage() {
  const supabase = createClient()
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)
  const [pricing, setPricing] = useState<PricingConfig | null>(null)
  const [purchases, setPurchases] = useState<HourPurchase[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [redirecting, setRedirecting] = useState(false)
  const [form, setForm] = useState({ grade: 'medie' as 'medie' | 'superiori' | 'universita', hours: 1 })
  const [userId, setUserId] = useState('')
  const searchParams = useSearchParams()
  const justPaid = searchParams.get('success') === '1'

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const [{ data: sp }, { data: price }, { data: hist }, { data: sub }] = await Promise.all([
        supabase.from('student_profiles').select('*').eq('id', user.id).single(),
        supabase.from('pricing_config').select('*').single(),
        supabase.from('hour_purchases').select('*').eq('student_id', user.id).order('created_at', { ascending: false }),
        supabase.from('subscriptions').select('*').eq('student_id', user.id).eq('status', 'attivo').single(),
      ])
      setStudentProfile(sp)
      setPricing(price)
      setPurchases(hist || [])
      setSubscription(sub)
      setLoading(false)
    }
    load()
  }, [])

  function getRate(grade: string) {
    if (!pricing) return 0
    if (grade === 'universita') return pricing.hour_rate_universita
    return pricing.hour_rate_medie
  }

  async function buyHours() {
    if (!subscription) { alert('Hai bisogno di un abbonamento attivo per acquistare ore.'); return }
    setRedirecting(true)
    const res = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'hours', grade: form.grade, hours: form.hours }),
    })
    const { url, error } = await res.json()
    if (error) { alert(error); setRedirecting(false); return }
    window.location.href = url
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black">Ore lezione</h1>
        <p className="text-gray-500 mt-1">Acquista ore e gestisci il tuo credito</p>
      </div>

      {justPaid && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700 font-medium">Pagamento completato! Le ore sono state aggiunte al tuo account.</p>
        </div>
      )}

      {!subscription && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700 font-medium">Hai bisogno di un abbonamento attivo per acquistare ore lezione.</p>
        </div>
      )}

      {/* Contatore ore */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Scuola Media', field: 'hour_credits_medie', rate: pricing?.hour_rate_medie || 10, color: 'bg-blue-50 border-blue-200' },
          { label: 'Scuola Superiore', field: 'hour_credits_superiori', rate: pricing?.hour_rate_medie || 10, color: 'bg-purple-50 border-purple-200' },
          { label: 'Università', field: 'hour_credits_universita', rate: pricing?.hour_rate_universita || 12.5, color: 'bg-orange-50 border-orange-200' },
        ].map(item => (
          <div key={item.field} className={`rounded-2xl border p-5 sm:p-6 flex sm:flex-col items-center sm:items-center gap-4 sm:gap-0 sm:text-center ${item.color}`}>
            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 sm:mx-auto sm:mb-3">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </div>
            <div className="flex-1 sm:flex-none">
              <p className="text-3xl font-extrabold text-black">{studentProfile?.[item.field as keyof StudentProfile] || 0}<span className="text-lg font-normal">h</span></p>
              <p className="text-sm font-medium text-gray-700 sm:mt-1">{item.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(item.rate)}/ora</p>
            </div>
          </div>
        ))}
      </div>

      {/* Acquisto ore */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6">
        <h2 className="text-lg font-bold mb-5">Acquista ore lezione</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Grado scolastico</label>
              <div className="space-y-2">
                {[
                  { value: 'medie', label: 'Scuola Media', rate: pricing?.hour_rate_medie },
                  { value: 'superiori', label: 'Scuola Superiore', rate: pricing?.hour_rate_medie },
                  { value: 'universita', label: 'Università', rate: pricing?.hour_rate_universita },
                ].map(g => (
                  <label key={g.value} className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${form.grade === g.value ? 'bg-black text-white border-black' : 'bg-white border-gray-200 hover:border-gray-400'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" value={g.value} checked={form.grade === g.value} onChange={e => setForm(f => ({ ...f, grade: e.target.value as any }))} className="sr-only" />
                      <span className="text-sm font-medium">{g.label}</span>
                    </div>
                    <span className={`text-sm font-bold ${form.grade === g.value ? 'text-white' : 'text-black'}`}>
                      {formatCurrency(g.rate || 0)}/h
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Numero di ore</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setForm(f => ({ ...f, hours: Math.max(1, f.hours - 1) }))}
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-100 font-bold text-lg">−</button>
                <span className="w-16 text-center text-2xl font-bold">{form.hours}</span>
                <button onClick={() => setForm(f => ({ ...f, hours: f.hours + 1 }))}
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-100 font-bold text-lg">+</button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-4">Riepilogo acquisto</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Grado</span><span className="font-medium">{GRADE_LABELS[form.grade]}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Ore</span><span className="font-medium">{form.hours}h</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Tariffa</span><span className="font-medium">{formatCurrency(getRate(form.grade))}/h</span></div>
                <div className="flex justify-between pt-2 border-t border-gray-200 text-base">
                  <span className="font-bold">Totale</span>
                  <span className="font-extrabold">{formatCurrency(getRate(form.grade) * form.hours)}</span>
                </div>
              </div>
            </div>
            <Button className="w-full mt-6" size="lg" loading={redirecting} disabled={!subscription} onClick={buyHours}>
              <Plus className="w-4 h-4" /> Acquista {form.hours}h
            </Button>
          </div>
        </div>
      </div>

      {/* Storico acquisti */}
      {purchases.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4">Storico acquisti</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Data', 'Grado', 'Ore', 'Tariffa', 'Totale'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {purchases.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(p.created_at)}</td>
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{GRADE_LABELS[p.grade]}</td>
                      <td className="px-4 py-3">{p.hours}h</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatCurrency(p.price_per_hour)}/h</td>
                      <td className="px-4 py-3 font-bold">{formatCurrency(p.total_price)}</td>
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
