'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Clock, Video, MapPin, Star } from 'lucide-react'
import { formatDate, formatTime, GRADE_LABELS, MODE_LABELS, isSlotPast } from '@/lib/utils'
import type { Booking } from '@/types/database'

export default function LezionePage() {
  const supabase = createClient()
  const [tab, setTab] = useState<'future' | 'passate'>('future')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewModal, setReviewModal] = useState<Booking | null>(null)
  const [review, setReview] = useState({ rating: 5, comment: '' })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: bks } = await supabase
        .from('bookings').select('*').eq('student_id', user.id).order('created_at', { ascending: false })
      if (!bks?.length) { setBookings([]); setLoading(false); return }

      const tutorIds = [...new Set(bks.map(b => b.tutor_id))]
      const slotIds = [...new Set([...bks.map(b => b.slot_id), ...bks.map(b => b.second_slot_id).filter(Boolean)])]
      const subjectIds = [...new Set(bks.map(b => b.subject_id))]

      const [{ data: tps }, { data: profs }, { data: slots }, { data: subs }, { data: revs }] = await Promise.all([
        supabase.from('tutor_profiles').select('*').in('id', tutorIds),
        supabase.from('profiles').select('*').in('id', tutorIds),
        supabase.from('calendar_slots').select('*').in('id', slotIds),
        supabase.from('subjects').select('*').in('id', subjectIds),
        supabase.from('reviews').select('booking_id').eq('student_id', user.id),
      ])

      const tpMap = Object.fromEntries((tps || []).map(t => [t.id, t]))
      const profMap = Object.fromEntries((profs || []).map(p => [p.id, p]))
      const slotMap = Object.fromEntries((slots || []).map(s => [s.id, s]))
      const subMap = Object.fromEntries((subs || []).map(s => [s.id, s]))
      const reviewed = new Set((revs || []).map(r => r.booking_id))

      setBookings(bks.map(b => ({
        ...b,
        slot: slotMap[b.slot_id] || null,
        second_slot: b.second_slot_id ? (slotMap[b.second_slot_id] || null) : null,
        subject: subMap[b.subject_id] || null,
        tutor_profile: tpMap[b.tutor_id] ? { ...tpMap[b.tutor_id], profile: profMap[b.tutor_id] || null } : null,
        already_reviewed: reviewed.has(b.id),
      })))
      setLoading(false)
    }
    load()
  }, [])

  function isFuture(b: any) {
    if (b.status === 'cancellato') return false
    if (b.status === 'completato') return false
    if (!b.slot) return false
    return !isSlotPast(b.slot.date, b.slot.end_time)
  }

  function isPast(b: any) {
    if (b.status === 'cancellato') return true
    if (b.status === 'completato') return true
    if (!b.slot) return false
    return isSlotPast(b.slot.date, b.slot.end_time)
  }

  const future = bookings.filter(isFuture)
  const past = bookings.filter(isPast)
  const current = tab === 'future' ? future : past

  async function submitReview() {
    if (!reviewModal) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('reviews').insert({
      booking_id: reviewModal.id,
      student_id: user.id,
      tutor_id: reviewModal.tutor_id,
      rating: review.rating,
      comment: review.comment,
    })
    setReviewModal(null)
    setReview({ rating: 5, comment: '' })
    alert('Recensione inviata!')
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">Le mie lezioni</h1>
        <p className="text-gray-500 mt-1">Storico e prossime lezioni prenotate</p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
        {([['future', 'Prossime'], ['passate', 'Passate']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${tab === key ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {label} {key === 'future' ? `(${future.length})` : `(${past.length})`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {current.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-600">Nessuna lezione {tab === 'future' ? 'programmata' : 'passata'}</p>
          </div>
        ) : current.map((booking: any) => (
          <div key={booking.id} className={`bg-white rounded-2xl border shadow-soft p-4 sm:p-5 ${booking.status === 'cancellato' ? 'border-red-100 opacity-60' : 'border-gray-100'}`}>
            {/* Top row: icon + info + badge */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 ${booking.mode === 'online' ? 'bg-blue-50' : 'bg-green-50'}`}>
                {booking.mode === 'online' ? <Video className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" /> : <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm sm:text-base leading-snug">{booking.subject?.name} · {GRADE_LABELS[booking.grade]}</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                      {booking.tutor_profile?.profile?.first_name} {booking.tutor_profile?.profile?.last_name?.[0]}.
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 whitespace-nowrap ${
                    booking.status === 'completato' ? 'bg-green-100 text-green-700' :
                    booking.status === 'cancellato' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {booking.status === 'completato' ? 'Completata' : booking.status === 'cancellato' ? 'Annullata' : 'Confermata'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2.5 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    {booking.slot ? formatDate(booking.slot.date) : '—'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    {booking.slot
                      ? `${formatTime(booking.slot.start_time)} – ${formatTime(booking.second_slot?.end_time ?? booking.slot.end_time)}`
                      : '—'}
                    {booking.second_slot && <span className="text-gray-400 ml-0.5">(2h)</span>}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {booking.mode === 'online' ? <Video className="w-3.5 h-3.5 flex-shrink-0" /> : <MapPin className="w-3.5 h-3.5 flex-shrink-0" />}
                    {MODE_LABELS[booking.mode]}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Argomento: {booking.topic}</p>
                {booking.address && <p className="text-xs text-gray-400 mt-0.5">📍 {booking.address}</p>}
              </div>
            </div>

            {booking.mode === 'online' && booking.meet_link && booking.status !== 'cancellato' && (
              <div className="mt-3 space-y-2.5">
                <a href={booking.meet_link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-black text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-colors w-full sm:w-auto sm:inline-flex">
                  <Video className="w-3.5 h-3.5" /> Entra in videochiamata
                </a>
                <div className="flex items-start gap-2 bg-blue-50 rounded-xl px-3 py-2">
                  <span className="text-blue-400 flex-shrink-0 text-xs">ℹ️</span>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Al primo accesso Jitsi chiede di <strong>accedere con Google</strong> per avviare la stanza come moderatore.
                  </p>
                </div>
              </div>
            )}

            {booking.status === 'completato' && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-500">Hai trovato utile questa lezione?</p>
                {(booking as any).already_reviewed ? (
                  <span className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" /> Recensione inviata
                  </span>
                ) : (
                  <button onClick={() => setReviewModal(booking)}
                    className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1.5 rounded-xl font-medium hover:bg-yellow-100 transition-colors flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5" /> Lascia una recensione
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {reviewModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold mb-2">Recensisci il tutor</h3>
            <p className="text-sm text-gray-500 mb-6">Come valuti la lezione con {(reviewModal as any).tutor_profile?.profile?.first_name}?</p>
            <div className="flex gap-2 justify-center mb-6">
              {[1,2,3,4,5].map(i => (
                <button key={i} onClick={() => setReview(r => ({ ...r, rating: i }))}>
                  <Star className={`w-8 h-8 transition-colors ${i <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                </button>
              ))}
            </div>
            <textarea value={review.comment} onChange={e => setReview(r => ({ ...r, comment: e.target.value }))}
              rows={3} placeholder="Descrivi la tua esperienza (facoltativo)"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-gray-900 transition-all resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setReviewModal(null)} className="flex-1 border border-gray-200 text-gray-700 font-medium py-3 rounded-2xl hover:bg-gray-50 transition-colors">Annulla</button>
              <button onClick={submitReview} className="flex-1 bg-black text-white font-semibold py-3 rounded-2xl hover:bg-gray-800 transition-colors">Invia recensione</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
