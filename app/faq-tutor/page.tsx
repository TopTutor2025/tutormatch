'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp, GraduationCap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import type { PricingConfig } from '@/types/database'

const FAQ_ITEMS = (pricing: PricingConfig | null) => [
  {
    category: 'Registrazione e profilo',
    items: [
      {
        q: 'Chi può diventare tutor su TutorMatch?',
        a: 'Chiunque abbia competenze solide nelle materie che vuole insegnare: studenti universitari, laureati, insegnanti o professionisti. Non è richiesta un\'abilitazione specifica, ma devi essere in grado di dimostrare la tua preparazione tramite il profilo (titoli di studio, bio, materie insegnate).',
      },
      {
        q: 'Come mi registro come tutor?',
        a: 'Clicca su "Registrati come tutor" dalla homepage, compila il profilo con le tue informazioni (nome, bio, materie, gradi scolastici, modalità di lezione) e attendi l\'approvazione dell\'amministratore. Riceverai una notifica via email quando il tuo account sarà attivo.',
      },
      {
        q: 'Posso insegnare più materie?',
        a: 'Sì, puoi aggiungere tutte le materie che sai insegnare e selezionare i gradi scolastici per ognuna (Medie, Superiori, Università). Il tuo profilo sarà visibile agli studenti che cercano esattamente quell\'abbinamento materia/grado.',
      },
      {
        q: 'Posso fare lezioni sia online che in presenza?',
        a: 'Sì, puoi scegliere entrambe le modalità. Per le lezioni in presenza devi inserire il tuo indirizzo nel profilo: gli studenti potranno trovarti tramite ricerca geografica. Per l\'online, TutorMatch genera automaticamente un link videochiamata (Jitsi Meet) ad ogni prenotazione.',
      },
    ],
  },
  {
    category: 'Calendario e prenotazioni',
    items: [
      {
        q: 'Come gestisco la mia disponibilità?',
        a: 'Nella sezione "Calendario" del tuo pannello puoi sbloccare gli slot orari (da lunedì a domenica, dalle 7:00 alle 21:00) in cui sei disponibile. Ogni slot corrisponde a 1 ora. Gli slot sbloccati sono visibili agli studenti e prenotabili.',
      },
      {
        q: 'Posso bloccare un giorno in cui non sono disponibile?',
        a: 'Sì, puoi tenere bloccati (o bloccare nuovamente) qualsiasi slot. Gli slot già prenotati da uno studente non possono essere bloccati autonomamente: contatta l\'amministratore per gestire eventuali cancellazioni.',
      },
      {
        q: 'Con quanto anticipo ricevo le prenotazioni?',
        a: 'Gli studenti possono prenotare uno slot solo con almeno 12 ore di preavviso. Questo ti garantisce sempre il tempo minimo per prepararti alla lezione.',
      },
      {
        q: 'Come funzionano le lezioni in presenza?',
        a: 'Le lezioni in presenza hanno durata di 2 ore (2 slot consecutivi). L\'indirizzo dell\'incontro viene comunicato automaticamente a entrambe le parti. Sei responsabile della puntualità e della sicurezza dell\'ambiente in cui si svolge la lezione.',
      },
      {
        q: 'Cosa succede se uno studente non si presenta?',
        a: 'Segna comunque la lezione come "Completata" entro 48 ore dall\'orario previsto. L\'amministratore valuterà la situazione. Ti consigliamo di segnalare eventuali problemi tramite la chat o scrivendo a support@tutormatch.it.',
      },
    ],
  },
  {
    category: 'Pagamenti',
    items: [
      {
        q: 'Quanto vengo pagato per ogni lezione?',
        a: pricing
          ? `La tariffa oraria dipende dal grado scolastico dell\'alunno:\n• Scuola Media: ${formatCurrency(pricing.hour_rate_medie)}/ora\n• Scuola Superiore: ${formatCurrency(pricing.hour_rate_superiori)}/ora\n• Università: ${formatCurrency(pricing.hour_rate_universita)}/ora\n\nPer le lezioni in presenza (2 ore) il compenso è il doppio della tariffa oraria corrispondente.`
          : 'La tariffa oraria è stabilita dall\'amministratore per grado scolastico (Medie, Superiori, Università) e visibile nella sezione Prezzi della piattaforma. Per le lezioni in presenza (2 ore) il compenso è il doppio della tariffa oraria.',
      },
      {
        q: 'Quando ricevo il pagamento?',
        a: 'I pagamenti vengono elaborati mensilmente. Entro il 15 del mese successivo ricevi un bonifico bancario per tutte le lezioni che hai segnato come "Completate" nel mese precedente. Assicurati che il tuo IBAN sia corretto nel profilo.',
      },
      {
        q: 'Come vengono conteggiate le lezioni completate?',
        a: 'Devi segnare ogni lezione come "Completata" entro 48 ore dal suo svolgimento direttamente dalla sezione "Lezioni" del tuo pannello. Le lezioni non segnate entro quel termine potrebbero non essere conteggiate per il pagamento del mese corrente.',
      },
      {
        q: 'Ci sono commissioni o costi per i tutor?',
        a: 'No, la piattaforma è completamente gratuita per i tutor. Non ci sono commissioni sulle lezioni né costi di iscrizione. Il modello di business di TutorMatch si basa sugli abbonamenti degli studenti.',
      },
      {
        q: 'Le tariffe possono cambiare?',
        a: 'Sì, l\'amministratore può aggiornare le tariffe per grado scolastico. In caso di variazione riceverai una comunicazione con almeno 30 giorni di preavviso, come previsto dai Termini e Condizioni.',
      },
    ],
  },
  {
    category: 'Regole e condotta',
    items: [
      {
        q: 'Posso accordarmi con gli studenti al di fuori della piattaforma?',
        a: 'No. È espressamente vietato richiedere pagamenti diretti agli studenti o fissare lezioni al di fuori di TutorMatch. Questo garantisce la tutela di entrambe le parti e permette a TutorMatch di elaborare correttamente i pagamenti.',
      },
      {
        q: 'Cosa succede se violo le regole?',
        a: 'TutorMatch si riserva di sospendere o cancellare l\'account in caso di violazioni dei Termini e Condizioni, senza preavviso per le violazioni gravi (es. pagamenti fuori piattaforma, comportamenti scorretti verso gli studenti).',
      },
      {
        q: 'Come gestisco le recensioni?',
        a: 'Dopo ogni lezione gli studenti possono lasciare una recensione sul tuo profilo. Le recensioni devono essere autentiche e TutorMatch non permette di richiedere o condizionare le valutazioni. Puoi segnalare recensioni false o offensive all\'amministratore.',
      },
      {
        q: 'Come posso cancellare il mio profilo da TutorMatch?',
        a: 'Per cancellare il tuo account devi inviare una richiesta via email a support@tutormatch.it. Prima di procedere alla cancellazione, TutorMatch elaborerà tutti i pagamenti ancora in sospeso relativi alle lezioni completate. Una volta regolati i compensi residui, il profilo e tutti i dati associati verranno eliminati nel rispetto della Privacy Policy.',
      },
    ],
  },
]

