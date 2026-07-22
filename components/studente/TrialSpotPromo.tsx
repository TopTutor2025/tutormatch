'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Button from '@/components/ui/Button'
import type { StudentProfile } from '@/types/database'

export default function TrialSpotPromo({ studentProfile }: { studentProfile: StudentProfile | null }) {
  const [redirecting, setRedirecting] = useState(false)

  async function buy(type: 'trial' | 'spot') {
    setRedirecting(true)
    const res = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    })
    const { url, error } = await res.json()
    if (error) { alert(error); setRedirecting(false); return }
    window.location.href = url
  }

  return (
    <>
      {/* Lezione di prova */}
      <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl border-2 border-emerald-200 p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wide bg-emerald-500 text-white px-2 py-0.5 rounded-full">Lezione di prova</span>
            </div>
            <h2 className="text-base font-bold text-gray-900">Prova il servizio con 1 lezione a 15€</h2>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Una lezione di prova <strong>online da 1 ora</strong>, valida per <strong>qualsiasi grado</strong> e prenotabile <strong>senza abbonamento</strong>. Disponibile <strong>una sola volta per account</strong>.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-emerald-200 p-4 text-center md:w-48 flex-shrink-0">
            {studentProfile?.trial_purchased ? (
              (studentProfile?.hour_credits_trial || 0) > 0 ? (
                <>
                  <p className="text-sm font-bold text-emerald-600">Prova disponibile</p>
                  <p className="text-[11px] text-gray-500 mt-1">Prenotala da “Cerca tutor” scegliendo uno slot online</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-gray-400">Già utilizzata</p>
                  <p className="text-[11px] text-gray-400 mt-1">Hai già usato la tua lezione di prova</p>
                </>
              )
            ) : (
              <>
                <p className="text-2xl font-extrabold text-emerald-600">{formatCurrency(15)}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">1 lezione online</p>
                <Button className="w-full mt-3" size="sm" loading={redirecting} onClick={() => buy('trial')}>
                  <Plus className="w-3.5 h-3.5" /> Prova ora
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Pacchetto Spot */}
      <div className="bg-gradient-to-br from-pink-50 to-white rounded-2xl border-2 border-pink-200 p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wide bg-pink-500 text-white px-2 py-0.5 rounded-full">Pacchetto Spot</span>
            </div>
            <h2 className="text-base font-bold text-gray-900">15 ore a 20€/ora — senza abbonamento</h2>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Le ore Spot sono valide per <strong>qualsiasi grado</strong> (medie, superiori, università) e ti permettono di prenotare lezioni <strong>anche senza un abbonamento attivo</strong>. Pacchetto unico da 15 ore.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-pink-200 p-4 text-center md:w-48 flex-shrink-0">
            <p className="text-2xl font-extrabold text-pink-600">{formatCurrency(300)}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">15h · 20€/ora</p>
            <Button className="w-full mt-3" size="sm" loading={redirecting} onClick={() => buy('spot')}>
              <Plus className="w-3.5 h-3.5" /> Acquista pacchetto
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
