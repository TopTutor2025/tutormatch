'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Calendar, BookOpen, CreditCard, Star, ChevronRight, Video, MapPin, X, AlertCircle, HelpCircle, User, CheckCircle } from 'lucide-react'
import { formatDate, formatTime, GRADE_LABELS, MODE_LABELS } from '@/lib/utils'
import type { Profile, Booking } from '@/types/database'

export default function TutorDashboardPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState({ totalCompleted: 0, avgRating: 0, futureCount: 0, pendingPayment: 0 })
  const [futureBookings, setFutureBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showTutorial, setShowTutorial] = useState(false)
  const [reviewsModal, setReviewsModal] = useState(false)
  const [reviewsList, setReviewsList] = useState<any[]>([])
  const [tutorMeta, setTutorMeta] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: p }, { data: tp }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('tutor_profiles').select('lesson_mode, latitude, longitude').eq('id', user.id).single(),
      ])
      setProfile(p)
      setTutorMeta(tp)

      const [{ data: completed }, { data: reviews }, { data: futureBks }, { data: payments }] = await Promise.all([
        supabase.from('bookings').select('id').eq('tutor_id', user.id).eq('status', 'completato'),
        supabase.from('reviews').select('*, student:profiles!reviews_student_id_fkey(first_name)').eq('tutor_id', user.id).order('created_at', { ascending: false }),
        supabase.from('bookings').select('*').eq('tutor_id', user.id).eq('status', 'confermato')
          .order('created_at', { ascending: true }).limit(5),
        supabase.from('tutor_payments').select('id').eq('tutor_id', user.id).eq('status', 'in_elaborazione'),
      ])

      const avgRating = reviews && reviews.length > 0 ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length : 0
      setReviewsList(reviews || [])
      setStats({
        totalCompleted: completed?.length || 0,
        avgRating,
        futureCount: futureBks?.length || 0,
        pendingPayment: payments?.length || 0,
      })

      if (futureBks?.length) {
        const studentIds = [...new Set(futureBks.map((b: any) => b.student_id))]
        const slotIds = [...new Set([...futureBks.map((b: any) => b.slot_id), ...futureBks.map((b: any) => b.second_slot_id).filter(Boolean)])]
        const subjectIds = [...new Set(futureBks.map((b: any) => b.subject_id))]
        const [{ data: profs }, { data: slots }, { data: subs }] = await Promise.all([
          supabase.from('profiles').select('*').in('id', studentIds),
          supabase.from('calendar_slots').select('*').in('id', slotIds),
          supabase.from('subjects').select('*').in('id', subjectIds),
        ])
        const profMap = Object.fromEntries((profs || []).map((p: any) => [p.id, p]))
        const slotMap = Object.fromEntries((slots || []).map((s: any) => [s.id, s]))
        const subMap = Object.fromEntries((subs || []).map((s: any) => [s.id, s]))
        setFutureBookings(futureBks.map((b: any) => ({
          ...b,
          slot: slotMap[b.slot_id] || null,
          second_slot: b.second_slot_id ? (slotMap[b.second_slot_id] || null) : null,
          subject: subMap[b.subject_id] || null,
          student_profile: profMap[b.student_id] || null,
        })))
      } else {
        setFutureBookings([])
      }

      const tutorialDone = localStorage.getItem('tutor_tutorial_done')
      if (!tutorialDone) setShowTutorial(true)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>

  return (
    <>
      {showTutorial && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">
            {/* Header fisso */}
            <div className="flex items-center justify-between px-5 sm:px-8 pt-6 sm:pt-8 pb-4 flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-black">Come funziona TutorMatch 🎓</h2>
                <p className="text-sm text-gray-400 mt-0.5">Guida rapida per i tutor</p>
              </div>
              <button onClick={() => { setShowTutorial(false); localStorage.setItem('tutor_tutorial_done', '1') }}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors flex-shrink-0">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Passi scrollabili */}
            <div className="overflow-y-auto flex-1 px-5 sm:px-8">
            <div className="space-y-1 pb-4">
              {[
                {
                  icon: User, color: 'bg-blue-50 text-blue-600', step: '1',
                  title: 'Completa il tuo profilo',
                  desc: 'Vai in "Profilo" e inserisci bio, materie insegnate, gradi scolastici e modalità di lezione. Se fai lezioni in presenza, inserisci indirizzo e città: verranno convertiti in coordinate per la ricerca geografica degli studenti.',
                },
                {
                  icon: Calendar, color: 'bg-pink-50 text-pink-600', step: '2',
                  title: 'Sblocca gli slot nel calendario',
                  desc: 'Vai in "Calendario" e clicca sulle celle delle ore in cui sei disponibile: passano da grigio (bloccato) a rosa (disponibile). Gli studenti vedono solo gli slot disponibili e possono prenotarli.',
                },
                {
                  icon: MapPin, color: 'bg-green-50 text-green-600', step: '3',
                  title: 'Lezioni in presenza: slot consecutivi',
                  desc: 'Per le lezioni in presenza gli studenti prenotano 2 ore consecutive. Assicurati di sbloccare almeno due slot orari di fila quando vuoi essere disponibile per sessioni in presenza.',
                },
                {
                  icon: BookOpen, color: 'bg-purple-50 text-purple-600', step: '4',
                  title: 'Gestisci le prenotazioni',
                  desc: 'Quando uno studente prenota, lo slot diventa arancione nel calendario. Vai in "Lezioni" per vedere i dettagli (studente, materia, argomento). Per le lezioni online trovi il link per la videochiamata già generato.',
                },
                {
                  icon: CheckCircle, color: 'bg-orange-50 text-orange-600', step: '5',
                  title: 'Segna la lezione come completata',
                  desc: 'Dopo aver tenuto la lezione, vai in "Lezioni → Passate" e clicca "Segna come completata". È fondamentale per ricevere il pagamento: solo le lezioni completate vengono liquidate dall\'admin.',
                },
                {
                  icon: CreditCard, color: 'bg-yellow-50 text-yellow-600', step: '6',
                  title: 'Ricevi i pagamenti',
                  desc: 'I pagamenti vengono elaborati mensilmente dall\'amministratore. Puoi monitorare lo stato in "Pagamenti tutor": "In elaborazione" significa che la lezione è stata registrata, "Pagato" che hai ricevuto il bonifico.',
                },
                {
                  icon: Star, color: 'bg-gray-50 text-gray-600', step: '7',
                  title: 'Ricevi recensioni',
                  desc: 'Dopo ogni lezione completata, lo studente può lasciarti una recensione (1–5 stelle). Le recensioni appaiono sul tuo profilo e aiutano altri studenti a sceglierti. Visualizzale dalla Dashboard.',
                },
              ].map((step, i) => (
                <div key={step.title} className={`flex gap-4 p-3 rounded-2xl ${i % 2 === 0 ? 'bg-gray-50' : ''}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${step.color}`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Passo {step.step}</span>
                    <p className="font-semibold text-sm text-black mt-0.5">{step.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            </div>

            {/* Bottone fisso in fondo */}
            <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-4 flex-shrink-0">
              <button onClick={() => { setShowTutorial(false); localStorage.setItem('tutor_tutorial_done', '1') }}
                className="w-full bg-black text-white font-semibold py-3.5 rounded-2xl hover:bg-gray-800 transition-colors">
                Ho capito, inizia! 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Ciao, {profile?.first_name}! 👋</h1>
            <p className="text-gray-500 mt-1">Ecco il riepilogo della tua attività</p>
          </div>
          <button
            onClick={() => setShowTutorial(true)}
            title="Mostra guida"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-black bg-white border border-gray-200 hover:border-gray-400 px-3 py-2 rounded-2xl transition-all shadow-soft">
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Guida</span>
          </button>
        </div>

        {/* Banner posizione mancante */}
        {tutorMeta && (tutorMeta.lesson_mode === 'presenza' || tutorMeta.lesson_mode === 'entrambe') && (!tutorMeta.latitude || !tutorMeta.longitude) && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-start gap-3">
            <div className="flex items-start gap-3 flex-1">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 text-sm">Posizione non configurata</p>
                <p className="text-sm text-amber-700 mt-0.5">
                  Hai selezionato lezioni in presenza ma non hai salvato il tuo indirizzo. Gli studenti non potranno trovarti nella ricerca in presenza.
                </p>
              </div>
            </div>
            <a href="/tutor/profilo" className="text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-2 rounded-xl transition-colors sm:flex-shrink-0 text-center">
              Vai al profilo →
            </a>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Lezioni completate', value: stats.totalCompleted, icon: BookOpen, color: 'bg-green-50 text-green-700', href: '/tutor/lezioni' },
            { label: 'Lezioni programmate', value: stats.futureCount, icon: Calendar, color: 'bg-blue-50 text-blue-700', href: '/tutor/lezioni' },
            { label: 'Pagamenti in attesa', value: stats.pendingPayment, icon: CreditCard, color: 'bg-orange-50 text-orange-700', href: '/tutor/pagamenti' },
          ].map(card => (
            <Link key={card.label} href={card.href}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-soft hover:-translate-y-0.5 hover:shadow-card transition-all">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-black">{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.label}</p>
            </Link>
          ))}
          <button
            onClick={() => stats.avgRating > 0 && setReviewsModal(true)}
            className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-soft text-left transition-all ${stats.avgRating > 0 ? 'hover:-translate-y-0.5 hover:shadow-card cursor-pointer' : 'cursor-default'}`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-yellow-50 text-yellow-700">
              <Star className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-black">{stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)} ★` : 'N/A'}</p>
            <p className="text-xs text-gray-500 mt-1">Rating medio {reviewsList.length > 0 && `· ${reviewsList.length} rec.`}</p>
          </button>
        </div>

        {/* Prossime lezioni */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-black">Prossime lezioni</h2>
            <Link href="/tutor/lezioni" className="text-sm text-gray-500 hover:text-black font-medium flex items-center gap-1">
              Vedi tutte <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {futureBookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-medium text-gray-600">Nessuna lezione programmata</p>
              <p className="text-sm text-gray-400 mt-1">Sblocca gli slot nel tuo calendario per ricevere prenotazioni</p>
              <Link href="/tutor/calendario" className="inline-flex items-center gap-2 bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-2xl hover:bg-gray-800 transition-colors mt-4">
                <Calendar className="w-4 h-4" /> Gestisci calendario
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {futureBookings.map((booking: any) => (
                <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-soft">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${booking.mode === 'online' ? 'bg-blue-50' : 'bg-green-50'}`}>
                      {booking.mode === 'online' ? <Video className="w-5 h-5 md:w-6 md:h-6 text-blue-500" /> : <MapPin className="w-5 h-5 md:w-6 md:h-6 text-green-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-black">{booking.subject?.name} · {GRADE_LABELS[booking.grade]}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {booking.student_profile?.first_name} · {booking.slot ? formatDate(booking.slot.date) : ''} · {booking.slot ? `${formatTime(booking.slot.start_time)} – ${formatTime(booking.second_slot?.end_time ?? booking.slot.end_time)}` : ''}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">Argomento: {booking.topic}</p>
                    </div>
                    {booking.mode === 'online' && booking.meet_link && (
                      <a href={booking.meet_link} target="_blank" rel="noopener noreferrer"
                        className="hidden sm:flex items-center gap-1.5 text-xs bg-black text-white px-3 py-1.5 rounded-xl hover:bg-gray-800 transition-colors flex-shrink-0">
                        <Video className="w-3 h-3" /> Videochiamata
                      </a>
                    )}
                  </div>
                  {booking.mode === 'online' && booking.meet_link && (
                    <a href={booking.meet_link} target="_blank" rel="noopener noreferrer"
                      className="sm:hidden mt-3 flex items-center justify-center gap-1.5 text-xs bg-black text-white px-3 py-2 rounded-xl hover:bg-gray-800 transition-colors w-full">
                      <Video className="w-3 h-3" /> Entra in videochiamata
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {reviewsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setReviewsModal(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-black">Le tue recensioni</h2>
                <p className="text-sm text-gray-500">{stats.avgRating.toFixed(1)} ★ · {reviewsList.length} recension{reviewsList.length === 1 ? 'e' : 'i'}</p>
              </div>
              <button onClick={() => setReviewsModal(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="overflow-y-auto space-y-3 flex-1">
              {reviewsList.map((r: any) => (
                <div key={r.id} className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-black">{r.student?.first_name || 'Studente'}</span>
                    <span className="text-yellow-500 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                  <p className="text-xs text-gray-400 mt-1">{new Date(r.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
