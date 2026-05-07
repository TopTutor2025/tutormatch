'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Settings, AlertCircle, Save, ToggleLeft, ToggleRight } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import type { PricingConfig } from '@/types/database'

export default function AdminPrezziPage() {
  const supabase = createClient()
  const [pricing, setPricing] = useState<PricingConfig | null>(null)
  const [form, setForm] = useState({
    subscription_monthly: '', subscription_annual: '',
    hour_rate_medie: '', hour_rate_superiori: '', hour_rate_universita: ''
  })
  const [mensileEnabled, setMensileEnabled] = useState(true)
  const [annualeEnabled, setAnnualeEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [togglingMensile, setTogglingMensile] = useState(false)
  const [togglingAnnuale, setTogglingAnnuale] = useState(false)

  useEffect(() => {
    supabase.from('pricing_config').select('*').single().then(({ data }) => {
      setPricing(data)
      if (data) {
        setForm({
          subscription_monthly: data.subscription_monthly.toString(),
          subscription_annual: data.subscription_annual.toString(),
          hour_rate_medie: data.hour_rate_medie.toString(),
          hour_rate_superiori: data.hour_rate_superiori.toString(),
          hour_rate_universita: data.hour_rate_universita.toString(),
        })
        setMensileEnabled(data.mensile_enabled ?? true)
        setAnnualeEnabled(data.annuale_enabled ?? true)
      }
      setLoading(false)
    })
  }, [])

  async function toggleMensile() {
    if (!pricing) return
    setTogglingMensile(true)
    const newVal = !mensileEnabled
    await supabase.from('pricing_config').update({ mensile_enabled: newVal }).eq('id', pricing.id)
    setMensileEnabled(newVal)
    setTogglingMensile(false)
  }

  async function toggleAnnuale() {
    if (!pricing) return
    setTogglingAnnuale(true)
    const newVal = !annualeEnabled
    await supabase.from('pricing_config').update({ annuale_enabled: newVal }).eq('id', pricing.id)
    setAnnualeEnabled(newVal)
    setTogglingAnnuale(false)
  }

  async function save() {
    setSaving(true)
    const monthly = parseFloat(form.subscription_monthly)
    const annual = parseFloat(form.subscription_annual)

    await supabase.from('pricing_config').update({
      subscription_monthly: monthly,
      subscription_annual: annual,
      hour_rate_medie: parseFloat(form.hour_rate_medie),
      hour_rate_superiori: parseFloat(form.hour_rate_superiori),
      hour_rate_universita: parseFloat(form.hour_rate_universita),
    }).eq('id', pricing!.id)

    // Chiama Stripe solo se sono cambiati i prezzi degli abbonamenti
    const monthlyChanged = monthly !== pricing?.subscription_monthly
    const annualChanged = annual !== pricing?.subscription_annual
    if (monthlyChanged || annualChanged) {
      const res = await fetch('/api/stripe/admin/update-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription_monthly: monthly, subscription_annual: annual }),
      })
      if (!res.ok) {
        const { error } = await res.json()
        alert(`Prezzi salvati in DB ma errore Stripe: ${error}`)
      }
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-black">Gestione Prezzi</h1>
        <p className="text-gray-500 mt-1">Modifica i prezzi e la disponibilità degli abbonamenti</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-800 text-sm">Attenzione</p>
          <p className="text-sm text-amber-700 mt-1">
            Le modifiche ai prezzi si applicano solo ai nuovi acquisti. Non influenzano le ore già nei contatori degli studenti né gli abbonamenti in corso.
          </p>
        </div>
      </div>

      {/* Disponibilità abbonamenti */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-8 space-y-5">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <ToggleRight className="w-5 h-5" /> Disponibilità abbonamenti
        </h2>
        <p className="text-sm text-gray-500 -mt-2">
          Attiva o disattiva la vendita di ciascun piano. Quando disattivato, gli studenti vedono un messaggio che li indirizza all'altro piano.
        </p>

        <div className="space-y-4">
          {/* Toggle mensile */}
          <div className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${mensileEnabled ? 'border-gray-200 bg-gray-50' : 'border-orange-200 bg-orange-50'}`}>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Piano Mensile — {formatCurrency(pricing?.subscription_monthly || 14.99)}/mese</p>
              <p className={`text-xs mt-0.5 ${mensileEnabled ? 'text-green-600' : 'text-orange-600'}`}>
                {mensileEnabled ? '✓ Visibile e acquistabile dagli studenti' : '✗ Nascosto — gli studenti vengono indirizzati al piano Annuale'}
              </p>
            </div>
            <button
              onClick={toggleMensile}
              disabled={togglingMensile}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none disabled:opacity-60 ${mensileEnabled ? 'bg-black' : 'bg-gray-300'}`}>
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${mensileEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Toggle annuale */}
          <div className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${annualeEnabled ? 'border-gray-200 bg-gray-50' : 'border-orange-200 bg-orange-50'}`}>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Piano Annuale — {formatCurrency(pricing?.subscription_annual || 99.99)}/anno</p>
              <p className={`text-xs mt-0.5 ${annualeEnabled ? 'text-green-600' : 'text-orange-600'}`}>
                {annualeEnabled ? '✓ Visibile e acquistabile dagli studenti' : '✗ Nascosto — gli studenti vengono indirizzati al piano Mensile'}
              </p>
            </div>
            <button
              onClick={toggleAnnuale}
              disabled={togglingAnnuale}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none disabled:opacity-60 ${annualeEnabled ? 'bg-black' : 'bg-gray-300'}`}>
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${annualeEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Prezzi */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-8 space-y-8">
        <div>
          <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Settings className="w-5 h-5" /> Prezzi abbonamenti
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input label="Abbonamento Mensile (€)" type="number" step="0.01" min="0"
                value={form.subscription_monthly} onChange={e => setForm(f => ({ ...f, subscription_monthly: e.target.value }))}
              />
              <p className="text-xs text-gray-400 mt-1">Attuale: {pricing ? formatCurrency(pricing.subscription_monthly) : '—'}</p>
            </div>
            <div>
              <Input label="Abbonamento Annuale (€)" type="number" step="0.01" min="0"
                value={form.subscription_annual} onChange={e => setForm(f => ({ ...f, subscription_annual: e.target.value }))}
              />
              <p className="text-xs text-gray-400 mt-1">Attuale: {pricing ? formatCurrency(pricing.subscription_annual) : '—'}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8">
          <h2 className="font-bold text-gray-900 mb-5">Tariffe ore lezione</h2>
          <div className="space-y-4">
            {[
              { key: 'hour_rate_medie', label: 'Scuola Media (€/ora)', current: pricing?.hour_rate_medie },
              { key: 'hour_rate_superiori', label: 'Scuola Superiore (€/ora)', current: pricing?.hour_rate_superiori },
              { key: 'hour_rate_universita', label: 'Università (€/ora)', current: pricing?.hour_rate_universita },
            ].map(item => (
              <div key={item.key} className="flex items-end gap-4">
                <div className="flex-1">
                  <Input label={item.label} type="number" step="0.01" min="0"
                    value={form[item.key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [item.key]: e.target.value }))}
                  />
                </div>
                <p className="text-sm text-gray-400 pb-3">Attuale: {item.current ? formatCurrency(item.current) : '—'}</p>
              </div>
            ))}
          </div>
        </div>

        <Button loading={saving} onClick={save} className="w-full" size="lg">
          <Save className="w-4 h-4" /> {saved ? 'Prezzi aggiornati!' : 'Salva nuovi prezzi'}
        </Button>
      </div>
    </div>
  )
}