export default function FaqTutorPage() {
  const supabase = createClient()
  const [pricing, setPricing] = useState<PricingConfig | null>(null)
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  useEffect(() => {
    supabase.from('pricing_config').select('*').single().then(({ data }) => {
      if (data) setPricing(data)
    })
  }, [])

  function toggle(key: string) {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const faqs = FAQ_ITEMS(pricing)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar minimale */}
      <nav className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight">TutorMatch</span>
          </Link>
          <Link href="/registrazione/tutor"
            className="text-xs sm:text-sm font-semibold bg-black text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors whitespace-nowrap">
            Registrati come tutor
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Torna alla home
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-50 rounded-2xl flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <span className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">FAQ Tutor</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-3">Domande frequenti per i Tutor</h1>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            Tutto quello che devi sapere su come funziona TutorMatch se vuoi insegnare sulla piattaforma.
          </p>

          {/* Riepilogo tariffe */}
          {pricing && (
            <div className="mt-8 bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Tariffe attuali per i tutor</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { label: 'Medie', value: pricing.hour_rate_medie },
                  { label: 'Superiori', value: pricing.hour_rate_superiori },
                  { label: 'Università', value: pricing.hour_rate_universita },
                ].map(item => (
                  <div key={item.label} className="bg-white/10 rounded-xl p-3 sm:p-4 flex sm:flex-col items-center sm:items-center justify-between sm:justify-center gap-2 sm:gap-0 text-center">
                    <p className="text-xs text-gray-400 sm:mb-1">{item.label}</p>
                    <p className="text-xl font-bold">{formatCurrency(item.value)}</p>
                    <p className="text-xs text-gray-400 sm:mt-0.5">/ ora</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4 text-center">
                Pagamento mensile entro il 15 del mese successivo · Nessuna commissione
              </p>
            </div>
          )}

          {/* FAQ accordion */}
          <div className="mt-10 space-y-10">
            {faqs.map(section => (
              <div key={section.category}>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                  {section.category}
                </h2>
                <div className="space-y-2">
                  {section.items.map((item, idx) => {
                    const key = `${section.category}-${idx}`
                    const open = !!openItems[key]
                    return (
                      <div key={key} className="border border-gray-100 rounded-2xl overflow-hidden">
                        <button
                          onClick={() => toggle(key)}
                          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors gap-4">
                          <span className="font-medium text-gray-900 text-sm">{item.q}</span>
                          {open
                            ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                        </button>
                        {open && (
                          <div className="px-5 pb-5">
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{item.a}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 bg-gray-50 rounded-2xl p-6 text-center">
            <p className="font-semibold text-gray-900 mb-1">Pronto a iniziare?</p>
            <p className="text-sm text-gray-500 mb-4">Registrati gratuitamente e inizia a ricevere prenotazioni</p>
            <Link href="/registrazione/tutor"
              className="inline-flex items-center gap-2 bg-black text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-gray-800 transition-all">
              Registrati come tutor →
            </Link>
          </div>

          {/* Footer links */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-400">
            <Link href="/termini" className="hover:text-black transition-colors">Termini e Condizioni</Link>
            <Link href="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link>
            <Link href="/cookie" className="hover:text-black transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
