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
      <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-200 px-4 py-3.5 sm:px-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wide bg-emerald-500 text-white px-2 py-0.5 rounded-full">Lezione di prova</span>
            <h2 className="text-sm font-bold text-gray-900 mt-1.5">Prova il servizio con 1 lezione a 15€</h2>
            <p className="text-xs text-gray-500 mt-0.5 leading-snug">
              1 lezione <strong className="text-gray-700">online da 1 ora</strong>, valida per ogni grado e <strong className="text-gray-700">senza abbonamento</strong> · una per account.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2.5 w-full sm:w-44 flex-shrink-0 sm:border-l sm:border-emerald-200 sm:pl-5">
            {studentProfile?.trial_purchased ? (
              (studentProfile?.hour_credits_trial || 0) > 0 ? (
                <div className="text-center">
                  <p className="text-sm font-bold text-emerald-600">Prova disponibile</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Prenotala da “Cerca tutor”</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-400">Già utilizzata</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Hai già usato la prova</p>
                </div>
              )
            ) : (
              <>
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-emerald-600 leading-none">{formatCurrency(15)}</p>
                  <p className="text-[10px] text-gray-500 mt-1">1 lezione online</p>
                </div>
                <Button size="sm" loading={redirecting} onClick={() => buy('trial')}
                  className="w-full rounded-xl !bg-gradient-to-r from-emerald-400 to-teal-400 !text-black shadow-[0_4px_14px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_18px_rgba(16,185,129,0.5)]">
                  <Plus className="w-3.5 h-3.5" /> Prova ora
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Pacchetto Spot */}
      <div className="bg-gradient-to-br from-pink-50 to-white rounded-2xl border border-pink-200 px-4 py-3.5 sm:px-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wide bg-pink-500 text-white px-2 py-0.5 rounded-full">Pacchetto Spot</span>
            <h2 className="text-sm font-bold text-gray-900 mt-1.5">15 ore a 20€/ora — senza abbonamento</h2>
            <p className="text-xs text-gray-500 mt-0.5 leading-snug">
              Ore valide per <strong className="text-gray-700">ogni grado</strong> e utilizzabili <strong className="text-gray-700">senza abbonamento attivo</strong> · pacchetto unico da 15 ore.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2.5 w-full sm:w-44 flex-shrink-0 sm:border-l sm:border-pink-200 sm:pl-5">
            <div className="text-center">
              <p className="text-2xl font-extrabold text-pink-600 leading-none">{formatCurrency(300)}</p>
              <p className="text-[10px] text-gray-500 mt-1">15h · 20€/ora</p>
            </div>
            <Button size="sm" loading={redirecting} onClick={() => buy('spot')}
              className="w-full rounded-xl !bg-gradient-to-r from-pink-400 to-rose-400 !text-black shadow-[0_4px_14px_rgba(236,72,153,0.35)] hover:shadow-[0_6px_18px_rgba(236,72,153,0.5)]">
              <Plus className="w-3.5 h-3.5" /> Acquista
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
