'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Search, Clock, CreditCard, Calendar, ChevronRight, ChevronDown, ChevronUp, Star, BookOpen, CheckCircle, X, HelpCircle, MapPin, Video } from 'lucide-react'
import { formatDate, formatTime, GRADE_LABELS, MODE_LABELS } from '@/lib/utils'
import type { Profile, StudentProfile, Subscription, Booking } from '@/types/database'

export default function StudentDashboardPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [futureBookings, setFutureBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [showTutorial, setShowTutorial] = useState(false)
  const [openFaq, setOpenFaq] = useState<Record<number, boolean>>({})

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
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
      // Mostra tutorial se primo accesso
      const tutorialDone = localStorage.getItem('student_tutorial_done')
      if (!tutorialDone) setShowTutorial(true)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const totalHours = studentProfile
    ? studentProfile.hour_credits_medie + studentProfile.hour_credits_superiori + studentProfile.hour_credits_universita
    : 0

  return (
    <>
      {/* Tutorial overlay */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">
            {/* Header fisso */}
            <div className="flex items-center justify-between px-5 sm:px-8 pt-6 sm:pt-8 pb-4 flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-black">Come funziona Proflive 📚</h2>
                <p className="text-sm text-gray-400 mt-0.5">Guida rapida alla piattaforma</p>
              </div>
              <button onClick={() => { setShowTutorial(false); localStorage.setItem('student_tutorial_done', '1') }}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors flex-shrink-0">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Passi scrollabili */}
            <div className="overflow-y-auto flex-1 px-5 sm:px-8">
            <div className="space-y-1 pb-4">
              {[
                {
                  icon: CreditCard, color: 'bg-green-50 text-green-600', step: '1',
                  title: 'Attiva l\'abbonamento',
                  desc: 'Vai in "Abbonamento" e scegli il piano mensile o annuale. Senza abbonamento attivo non puoi prenotare lezioni. Puoi disattivare il rinnovo automatico in qualsiasi momento.',
                },
                {
                  icon: Clock, color: 'bg-blue-50 text-blue-600', step: '2',
                  title: 'Acquista le ore lezione',
                  desc: 'Le ore sono distinte per grado scolastico: Medie, Superiori, Università. Ogni lezione online scala 1 ora, ogni lezione in presenza scala 2 ore (durata 2h). Acquistale dalla sezione "Ore lezione".',
                },
                {
                  icon: Search, color: 'bg-purple-50 text-purple-600', step: '3',
                  title: 'Cerca il tutor giusto',
                  desc: 'Filtra per materia, grado scolastico e modalità. Con il filtro "Online" vedi tutti i tutor disponibili a distanza. Con "In presenza" inserisci il tuo indirizzo e vediamo i tutor entro 5km.',
                },
                {
                  icon: Video, color: 'bg-pink-50 text-pink-600', step: '4',
                  title: 'Prenota uno slot online',
                  desc: 'Espandi un tutor, seleziona uno slot disponibile (rosa), scegli materia e argomento, e conferma. Ricevi automaticamente un link per la videochiamata.',
                },
                {
                  icon: MapPin, color: 'bg-orange-50 text-orange-600', step: '5',
                  title: 'Prenota in presenza (2 ore)',
                  desc: 'Per le lezioni in presenza devi selezionare uno slot che abbia l\'ora successiva libera: la piattaforma prenota automaticamente 2 ore consecutive. Inserisci l\'indirizzo dell\'appuntamento.',
                },
                {
                  icon: Star, color: 'bg-yellow-50 text-yellow-600', step: '6',
                  title: 'Lascia una recensione',
                  desc: 'Dopo ogni lezione completata puoi lasciare una valutazione al tutor (1–5 stelle + commento). Le recensioni aiutano gli altri studenti a scegliere.',
                },
              ].map((step, i) => (
                <div key={step.title} className={`flex gap-4 p-3 rounded-2xl ${i % 2 === 0 ? 'bg-gray-50' : ''}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${step.color}`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Passo {step.step}</span>
                    </div>
                    <p className="font-semibold text-sm text-black mt-0.5">{step.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            </div>

            {/* Bottone fisso in fondo */}
            <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-4 flex-shrink-0">
              <button onClick={() => { setShowTutorial(false); localStorage.setItem('student_tutorial_done', '1') }}
                className="w-full bg-black text-white font-semibold py-3.5 rounded-2xl hover:bg-gray-800 transition-colors">
                Ho capito, inizia! 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Ciao, {profile?.first_name}! 👋</h1>
            <p className="text-gray-500 mt-1">Ecco il riepilogo della tua area personale</p>
          </div>
          <button
            onClick={() => setShowTutorial(true)}
            title="Mostra guida"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-black bg-white border border-gray-200 hover:border-gray-400 px-3 py-2 rounded-2xl transition-all shadow-soft">
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Guida</span>
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Abbonamento',
              value: subscription ? (subscription.type === 'mensile' ? 'Mensile' : 'Annuale') : 'Non attivo',
              sub: subscription ? `Scade il ${formatDate(subscription.expires_at)}` : 'Attiva un abbonamento',
              icon: CreditCard,
              color: subscription ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700',
              href: '/studente/abbonamento',
            },
            {
              label: 'Ore disponibili (medie)',
              value: `${studentProfile?.hour_credits_medie || 0}h`,
              sub: 'Scuola media',
              icon: Clock,
              color: 'bg-blue-50 text-blue-700',
              href: '/studente/ore',
            },
            {
              label: 'Ore disponibili (superiori)',
              value: `${studentProfile?.hour_credits_superiori || 0}h`,
              sub: 'Scuola superiore',
              icon: Clock,
              color: 'bg-purple-50 text-purple-700',
              href: '/studente/ore',
            },
            {
              label: 'Ore disponibili (università)',
              value: `${studentProfile?.hour_credits_universita || 0}h`,
              sub: 'Università',
              icon: Clock,
              color: 'bg-orange-50 text-orange-700',
              href: '/studente/ore',
            },
          ].map(card => (
            <Link key={card.label} href={card.href}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-soft hover:-translate-y-0.5 hover:shadow-card transition-all">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <p className="text-xl font-bold text-black">{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        {!subscription && (
          <div className="bg-gradient-to-r from-pink-50 to-white border border-pink-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div>
              <p className="font-semibold text-gray-900">Attiva il tuo abbonamento</p>
              <p className="text-sm text-gray-500 mt-0.5">Hai bisogno di un abbonamento attivo per prenotare i tutor</p>
            </div>
            <Link href="/studente/abbonamento" className="flex items-center justify-center gap-2 bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-2xl hover:bg-gray-800 transition-colors sm:flex-shrink-0">
              Abbonati <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Prossime lezioni */}
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
            <div className="space-y-3">
              {futureBookings.map((booking: any) => (
                <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-soft">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-pink-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                      {booking.mode === 'online' ? <Star className="w-5 h-5 text-pink-500" /> : <CheckCircle className="w-5 h-5 text-green-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-black truncate">
                        {booking.subject?.name} · {GRADE_LABELS[booking.grade]}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {booking.tutor_profile?.profile?.first_name} ·
                        {' '}{booking.slot ? formatDate(booking.slot.date) : ''} ·
                        {' '}{booking.slot ? `${formatTime(booking.slot.start_time)} – ${formatTime(booking.second_slot?.end_time ?? booking.slot.end_time)}` : ''}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{booking.topic}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${booking.mode === 'online' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                      {MODE_LABELS[booking.mode]}
                    </span>
                  </div>
                  {booking.mode === 'online' && booking.meet_link && (
                    <a href={booking.meet_link} target="_blank" rel="noopener noreferrer"
                      className="mt-3 flex items-center justify-center gap-1.5 text-xs bg-black text-white px-3 py-2 rounded-xl hover:bg-gray-800 transition-colors w-full sm:w-auto sm:inline-flex">
                      Entra in videochiamata
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Azioni rapide */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Cerca tutor', href: '/studente/cerca', icon: Search, color: 'bg-black text-white' },
            { label: 'Le mie lezioni', href: '/studente/lezioni', icon: Calendar, color: 'bg-pink-50 text-pink-700 border border-pink-200' },
            { label: 'Acquista ore', href: '/studente/ore', icon: Clock, color: 'bg-gray-50 text-gray-700 border border-gray-200' },
            { label: 'Chat', href: '/studente/chat', icon: Star, color: 'bg-gray-50 text-gray-700 border border-gray-200' },
          ].map(action => (
            <Link key={action.label} href={action.href}
              className={`${action.color} rounded-2xl p-4 flex flex-col gap-2 hover:opacity-90 transition-all hover:-translate-y-0.5`}>
              <action.icon className="w-5 h-5" />
              <span className="text-sm font-semibold">{action.label}</span>
            </Link>
          ))}
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
                a: "L'abbonamento (mensile o annuale) è il tuo \"accesso\" alla piattaforma: senza di esso non puoi prenotare. Le ore lezione sono il credito effettivo da utilizzare per le prenotazioni e si acquistano separatamente. Le ore non scadono, l'abbonamento sì.",
              },
              {
                q: 'Perché le ore sono divise per grado scolastico?',
                a: 'I prezzi per ora variano in base al livello di istruzione (Medie, Superiori, Università). Per questo il credito è separato: le ore acquistate per "Superiori" si usano solo per prenotare tutor con quel grado, e così via.',
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
    </>
  )
}
