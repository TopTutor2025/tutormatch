'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Search, CreditCard, ChevronRight, ChevronDown, ChevronUp, Star, BookOpen, CheckCircle, HelpCircle, MessageSquare } from 'lucide-react'
import { formatDate, formatTime, GRADE_LABELS, MODE_LABELS } from '@/lib/utils'
import TrialSpotPromo from '@/components/studente/TrialSpotPromo'
import ChatInterface from '@/components/chat/ChatInterface'
import type { Profile, StudentProfile, Subscription, Booking } from '@/types/database'

export default function StudentDashboardPage() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const convParam = searchParams.get('conv') || undefined
  const [userId, setUserId] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [futureBookings, setFutureBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [openFaq, setOpenFaq] = useState<Record<number, boolean>>({})

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const [{ data: p }, { data: sp }, { data: sub }, { data: bks }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('student_profiles').select('*').eq('id', user.id).single(),
        supabase.from('subscriptions').select('*').eq('student_id', user.id).eq('status', 'attivo').single(),
        supabase.from('bookings')
          .select('*')
          .eq('student_id', user.id)
          .eq('status', 'confermato')
          .order('created_at', { ascending: true })
          .limit(3),
      ])
      setProfile(p)
      setStudentProfile(sp)
      setSubscription(sub)

      if (bks?.length) {
        const tutorIds = [...new Set(bks.map((b: any) => b.tutor_id))]
        const slotIds = [...new Set([...bks.map((b: any) => b.slot_id), ...bks.map((b: any) => b.second_slot_id).filter(Boolean)])]
        const subjectIds = [...new Set(bks.map((b: any) => b.subject_id))]
        const [{ data: tps }, { data: profs }, { data: slots }, { data: subs }] = await Promise.all([
          supabase.from('tutor_profiles').select('*').in('id', tutorIds),
          supabase.from('profiles').select('*').in('id', tutorIds),
          supabase.from('calendar_slots').select('*').in('id', slotIds),
          supabase.from('subjects').select('*').in('id', subjectIds),
        ])
        const tpMap = Object.fromEntries((tps || []).map((t: any) => [t.id, t]))
        const profMap = Object.fromEntries((profs || []).map((p: any) => [p.id, p]))
        const slotMap = Object.fromEntries((slots || []).map((s: any) => [s.id, s]))
        const subMap = Object.fromEntries((subs || []).map((s: any) => [s.id, s]))
        setFutureBookings(bks.map((b: any) => ({
          ...b,
          slot: slotMap[b.slot_id] || null,
          second_slot: b.second_slot_id ? (slotMap[b.second_slot_id] || null) : null,
          subject: subMap[b.subject_id] || null,
          tutor_profile: tpMap[b.tutor_id] ? { ...tpMap[b.tutor_id], profile: profMap[b.tutor_id] || null } : null,
        })))
      } else {
        setFutureBookings([])
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-black">Ciao, {profile?.first_name}! 👋</h1>
          <p className="text-gray-500 mt-1">Ecco il riepilogo della tua area personale</p>
        </div>

        {/* Prossime lezioni (scroll orizzontale) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-black">Prossime lezioni</h2>
            <Link href="/studente/lezioni" className="text-sm text-gray-500 hover:text-black font-medium flex items-center gap-1">
              Vedi tutte <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {futureBookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-medium text-gray-600">Nessuna lezione programmata</p>
              <p className="text-sm text-gray-400 mt-1">Cerca un tutor per prenotare la tua prima lezione</p>
              <Link href="/studente/cerca" className="inline-flex items-center gap-2 bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-2xl hover:bg-gray-800 transition-colors mt-4">
                <Search className="w-4 h-4" /> Cerca tutor
              </Link>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
              {futureBookings.map((booking: any) => (
                <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-soft flex-shrink-0 w-[280px] sm:w-[320px] snap-start flex flex-col">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                      {booking.mode === 'online' ? <Star className="w-5 h-5 text-pink-500" /> : <CheckCircle className="w-5 h-5 text-green-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-black truncate">{booking.subject?.name} · {GRADE_LABELS[booking.grade]}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {booking.tutor_profile?.profile?.first_name} · {booking.slot ? formatDate(booking.slot.date) : ''} · {booking.slot ? `${formatTime(booking.slot.start_time)} – ${formatTime(booking.second_slot?.end_time ?? booking.slot.end_time)}` : ''}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${booking.mode === 'online' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                      {MODE_LABELS[booking.mode]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 truncate">{booking.topic}</p>
                  {booking.mode === 'online' && booking.meet_link && (
                    <a href={booking.meet_link} target="_blank" rel="noopener noreferrer"
                      className="mt-3 flex items-center justify-center gap-1.5 text-xs bg-black text-white px-3 py-2 rounded-xl hover:bg-gray-800 transition-colors">
                      Entra in videochiamata
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lezione di prova + Pacchetto Spot */}
        <TrialSpotPromo studentProfile={studentProfile} />

        {/* Riepilogo abbonamento + ore (card unica) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-3 sm:p-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-5">
            {/* Abbonamento */}
            <Link href="/studente/abbonamento"
              className="flex items-center gap-3 lg:w-56 flex-shrink-0 rounded-xl p-2 hover:bg-gray-50 transition-colors">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${subscription ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Abbonamento</p>
                <p className="text-base font-bold text-black leading-tight">{subscription ? (subscription.type === 'mensile' ? 'Mensile' : 'Annuale') : 'Non attivo'}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 truncate">{subscription ? `Scade il ${formatDate(subscription.expires_at)}` : 'Attiva un abbonamento'}</p>
              </div>
            </Link>

            {/* Divisore */}
            <div className="hidden lg:block self-stretch w-px bg-gray-100 my-1" />

            {/* Contatori ore */}
            <Link href="/studente/ore" className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-xl p-1 hover:bg-gray-50 transition-colors">
              {[
                { label: 'Medie', value: studentProfile?.hour_credits_medie || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Superiori', value: studentProfile?.hour_credits_superiori || 0, color: 'text-purple-600', bg: 'bg-purple-50' },
                { label: 'Università', value: studentProfile?.hour_credits_universita || 0, color: 'text-orange-600', bg: 'bg-orange-50' },
                { label: 'Spot', value: studentProfile?.hour_credits_spot || 0, color: 'text-pink-600', bg: 'bg-pink-50' },
              ].map(c => (
                <div key={c.label} className={`rounded-xl ${c.bg} px-2 py-2.5 text-center`}>
                  <p className={`text-xl font-extrabold ${c.color} leading-none`}>{c.value}<span className="text-sm font-bold">h</span></p>
                  <p className="text-[11px] font-medium text-gray-500 mt-1">{c.label}</p>
                </div>
              ))}
            </Link>
          </div>

          {/* CTA attivazione abbonamento (solo se non attivo) */}
          {!subscription && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">Attiva il tuo abbonamento</p>
                <p className="text-xs text-gray-500 mt-0.5">Hai bisogno di un abbonamento attivo per prenotare i tutor</p>
              </div>
              <Link href="/studente/abbonamento" className="flex items-center justify-center gap-2 bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-2xl hover:bg-gray-800 transition-colors sm:flex-shrink-0">
                Abbonati <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Chat con i tutor */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-bold text-black">Chat con i tuoi tutor</h2>
          </div>
          {userId && <ChatInterface userId={userId} userRole="studente" initialConvId={convParam} />}
        </div>

        {/* FAQ */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-bold text-black">Domande frequenti</h2>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden divide-y divide-gray-50">
            {([
              {
                q: 'Come faccio a prenotare una lezione?',
                a: 'Vai su "Cerca tutor", filtra per materia, grado scolastico e modalità. Espandi il profilo di un tutor, clicca su uno slot disponibile (rosa), compila il form con argomento e materia, e conferma. Le ore vengono scalate automaticamente dal tuo credito.',
              },
              {
                q: 'Qual è la differenza tra abbonamento e ore lezione?',
                a: "L'abbonamento (mensile o annuale) è il tuo \"accesso\" alla piattaforma: con l'abbonamento attivo usi le ore lezione del grado per prenotare. Le ore lezione sono il credito effettivo e si acquistano separatamente. Le ore non scadono, l'abbonamento sì. In alternativa puoi prenotare anche senza abbonamento usando la lezione di prova o le ore del pacchetto spot (vedi sotto).",
              },
              {
                q: 'Come funziona la lezione di prova?',
                a: 'La lezione di prova ti permette di provare il servizio: è una singola lezione online da 1 ora, valida per qualsiasi grado e prenotabile senza abbonamento attivo, al prezzo dedicato di 15€. La puoi acquistare una sola volta per account dalla sezione "Ore lezione". Quando prenoti, se hai la prova disponibile viene usata automaticamente per prima.',
              },
              {
                q: 'Cosa sono le ore spot e quando convengono?',
                a: 'Le ore spot sono un pacchetto di ore valide per qualsiasi grado e utilizzabili anche senza abbonamento attivo: sono perfette se vuoi prenotare lezioni senza sottoscrivere un abbonamento. Costano un po\' di più delle ore normali proprio perché non richiedono l\'abbonamento. Le acquisti dalla sezione "Ore lezione" e non scadono.',
              },
              {
                q: 'In che ordine vengono usate le ore quando prenoto?',
                a: 'La piattaforma scala il credito con questa priorità: prima la lezione di prova (se disponibile e per lezioni online), poi le ore spot, infine le ore del grado scolastico (queste ultime richiedono un abbonamento attivo).',
              },
              {
                q: 'Perché le ore sono divise per grado scolastico?',
                a: 'I prezzi per ora variano in base al livello di istruzione (Medie, Superiori, Università). Per questo il credito è separato: le ore acquistate per "Superiori" si usano solo per prenotare tutor con quel grado, e così via. Le ore spot e la lezione di prova, invece, valgono per qualsiasi grado.',
              },
              {
                q: 'Come funziona la lezione online?',
                a: 'Quando prenoti una lezione online, la piattaforma genera automaticamente un link per la videochiamata (Jitsi Meet). Lo trovi nella card della prenotazione (sezione "Prossime lezioni" o "Le mie lezioni"). Al primo accesso Jitsi potrebbe chiederti di accedere con Google per avviare la stanza — basta un clic su "Accedi" e la videochiamata parte subito.',
              },
              {
                q: 'Come funziona la lezione in presenza?',
                a: 'Le lezioni in presenza durano 2 ore e scalano 2 ore dal tuo credito. Devi selezionare uno slot che abbia l\'ora immediatamente successiva libera: la piattaforma prenota entrambe automaticamente. Inserisci l\'indirizzo dell\'incontro nel form di prenotazione.',
              },
              {
                q: 'Con quanto anticipo devo prenotare?',
                a: 'Puoi prenotare uno slot solo se inizia almeno 12 ore dopo il momento della prenotazione. Gli slot entro le 12 ore appaiono con il simbolo ⏱ e non sono selezionabili.',
              },
              {
                q: 'Posso cancellare una prenotazione?',
                a: 'Le prenotazioni non possono essere cancellate autonomamente. Per richiedere una cancellazione contatta l\'amministratore tramite la chat o scrivi a support@tutormatch.it. In caso di cancellazione approvata, le ore vengono restituite automaticamente.',
              },
              {
                q: 'Cosa succede se disdico l\'abbonamento?',
                a: "Puoi disattivare il rinnovo automatico dall'area \"Abbonamento\" entro 24 ore prima della data di rinnovo. L'abbonamento resta attivo fino alla scadenza naturale. Le ore già acquistate non scadono e rimangono nel tuo credito.",
              },
              {
                q: 'Come faccio a lasciare una recensione al tutor?',
                a: 'Nella sezione "Le mie lezioni" trovi tutte le lezioni completate. Per ognuna puoi lasciare una valutazione da 1 a 5 stelle con un commento. Le recensioni aiutano gli altri studenti a scegliere il tutor più adatto.',
              },
              {
                q: 'Posso inviare foto del materiale di studio al tutor?',
                a: 'Sì! Nella chat con il tutor trovi il pulsante 📎 accanto al campo di testo. Puoi inviare foto di pagine del libro, quaderno, appunti, esercizi o slide (max 8MB). Il tutor le vedrà direttamente in chat e potrà scaricarle. Le foto vengono eliminate automaticamente dopo 7 giorni per motivi di spazio, ma i messaggi testuali restano sempre visibili.',
              },
              {
                q: 'Come posso cancellare il mio account?',
                a: 'Per eliminare il tuo account invia una richiesta a support@tutormatch.it. I tuoi dati personali saranno cancellati nel rispetto della Privacy Policy. Le ore non utilizzate e i giorni rimanenti di abbonamento non sono rimborsabili salvo vizi della piattaforma.',
              },
            ] as { q: string; a: string }[]).map((item, idx) => (
              <div key={idx}>
                <button
                  onClick={() => setOpenFaq(prev => ({ ...prev, [idx]: !prev[idx] }))}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors gap-4">
                  <span className="font-medium text-sm text-gray-900">{item.q}</span>
                  {openFaq[idx]
                    ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </button>
                {openFaq[idx] && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
  )
}
