'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Clock, Video, MapPin, CheckCircle } from 'lucide-react'
import { formatDate, formatTime, GRADE_LABELS, MODE_LABELS, isSlotPast } from '@/lib/utils'
import Button from '@/components/ui/Button'

export default function TutorLezionePage() {
  const supabase = createClient()
  const [tab, setTab] = useState<'future' | 'passate'>('future')
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: bks } = await supabase
        .from('bookings').select('*').eq('tutor_id', user.id).order('created_at', { ascending: false })
      if (!bks?.length) { setBookings([]); setLoading(false); return }

      const studentIds = [...new Set(bks.map(b => b.student_id))]
      const slotIds = [...new Set([...bks.map(b => b.slot_id), ...bks.map(b => b.second_slot_id).filter(Boolean)])]
      const subjectIds = [...new Set(bks.map(b => b.subject_id))]

      const [{ data: profs }, { data: slots }, { data: subs }] = await Promise.all([
        supabase.from('profiles').select('*').in('id', studentIds),
        supabase.from('calendar_slots').select('*').in('id', slotIds),
        supabase.from('subjects').select('*').in('id', subjectIds),
      ])

      const profMap = Object.fromEntries((profs || []).map(p => [p.id, p]))
      const slotMap = Object.fromEntries((slots || []).map(s => [s.id, s]))
      const subMap = Object.fromEntries((subs || []).map(s => [s.id, s]))

      setBookings(bks.map(b => ({
        ...b,
        slot: slotMap[b.slot_id] || null,
        second_slot: b.second_slot_id ? (slotMap[b.second_slot_id] || null) : null,
        subject: subMap[b.subject_id] || null,
        student_profile: profMap[b.student_id] || null,
      })))
      setLoading(false)
    }
    load()
  }, [])

  function isFuture(b: any) {
    if (b.status === 'cancellato' || b.status === 'completato') return false
    if (!b.slot) return false
    return !isSlotPast(b.slot.date, b.slot.end_time)
  }

  function isPast(b: any) {
    if (b.status === 'completato') return true
    if (b.status === 'cancellato') return true
    if (!b.slot) return false
    return isSlotPast(b.slot.date, b.slot.end_time)
  }

  async function markCompleted(bookingId: string, slotId: string, secondSlotId?: string | null) {
    setMarking(bookingId)
    const slotUpdates: Promise<any>[] = [
      supabase.from('calendar_slots').update({ status: 'completato' }).eq('id', slotId),
    ]
    if (secondSlotId) slotUpdates.push(supabase.from('calendar_slots').update({ status: 'completato' }).eq('id', secondSlotId))
    await Promise.all([
      supabase.from('bookings').update({ status: 'completato' }).eq('id', bookingId),
      ...slotUpdates,
    ])
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'completato' } : b))
    setMarking(null)
  }

  const future = bookings.filter(isFuture)
  const past = bookings.filter(isPast)
  const pendingCompletion = past.filter(b => b.status === 'confermato' && b.slot && isSlotPast(b.slot.date, b.slot.end_time))
  const current = tab === 'future' ? future : past

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">Le mie lezioni</h1>
        <p className="text-gray-500 mt-1">Gestisci e monitora le tue lezioni</p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
        <button onClick={() => setTab('future')}
          className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${tab === 'future' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          Prossime ({future.length})
        </button>
        <button onClick={() => setTab('passate')}
          className={`relative px-5 py-2 rounded-xl text-sm font-semibold transition-all ${tab === 'passate' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          Passate ({past.length})
          {pendingCompletion.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {pendingCompletion.length}
            </span>
          )}
        </button>
      </div>

      <div className="space-y-3">
        {current.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-600">Nessuna lezione {tab === 'future' ? 'programmata' : 'passata'}</p>
          </div>
        ) : (
          <>
            {/* Banner azione richiesta — solo nel tab passate */}
            {tab === 'passate' && pendingCompletion.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <p className="text-sm text-orange-700 font-medium">
                  {pendingCompletion.length} {pendingCompletion.length === 1 ? 'lezione deve' : 'lezioni devono'} essere segnate come completate per ricevere il pagamento.
                </p>
              </div>
            )}
            {current.map((booking: any) => {
              const needsCompletion = booking.status === 'confermato' && booking.slot && isSlotPast(booking.slot.date, booking.slot.end_time)
              return (
                <div key={booking.id} className={`bg-white rounded-2xl border shadow-soft p-4 sm:p-5 ${needsCompletion ? 'border-orange-200' : 'border-gray-100'}`}>
                  {/* Top row: icon + info + badge */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 ${booking.mode === 'online' ? 'bg-blue-50' : 'bg-green-50'}`}>
                      {booking.mode === 'online' ? <Video className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" /> : <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-sm sm:text-base leading-snug">{booking.subject?.name} · {GRADE_LABELS[booking.grade]}</p>
                          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Studente: {booking.student_profile?.first_name} {booking.student_profile?.last_name?.[0]}.</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 whitespace-nowrap ${
                          booking.status === 'completato' ? 'bg-green-100 text-green-700' :
                          booking.status === 'cancellato' ? 'bg-red-100 text-red-700' :
                          needsCompletion ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {booking.status === 'completato' ? 'Completata' : booking.status === 'cancellato' ? 'Annullata' : needsCompletion ? 'Da completare' : 'Confermata'}
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
                          {booking.second_slot && <span className="ml-0.5 text-gray-400">(2h)</span>}
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

                  {((booking.mode === 'online' && booking.meet_link && booking.status !== 'completato') || needsCompletion) && (
                    <div className="mt-3 space-y-2.5">
                      {/* Bottoni azione */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        {booking.mode === 'online' && booking.meet_link && booking.status !== 'completato' && (
                          <a href={booking.meet_link} target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 text-xs bg-black text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-colors w-full sm:w-auto">
                            <Video className="w-3.5 h-3.5" /> Entra in videochiamata
                          </a>
                        )}
                        {needsCompletion && (
                          <Button size="sm" loading={marking === booking.id} className="w-full sm:w-auto justify-center"
                            onClick={() => markCompleted(booking.id, booking.slot_id, booking.second_slot_id)}>
                            <CheckCircle className="w-3.5 h-3.5" /> Segna come completata
                          </Button>
                        )}
                      </div>
                      {/* Banner Jitsi */}
                      {booking.mode === 'online' && booking.meet_link && booking.status !== 'completato' && (
                        <div className="flex items-start gap-2 bg-blue-50 rounded-xl px-3 py-2">
                          <span className="text-blue-400 flex-shrink-0 text-xs">ℹ️</span>
                          <p className="text-xs text-blue-700 leading-relaxed">
                            Al primo accesso Jitsi chiede di <strong>accedere con Google</strong> per avviare la stanza come moderatore.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
