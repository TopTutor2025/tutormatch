'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, MapPin, Star, Heart, X, ChevronDown, ChevronUp } from 'lucide-react'
import { getDistanceKm, GRADE_LABELS, formatTime, formatDate, generateMeetLink, isSlotPast, isSlotTooSoon } from '@/lib/utils'
import Button from '@/components/ui/Button'
import type { Subject, TutorProfile, Profile, Booking, Subscription, StudentProfile, CalendarSlot } from '@/types/database'

type TutorCard = TutorProfile & {
  profile: Profile
  subjects: Subject[]
  grades: string[]
  avg_rating: number
  review_count: number
  is_favorite: boolean
  distance?: number
}

async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address + ', Italia')}&format=json&limit=1`,
      { headers: { 'User-Agent': 'Proflive/1.0 (tutormatch.it)' } }
    )
    const data = await res.json()
    if (!data.length) return null
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}

export default function CercaTutorPage() {
  const supabase = createClient()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [tutors, setTutors] = useState<TutorCard[]>([])
  const [filtered, setFiltered] = useState<TutorCard[]>([])
  const [filters, setFilters] = useState({ subject: '', grade: '', mode: 'online', search: '' })

  // Presence search
  const [addressInput, setAddressInput] = useState('')
  const [studentCoords, setStudentCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [geocoding, setGeocoding] = useState(false)

  const [expandedTutor, setExpandedTutor] = useState<string | null>(null)
  const [tutorSlots, setTutorSlots] = useState<CalendarSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null)
  const [secondSlot, setSecondSlot] = useState<CalendarSlot | null>(null)
  const [slotWarning, setSlotWarning] = useState<string | null>(null)
  const [bookingModal, setBookingModal] = useState(false)
  const [bookingForm, setBookingForm] = useState({ topic: '', address: '' })
  const [bookingGrade, setBookingGrade] = useState('')
  const [bookingSubject, setBookingSubject] = useState('')
  const [bookingMode, setBookingMode] = useState<'online' | 'presenza'>('online')
  const [booking, setBooking] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [userId, setUserId] = useState<string>('')
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)
  const [activeTutor, setActiveTutor] = useState<TutorCard | null>(null)
  const [reviewsModal, setReviewsModal] = useState<TutorCard | null>(null)
  const [reviewsList, setReviewsList] = useState<any[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const [{ data: subs }, { data: sp }, { data: subjectData }] = await Promise.all([
        supabase.from('subjects').select('*').eq('active', true).order('name'),
        supabase.from('student_profiles').select('*').eq('id', user.id).single(),
        supabase.from('subscriptions').select('*').eq('student_id', user.id).eq('status', 'attivo').single(),
      ])
      setSubjects(subs || [])
      setStudentProfile(sp)
      setSubscription(subjectData)
      await loadTutors(user.id)
    }
    load()
  }, [])

  async function loadTutors(uid: string) {
    const [
      { data: tutorData },
      { data: profilesData },
      { data: tsData },
      { data: tgData },
      { data: favData },
      { data: reviewData },
      { data: subjectsFull },
    ] = await Promise.all([
      supabase.from('tutor_profiles').select('*').eq('is_active', true),
      supabase.from('profiles').select('*').eq('role', 'tutor'),
      supabase.from('tutor_subjects').select('tutor_id, subject_id'),
      supabase.from('tutor_grades').select('tutor_id, grade'),
      supabase.from('favorites').select('tutor_id').eq('student_id', uid),
      supabase.from('reviews').select('tutor_id, rating'),
      supabase.from('subjects').select('*'),
    ])

    const profileMap = Object.fromEntries((profilesData || []).map(p => [p.id, p]))
    const subjectMap = Object.fromEntries((subjectsFull || []).map(s => [s.id, s]))
    const favIds = new Set(favData?.map(f => f.tutor_id) || [])
    const tsMap: Record<string, string[]> = {}
    ;(tsData || []).forEach(ts => { tsMap[ts.tutor_id] = [...(tsMap[ts.tutor_id] || []), ts.subject_id] })
    const tgMap: Record<string, string[]> = {}
    ;(tgData || []).forEach(tg => { tgMap[tg.tutor_id] = [...(tgMap[tg.tutor_id] || []), tg.grade] })
    const ratingMap: Record<string, { sum: number; count: number }> = {}
    ;(reviewData || []).forEach(r => {
      if (!ratingMap[r.tutor_id]) ratingMap[r.tutor_id] = { sum: 0, count: 0 }
      ratingMap[r.tutor_id].sum += r.rating
      ratingMap[r.tutor_id].count += 1
    })

    const cards: TutorCard[] = (tutorData || []).map(t => ({
      ...t,
      profile: profileMap[t.id],
      subjects: (tsMap[t.id] || []).map(sid => subjectMap[sid]).filter(Boolean),
      grades: tgMap[t.id] || [],
      avg_rating: ratingMap[t.id] ? ratingMap[t.id].sum / ratingMap[t.id].count : 0,
      review_count: ratingMap[t.id]?.count || 0,
      is_favorite: favIds.has(t.id),
    })).filter(t => t.profile)

    setTutors(cards)
  }

  useEffect(() => {
    let result = [...tutors]
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(t =>
        `${t.profile?.first_name} ${t.profile?.last_name}`.toLowerCase().includes(q) ||
        t.subjects.some(s => s.name.toLowerCase().includes(q))
      )
    }
    if (filters.subject) result = result.filter(t => t.subjects.some(s => s.id === filters.subject))
    if (filters.grade) result = result.filter(t => t.grades.includes(filters.grade))

    if (filters.mode === 'online') {
      result = result.filter(t => t.lesson_mode === 'online' || t.lesson_mode === 'entrambe')
    } else if (filters.mode === 'presenza') {
      // Block results until student confirms their address
      if (!studentCoords) { setFiltered([]); return }
      result = result
        .filter(t => (t.lesson_mode === 'presenza' || t.lesson_mode === 'entrambe') && t.latitude && t.longitude)
        .map(t => ({ ...t, distance: getDistanceKm(studentCoords.lat, studentCoords.lon, t.latitude!, t.longitude!) }))
        .filter(t => (t.distance ?? 999) <= 5)
        .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
    }

    setFiltered(result)
  }, [filters, studentCoords, tutors])

  async function searchByAddress() {
    if (!addressInput.trim()) return
    setGeocoding(true)
    const coords = await geocodeAddress(addressInput)
    if (!coords) {
      alert('Indirizzo non trovato. Prova a essere più specifico (es. "Via Roma 1, Milano").')
    } else {
      setStudentCoords(coords)
    }
    setGeocoding(false)
  }

  function onModeChange(mode: string) {
    setFilters(f => ({ ...f, mode }))
    if (mode !== 'presenza') {
      setStudentCoords(null)
      setAddressInput('')
    }
    // Lock booking mode to search mode
    if (mode === 'online') setBookingMode('online')
    if (mode === 'presenza') setBookingMode('presenza')
  }

  async function toggleFavorite(tutorId: string, isFav: boolean) {
    if (isFav) {
      await supabase.from('favorites').delete().eq('student_id', userId).eq('tutor_id', tutorId)
    } else {
      await supabase.from('favorites').insert({ student_id: userId, tutor_id: tutorId })
    }
    setTutors(prev => prev.map(t => t.id === tutorId ? { ...t, is_favorite: !isFav } : t))
  }

  async function openReviews(tutor: TutorCard) {
    setReviewsModal(tutor)
    setReviewsLoading(true)
    const { data: revs } = await supabase
      .from('reviews')
      .select('*, student:profiles!reviews_student_id_fkey(first_name)')
      .eq('tutor_id', tutor.id)
      .order('created_at', { ascending: false })
    setReviewsList(revs || [])
    setReviewsLoading(false)
  }

  async function expandTutor(tutor: TutorCard) {
    if (expandedTutor === tutor.id) { setExpandedTutor(null); return }
    setExpandedTutor(tutor.id)
    setActiveTutor(tutor)
    setSlotWarning(null)
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('calendar_slots')
      .select('*')
      .eq('tutor_id', tutor.id)
      .in('status', ['disponibile', 'prenotato'])
      .gte('date', today)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
    setTutorSlots(data || [])
    setSelectedSlot(null)
    setSecondSlot(null)
  }

  function findConsecutiveSlot(slot: CalendarSlot): CalendarSlot | null {
    // slot.end_time may be 'HH:MM' or 'HH:MM:SS' — normalize to first 5 chars for comparison
    const endHHMM = slot.end_time.slice(0, 5)
    return tutorSlots.find(s =>
      s.date === slot.date &&
      s.start_time.slice(0, 5) === endHHMM &&
      s.status === 'disponibile'
    ) || null
  }

  async function handleBook() {
    if (!selectedSlot || !activeTutor) return
    if (!subscription || new Date(subscription.expires_at) < new Date()) {
      setBookingError('Il tuo abbonamento è scaduto. Rinnova per prenotare.'); return
    }
    if (isSlotTooSoon(selectedSlot.date, selectedSlot.start_time)) {
      setBookingError('Questo slot non è più prenotabile: è richiesto almeno 12 ore di preavviso.'); return
    }
    if (!bookingGrade) { setBookingError('Seleziona il grado scolastico.'); return }
    if (!bookingSubject) { setBookingError('Seleziona la materia.'); return }

    const grade = bookingGrade as 'medie' | 'superiori' | 'universita'
    const hoursField = grade === 'medie' ? 'hour_credits_medie' : grade === 'superiori' ? 'hour_credits_superiori' : 'hour_credits_universita'
    const hoursNeeded = bookingMode === 'presenza' ? 2 : 1

    if (!studentProfile || (studentProfile[hoursField as keyof StudentProfile] as number) < hoursNeeded) {
      setBookingError(`Ore insufficienti per "${grade}". Hai bisogno di ${hoursNeeded}h per questa lezione.`); return
    }

    setBooking(true); setBookingError('')
    const meetLink = bookingMode !== 'presenza' ? generateMeetLink() : null

    const { error } = await supabase.from('bookings').insert({
      student_id: userId,
      tutor_id: activeTutor.id,
      slot_id: selectedSlot.id,
      second_slot_id: bookingMode === 'presenza' ? (secondSlot?.id || null) : null,
      subject_id: bookingSubject,
      grade,
      mode: bookingMode,
      topic: bookingForm.topic,
      address: bookingMode === 'presenza' ? bookingForm.address || null : null,
      meet_link: meetLink,
      hours_used: hoursNeeded,
    })

    if (error) { setBookingError('Errore durante la prenotazione. Riprova.'); setBooking(false); return }

    const { data: updatedSp } = await supabase.from('student_profiles').select('*').eq('id', userId).single()
    if (updatedSp) setStudentProfile(updatedSp)
    // Mark both slots as prenotato locally
    setTutorSlots(prev => prev.map(s =>
      s.id === selectedSlot.id || s.id === secondSlot?.id
        ? { ...s, status: 'prenotato' as any }
        : s
    ))
    setBookingModal(false)
    setBooking(false)
    setSelectedSlot(null)
    setSecondSlot(null)
    setBookingForm({ topic: '', address: '' })
    alert('Prenotazione confermata!')
  }

  const groupedSlots = tutorSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = []
    acc[slot.date].push(slot)
    return acc
  }, {} as Record<string, CalendarSlot[]>)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">Cerca un tutor</h1>
        <p className="text-gray-500 mt-1">Filtra per materia, grado e modalità per trovare il tutor perfetto</p>
      </div>

      {/* Filtri */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-soft space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca per nome tutor o materia..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            className="w-full border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:border-gray-900 transition-all bg-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Materia</label>
            <select value={filters.subject} onChange={e => setFilters(f => ({ ...f, subject: e.target.value }))}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-gray-900 transition-all bg-white">
              <option value="">Tutte le materie</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Grado scolastico</label>
            <select value={filters.grade} onChange={e => setFilters(f => ({ ...f, grade: e.target.value }))}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-gray-900 transition-all bg-white">
              <option value="">Tutti i gradi</option>
              <option value="medie">Scuola Media</option>
              <option value="superiori">Scuola Superiore</option>
              <option value="universita">Università</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Modalità</label>
            <div className="flex gap-2">
              {[{ value: 'online', label: '📺 Online' }, { value: 'presenza', label: '📍 In presenza' }].map(m => (
                <button key={m.value} onClick={() => onModeChange(m.value)}
                  className={`flex-1 py-3 rounded-2xl text-sm font-medium border transition-all ${filters.mode === m.value ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Blocco indirizzo per presenza */}
        {filters.mode === 'presenza' && (
          <div className="pt-3 border-t border-gray-100">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-2">
              <MapPin className="w-4 h-4 text-pink-500" />
              Dove si terrà la lezione? (cerchiamo tutor entro 5km)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={addressInput}
                onChange={e => { setAddressInput(e.target.value); setStudentCoords(null) }}
                onKeyDown={e => e.key === 'Enter' && searchByAddress()}
                placeholder="Es. Via Roma 1, Milano"
                className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-gray-900 transition-all bg-white"
              />
              <Button size="sm" loading={geocoding} onClick={searchByAddress} disabled={!addressInput.trim()}>
                Cerca
              </Button>
              {studentCoords && (
                <button onClick={() => { setStudentCoords(null); setAddressInput('') }}
                  className="p-3 rounded-2xl border border-gray-200 hover:bg-gray-100 transition-colors text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {studentCoords && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5" />
                Posizione trovata · mostrando tutor entro 5km
              </p>
            )}
            {!studentCoords && !geocoding && (
              <p className="text-xs text-amber-600 mt-2">Inserisci l'indirizzo della lezione e clicca Cerca per vedere i tutor disponibili</p>
            )}
          </div>
        )}
      </div>

      {/* Risultati */}
      <p className="text-sm text-gray-500">
        {filters.mode === 'presenza' && !studentCoords
          ? 'Inserisci un indirizzo per trovare tutor nelle vicinanze'
          : `${filtered.length} tutor trovati`}
      </p>

      <div className="space-y-4">
        {filters.mode === 'presenza' && !studentCoords ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-600">Inserisci il tuo indirizzo</p>
            <p className="text-sm text-gray-400 mt-1">Cerchiamo tutor disponibili in presenza entro 5km dalla posizione indicata</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-600">Nessun tutor trovato</p>
            <p className="text-sm text-gray-400 mt-1">
              {filters.mode === 'presenza'
                ? 'Nessun tutor disponibile in presenza entro 5km dall\'indirizzo inserito'
                : 'Prova a modificare i filtri di ricerca'}
            </p>
          </div>
        ) : filtered.map(tutor => (
          <div key={tutor.id} className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {tutor.profile?.avatar_url ? (
                    <img src={tutor.profile.avatar_url} alt={tutor.profile.first_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-200 to-pink-300 flex items-center justify-center text-white font-bold">
                      {tutor.profile?.first_name?.[0]}{tutor.profile?.last_name?.[0]}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{tutor.profile?.first_name}</h3>
                      <button
                        onClick={() => tutor.review_count > 0 && openReviews(tutor)}
                        className={`flex items-center gap-1 mt-0.5 ${tutor.review_count > 0 ? 'hover:opacity-70 cursor-pointer' : 'cursor-default'}`}>
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(tutor.avg_rating) ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">
                          {tutor.avg_rating > 0 ? tutor.avg_rating.toFixed(1) : 'Nessuna recensione'} {tutor.review_count > 0 ? `(${tutor.review_count})` : ''}
                        </span>
                        {tutor.review_count > 0 && <span className="text-xs text-gray-400 ml-0.5">›</span>}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {tutor.distance !== undefined && (
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium">
                          📍 {tutor.distance.toFixed(1)}km
                        </span>
                      )}
                      <button onClick={() => toggleFavorite(tutor.id, tutor.is_favorite)}
                        className={`p-2 rounded-xl transition-all ${tutor.is_favorite ? 'text-pink-500 bg-pink-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                        <Heart className={`w-4 h-4 ${tutor.is_favorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{tutor.bio || 'Nessuna bio disponibile'}</p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {tutor.subjects.slice(0, 4).map(s => (
                      <span key={s.id} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{s.name}</span>
                    ))}
                    {tutor.subjects.length > 4 && <span className="text-xs text-gray-400">+{tutor.subjects.length - 4} altri</span>}
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-2">
                    <div className="flex flex-wrap gap-1.5">
                      {tutor.grades.map(g => (
                        <span key={g} className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                          g === 'medie' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          g === 'superiori' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}>
                          {g === 'medie' ? '🎒 Medie' : g === 'superiori' ? '📚 Superiori' : '🎓 Università'}
                        </span>
                      ))}
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full flex-shrink-0 ${tutor.lesson_mode === 'online' ? 'bg-blue-50 text-blue-700' : tutor.lesson_mode === 'presenza' ? 'bg-green-50 text-green-700' : 'bg-purple-50 text-purple-700'}`}>
                      {tutor.lesson_mode === 'online' ? '📺 Online' : tutor.lesson_mode === 'presenza' ? '📍 Presenza' : '🔀 Ibrido'}
                    </span>
                  </div>
                </div>
              </div>

              <button onClick={() => expandTutor(tutor)}
                className="flex items-center gap-2 mt-4 text-sm font-semibold text-black hover:text-gray-700 transition-colors">
                {expandedTutor === tutor.id ? <><ChevronUp className="w-4 h-4" /> Chiudi calendario</> : <><ChevronDown className="w-4 h-4" /> Vedi disponibilità</>}
              </button>
            </div>

            {expandedTutor === tutor.id && (
              <div className="border-t border-gray-100 p-5 bg-gray-50">
                <h4 className="font-semibold text-sm text-gray-900 mb-4">Disponibilità del tutor</h4>
                {Object.keys(groupedSlots).length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Nessuna disponibilità al momento</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupedSlots).slice(0, 7).map(([date, slots]) => (
                      <div key={date}>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{formatDate(date)}</p>
                        <div className="flex flex-wrap gap-2">
                          {slots.map(slot => {
                            const past = isSlotPast(slot.date, slot.end_time)
                            const tooSoon = !past && isSlotTooSoon(slot.date, slot.start_time)
                            const isBooked = slot.status === 'prenotato'
                            const isDisabled = isBooked || past || tooSoon
                            return (
                            <button key={slot.id}
                              disabled={isDisabled}
                              title={tooSoon ? 'Prenotabile con almeno 12 ore di preavviso' : undefined}
                              onClick={() => {
                                if (isDisabled) return
                                const preGrade = filters.grade && tutor.grades.includes(filters.grade)
                                  ? filters.grade
                                  : tutor.grades.length === 1 ? tutor.grades[0] : ''
                                const preSubject = filters.subject && tutor.subjects.some(s => s.id === filters.subject)
                                  ? filters.subject
                                  : tutor.subjects.length === 1 ? tutor.subjects[0].id : ''
                                const lockedMode = filters.mode === 'presenza' ? 'presenza' : 'online'

                                // Presenza: require a consecutive available slot
                                if (lockedMode === 'presenza') {
                                  const consec = findConsecutiveSlot(slot)
                                  if (!consec) {
                                    setSlotWarning('Questo slot non ha un\'ora consecutiva disponibile. Seleziona uno slot che abbia almeno un\'ora di seguito libera per prenotare le 2 ore in presenza.')
                                    setSecondSlot(null)
                                    return
                                  }
                                  setSecondSlot(consec)
                                  setSlotWarning(null)
                                } else {
                                  setSecondSlot(null)
                                  setSlotWarning(null)
                                }

                                setBookingGrade(preGrade)
                                setBookingSubject(preSubject)
                                setBookingMode(lockedMode)
                                setBookingForm({ topic: '', address: filters.mode === 'presenza' ? addressInput : '' })
                                setBookingError('')
                                setSelectedSlot(slot)
                                setBookingModal(true)
                              }}
                              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all
                                ${past ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through' :
                                  tooSoon ? 'bg-orange-50 text-orange-400 cursor-not-allowed border border-orange-100' :
                                  isBooked ? 'bg-amber-100 text-amber-700 cursor-not-allowed' :
                                  selectedSlot?.id === slot.id ? 'bg-black text-white' :
                                  'bg-white border border-pink-300 text-pink-700 hover:bg-pink-50 cursor-pointer'}`}>
                              {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                              {tooSoon && ' ⏱'}
                              {isBooked && ' ✗'}
                            </button>)
                          })
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {slotWarning && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
                    <span className="text-amber-500 flex-shrink-0 mt-0.5">⚠️</span>
                    {slotWarning}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Booking modal */}
      {bookingModal && selectedSlot && activeTutor && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Conferma prenotazione</h3>
              <button onClick={() => { setBookingModal(false); setSelectedSlot(null) }}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tutor</span>
                <span className="font-medium">{activeTutor.profile?.first_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Modalità</span>
                <span className={`font-medium ${bookingMode === 'online' ? 'text-blue-700' : 'text-green-700'}`}>
                  {bookingMode === 'online' ? '📺 Online' : '📍 In presenza'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Data</span>
                <span className="font-medium">{formatDate(selectedSlot.date)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Orario</span>
                <span className="font-medium">
                  {formatTime(selectedSlot.start_time)} – {formatTime(bookingMode === 'presenza' && secondSlot ? secondSlot.end_time : selectedSlot.end_time)}
                  {bookingMode === 'presenza' && secondSlot && <span className="text-gray-400 ml-1">(2 ore)</span>}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ore scalate</span>
                <span className="font-medium">{bookingMode === 'presenza' ? '2h' : '1h'}</span>
              </div>
            </div>

            {bookingError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3 mb-4">{bookingError}</div>
            )}

            <div className="space-y-4">
              {/* Grado */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Grado scolastico *</label>
                {activeTutor.grades.length === 1 ? (
                  <div className="border border-gray-200 rounded-2xl px-4 py-3 text-sm bg-gray-50 text-gray-700">
                    {activeTutor.grades[0] === 'medie' ? '🎒 Scuola Media' : activeTutor.grades[0] === 'superiori' ? '📚 Scuola Superiore' : '🎓 Università'}
                  </div>
                ) : (
                  <select value={bookingGrade} onChange={e => setBookingGrade(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-gray-900 bg-white">
                    <option value="">Seleziona il grado...</option>
                    {activeTutor.grades.map(g => (
                      <option key={g} value={g}>{g === 'medie' ? '🎒 Scuola Media' : g === 'superiori' ? '📚 Scuola Superiore' : '🎓 Università'}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Materia */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Materia *</label>
                {activeTutor.subjects.length === 1 ? (
                  <div className="border border-gray-200 rounded-2xl px-4 py-3 text-sm bg-gray-50 text-gray-700">
                    {activeTutor.subjects[0].name}
                  </div>
                ) : (
                  <select value={bookingSubject} onChange={e => setBookingSubject(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-gray-900 bg-white">
                    <option value="">Seleziona la materia...</option>
                    {activeTutor.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                )}
              </div>

              {/* Argomento */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Argomento della lezione *</label>
                <input type="text" value={bookingForm.topic}
                  onChange={e => setBookingForm(f => ({ ...f, topic: e.target.value }))}
                  placeholder="Es: Derivate e integrali, capitolo 5"
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-gray-900 transition-all"
                />
              </div>

              {/* Indirizzo (solo presenza) */}
              {bookingMode === 'presenza' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Indirizzo appuntamento *</label>
                  <input type="text" value={bookingForm.address}
                    onChange={e => setBookingForm(f => ({ ...f, address: e.target.value }))}
                    placeholder="Via Roma 1, Milano"
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-gray-900 transition-all"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => { setBookingModal(false); setSelectedSlot(null) }}>Annulla</Button>
              <Button className="flex-1" loading={booking} onClick={handleBook}
                disabled={!bookingForm.topic || !bookingGrade || !bookingSubject}>
                Prenota
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modale recensioni */}
      {reviewsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold">Recensioni</h3>
                <p className="text-sm text-gray-500">{reviewsModal.profile?.first_name} · {reviewsModal.review_count} {reviewsModal.review_count === 1 ? 'recensione' : 'recensioni'}</p>
              </div>
              <button onClick={() => { setReviewsModal(null); setReviewsList([]) }}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-700" />
              </button>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4 mb-5 flex-shrink-0">
              <span className="text-4xl font-extrabold text-black">{reviewsModal.avg_rating.toFixed(1)}</span>
              <div>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-5 h-5 ${i <= Math.round(reviewsModal.avg_rating) ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">su {reviewsModal.review_count} {reviewsModal.review_count === 1 ? 'recensione' : 'recensioni'}</p>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 space-y-3 pr-1">
              {reviewsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                </div>
              ) : reviewsList.map(r => (
                <div key={r.id} className="border border-gray-100 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i <= r.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">
                      {r.student?.first_name || 'Studente'} · {new Date(r.created_at).toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  {r.comment ? <p className="text-sm text-gray-700 leading-relaxed">{r.comment}</p> : <p className="text-sm text-gray-400 italic">Nessun commento</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
