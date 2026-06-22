'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, ChevronDown, ChevronUp, Shield } from 'lucide-react'

type CookiePrefs = { necessary: true; analytics: boolean; marketing: boolean }

export default function CookieBanner() {
  const [show, setShow] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [prefs, setPrefs] = useState<CookiePrefs>({ necessary: true, analytics: false, marketing: false })

  useEffect(() => {
    const saved = localStorage.getItem('cookie_consent')
    if (!saved) setShow(true)
  }, [])

  function save(p: CookiePrefs) {
    localStorage.setItem('cookie_consent', JSON.stringify(p))
    localStorage.setItem('cookie_consent_date', new Date().toISOString())
    setShow(false)
  }

  function acceptAll() { save({ necessary: true, analytics: true, marketing: true }) }
  function rejectAll() { save({ necessary: true, analytics: false, marketing: false }) }
  function saveCustom() { save(prefs) }

  if (!show) return null

  const greenBtn = 'text-black bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_22px_rgba(16,185,129,0.4)] hover:shadow-[0_0_32px_rgba(16,185,129,0.6)]'

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 md:p-6">
      <div className="max-w-4xl mx-auto bg-[#0c1110]/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
        {/* Main row */}
        <div className="p-4 md:p-6">
          <div className="flex items-start gap-3 md:gap-4">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-amber-500/15 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <Cookie className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm">Usiamo i cookie 🍪</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                proflive.app utilizza cookie tecnici necessari al funzionamento del sito e, con il tuo consenso, cookie analitici per migliorare l&apos;esperienza.
                Nessun dato viene venduto a terzi. Leggi la nostra{' '}
                <Link href="/cookie" className="text-emerald-400 underline hover:text-emerald-300 transition-colors">Cookie Policy</Link>
                {' '}e la{' '}
                <Link href="/privacy" className="text-emerald-400 underline hover:text-emerald-300 transition-colors">Privacy Policy</Link>.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 mt-4">
            <button
              onClick={acceptAll}
              className={`text-xs font-semibold px-5 py-2.5 rounded-2xl transition-all ${greenBtn}`}>
              Accetta tutti
            </button>
            <button
              onClick={rejectAll}
              className="bg-white/10 text-gray-200 text-xs font-semibold px-5 py-2.5 rounded-2xl hover:bg-white/20 transition-colors">
              Solo necessari
            </button>
            <button
              onClick={() => setExpanded(v => !v)}
              className="flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-white font-medium px-3 py-2.5 rounded-2xl transition-colors sm:ml-auto">
              Personalizza
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expanded preferences */}
        {expanded && (
          <div className="border-t border-white/10 px-5 md:px-6 py-4 bg-white/5 space-y-3">
            {[
              {
                key: 'necessary' as const,
                label: 'Cookie tecnici necessari',
                desc: 'Essenziali per il funzionamento del sito (autenticazione, sessione, preferenze UI). Non possono essere disattivati.',
                locked: true,
              },
              {
                key: 'analytics' as const,
                label: 'Cookie analitici',
                desc: 'Ci aiutano a capire come viene usata la piattaforma (pagine visitate, tempo di sessione). Dati aggregati e anonimi.',
                locked: false,
              },
              {
                key: 'marketing' as const,
                label: 'Cookie di marketing',
                desc: 'Utilizzati per mostrare contenuti pertinenti e misurare l\'efficacia di eventuali campagne promozionali.',
                locked: false,
              },
            ].map(item => (
              <div key={item.key} className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-gray-100">{item.label}</p>
                    {item.locked && (
                      <span className="text-[10px] bg-white/10 text-gray-400 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <Shield className="w-2.5 h-2.5" /> Sempre attivo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
                <div className="flex-shrink-0 pt-0.5">
                  <button
                    disabled={item.locked}
                    onClick={() => !item.locked && setPrefs(p => ({ ...p, [item.key]: !p[item.key] }))}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      prefs[item.key] ? 'bg-emerald-400' : 'bg-white/20'
                    } ${item.locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      prefs[item.key] ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={saveCustom}
              className={`w-full mt-2 text-xs font-semibold py-2.5 rounded-2xl transition-all ${greenBtn}`}>
              Salva preferenze
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
