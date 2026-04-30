'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Trash2, RotateCcw, Plus, X } from 'lucide-react'
import { formatDate, formatTime, GRADE_LABELS } from '@/lib/utils'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function AdminPrenotazioniPage() {
  const supabase = createClient()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const [createModal, setCreateModal] = useState(false)
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [allTutors, setAllTutors] = useState<any[]>([])
  const [tutorSlots, setTutorSlots] = useState<any[]>([])
  const [tutorSubjects, setTutorSubjects] = useState<any[]>([])
  const [createForm, setCreateForm] = useState({
    student_id: '', tutor_id: '', slot_id: '', subject_id: '',
    grade: 'medie', mode: 'online', topic: '', address: '',
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => { loadBookings() }, [])

  async function loadBookings() {
    setLoading(true)
    const { data: bks } = await supabase.from('bookings').select('*').order('created_at', { ascending: false })
    if (!bks?.length) { setBookings([]); setLoading(false); return }

    const studentIds = [...new Set(bks.map((b: any) => b.student_id))]
    const tutorIds = [...new Set(bks.map((b: any) => b.tutor_id))]
    const slotIds = [...new Set([...bks.map((b: any) => b.slot_id), ...bks.map((b: any) => b.second_slot_id).filter(Boolean)])]
    const subjectIds = [...new Set(bks.map((b: any) => b.subject_id))]

    const [{ data: studentProfiles }, { data: tutorProfiles }, { data: slots }, { data: subjects }] = await Promise.all([
      supabase.from('profiles').select('*').in('id', studentIds),
      supabase.from('profiles').select('*').in('id', tutorIds),
      supabase.from('calendar_slots').select('*').in('id', slotIds),
      supabase.from('subjects').select('*').in('id', subjectIds),
    ])

    const studentMap = Object.fromEntries((studentProfiles || []).map((p: any) => [p.id, p]))
    const tutorMap = Object.fromEntries((tutorProfiles || []).map((p: any) => [p.id, p]))
    const slotMap = Object.fromEntries((slots || []).map((s: any) => [s.id, s]))
    const subjectMap = Object.fromEntries((subjects || []).map((s: any) => [s.id, s]))

    setBookings(bks.map((b: any) => ({
      ...b,
      student: studentMap[b.student_id] || null,
      tutor: tutorMap[b.tutor_id] || null,
      slot: slotMap[b.slot_id] || null,
      second_slot: b.second_slot_id ? (slotMap[b.second_slot_id] || null) : null,
      subject: subjectMap[b.subject_id] || null,
    })))
    setLoading(false)
  }

  async function openCreateModal() {
    const [{ data: students }, { data: tutors }] = await Promise.all([
      supabase.from('profiles').select('*').eq('role', 'studente').order('first_name'),
      supabase.from('profiles').select('*').eq('role', 'tutor').order('first_name'),
    ])
    setAllStudents(students || [])
    setAllTutors(tutors || [])
    setCreateForm({ student_id: '', tutor_id: '', slot_id: '', subject_id: '', grade: 'medie', mode: 'online', topic: '', address: '' })
    setTutorSlots([])
    setTutorSubjects([])
    setCreateModal(true)
  }

  async function onTutorChange(tutorId: string) {
    setCreateForm(f => ({ ...f, tutor_id: tutorId, slot_id: '', subject_id: '' }))
    if (!tutorId) { setTutorSlots([]); setTutorSubjects([]); return }
    const today = new Date().toISOString().split('T')[0]
    const [{ data: slots }, { data: ts }] = await Promise.all([
      supabase.from('calendar_slots').select('*').eq('tutor_id', tutorId).eq('status', 'disponibile').gte('date', today).order('date').order('start_time'),
      supabase.from('tutor_subjects').select('*, subject:subjects(*)').eq('tutor_id', tutorId),
    ])
    setTutorSlots(slots || [])
    setTutorSubjects(((ts || []) as any[]).map((t: any) => t.subject).filter(Boolean))
  }

  async function createBooking() {
    const { student_id, tutor_id, slot_id, subject_id, grade, mode, topic, address } = createForm
    if (!student_id || !tutor_id || !slot_id || !subject_id || !topic.trim()) {
      alert('Compila tutti i campi obbligatori')
      return
    }
    setCreating(true)
    const { error } = await supabase.from('bookings').insert({
      student_id, tutor_id, slot_id, subject_id, grade, mode,
      topic: topic.trim(),
      address: mode !== 'online' ? address : null,
      status: 'confermato',
      hours_used: 1,
    })
    if (error) {
      alert(`Errore: ${error.message}`)
    } else {
      setCreateModal(false)
      loadBookings()
    }
    setCreating(false)
  }

  async function deleteBooking(booking: any) {
    const refund = confirm(`Eliminare la prenotazione di ${booking.student?.first_name}?\n\nRimborsare ${booking.hours_used}h allo studente?`)
    await supabase.from('bookings').update({ status: 'cancellato' }).eq('id', booking.id)
    const slotUpdates: Promise<any>[] = []
    if (booking.slot_id) slotUpdates.push(supabase.from('calendar_slots').update({ status: 'disponibile' }).eq('id', booking.slot_id))
    if (booking.second_slot_id) slotUpdates.push(supabase.from('calendar_slots').update({ status: 'disponibile' }).eq('id', booking.second_slot_id))
    if (slotUpdates.length) await Promise.all(slotUpdates)
    if (refund) {
      const field = booking.grade === 'medie' ? 'hour_credits_medie' : booking.grade === 'superiori' ? 'hour_credits_superiori' : 'hour_credits_universita'
      const { data: sp } = await supabase.from('student_profiles').select(field).eq('id', booking.student_id).single()
      if (sp) await supabase.from('student_profiles').update({ [field]: (sp as any)[field] + booking.hours_used }).eq('id', booking.student_id)
    }
    loadBookings()
  }

  async function changeStatus(bookingId: string, newStatus: string) {
    await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId)
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b))
  }

  const filtered = bookings.filter(b => {
    const text = `${b.student?.first_name} ${b.student?.last_name} ${b.tutor?.first_name} ${b.tutor?.last_name} ${b.subject?.name}`.toLowerCase()
    const matchSearch = !search || text.includes(search.toLowerCase())
    const matchStatus = !filterStatus || b.status === filterStatus
    return matchSearch && matchStatus
  })

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Gestione Prenotazioni</h1>
          <p className="text-gray-500 mt-1">{filtered.length} prenotazioni trovate</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4" /> Nuova prenotazione
        </Button>
      </div>

      <div className="flex gap-4">
        <Input placeholder="Cerca studente, tutor, materia..." value={search} onChange={e => setSearch(e.target.value)} icon={<Search className="w-4 h-4" />} className="flex-1" />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-gray-900 bg-white">
          <option value="">Tutti gli stati</option>
          <option value="confermato">Confermato</option>
          <option value="completato">Completato</option>
          <option value="cancellato">Cancellato</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Studente', 'Tutor', 'Materia', 'Grado', 'Data', 'Modalità', 'Stato', 'Azioni'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400">Nessuna prenotazione trovata</td></tr>
              ) : filtered.map(booking => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{booking.student?.first_name} {booking.student?.last_name?.[0]}.</td>
                  <td className="px-4 py-3 text-gray-600">{booking.tutor?.first_name} {booking.tutor?.last_name?.[0]}.</td>
                  <td className="px-4 py-3">{booking.subject?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{GRADE_LABELS[booking.grade] || booking.grade}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {booking.slot
                      ? `${formatDate(booking.slot.date)} ${formatTime(booking.slot.start_time)}–${formatTime(booking.second_slot?.end_time ?? booking.slot.end_time)}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${booking.mode === 'online' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                      {booking.mode === 'online' ? 'Online' : 'Presenza'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      booking.status === 'completato' ? 'bg-green-100 text-green-700' :
                      booking.status === 'cancellato' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {booking.status !== 'cancellato' && (
                        <button onClick={() => deleteBooking(booking)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors" title="Cancella prenotazione">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {booking.status === 'completato' && (
                        <button onClick={() => changeStatus(booking.id, 'confermato')} className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors" title="Ripristina a confermato">
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {booking.status === 'confermato' && (
                        <button onClick={() => changeStatus(booking.id, 'completato')} className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-2 py-1 rounded-lg font-medium transition-colors">
                          ✓ Completa
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Crea prenotazione modal */}
      {createModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setCreateModal(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">Nuova prenotazione</h3>
              <button onClick={() => setCreateModal(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Studente *</label>
                <select value={createForm.student_id} onChange={e => setCreateForm(f => ({ ...f, student_id: e.target.value }))}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-gray-900 bg-white">
                  <option value="">Seleziona studente...</option>
                  {allStudents.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tutor *</label>
                <select value={createForm.tutor_id} onChange={e => onTutorChange(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-gray-900 bg-white">
                  <option value="">Seleziona tutor...</option>
                  {allTutors.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                  ))}
                </select>
              </div>

              {createForm.tutor_id && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Slot disponibile *</label>
                    {tutorSlots.length === 0 ? (
                      <p className="text-sm text-gray-400 bg-gray-50 rounded-2xl px-4 py-3">Nessuno slot disponibile per questo tutor</p>
                    ) : (
                      <select value={createForm.slot_id} onChange={e => setCreateForm(f => ({ ...f, slot_id: e.target.value }))}
                        className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-gray-900 bg-white">
                        <option value="">Seleziona slot...</option>
                        {tutorSlots.map((s: any) => (
                          <option key={s.id} value={s.id}>{formatDate(s.date)} · {formatTime(s.start_time)} – {formatTime(s.end_time)}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Materia *</label>
                    {tutorSubjects.length === 0 ? (
                      <p className="text-sm text-gray-400 bg-gray-50 rounded-2xl px-4 py-3">Nessuna materia configurata per questo tutor</p>
                    ) : (
                      <select value={createForm.subject_id} onChange={e => setCreateForm(f => ({ ...f, subject_id: e.target.value }))}
                        className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-gray-900 bg-white">
                        <option value="">Seleziona materia...</option>
                        {tutorSubjects.map((s: any) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Grado scolastico *</label>
                <div className="flex gap-2">
                  {[{ value: 'medie', label: 'Medie' }, { value: 'superiori', label: 'Superiori' }, { value: 'universita', label: 'Università' }].map(g => (
                    <button key={g.value} onClick={() => setCreateForm(f => ({ ...f, grade: g.value }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${createForm.grade === g.value ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-700 hover:border-gray-400'}`}>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Modalità *</label>
                <div className="flex gap-2">
                  {[{ value: 'online', label: 'Online' }, { value: 'presenza', label: 'In presenza' }].map(m => (
                    <button key={m.value} onClick={() => setCreateForm(f => ({ ...f, mode: m.value }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${createForm.mode === m.value ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-700 hover:border-gray-400'}`}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {createForm.mode === 'presenza' && (
                <Input label="Indirizzo" value={createForm.address}
                  onChange={e => setCreateForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="Via Roma 1, Milano" />
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Argomento *</label>
                <textarea value={createForm.topic} onChange={e => setCreateForm(f => ({ ...f, topic: e.target.value }))} rows={2}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-gray-900 transition-all resize-none"
                  placeholder="Es. Equazioni di secondo grado" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setCreateModal(false)}
                className="flex-1 border border-gray-200 text-gray-700 font-medium py-3 rounded-2xl hover:bg-gray-50 transition-colors">
                Annulla
              </button>
              <Button loading={creating} onClick={createBooking} className="flex-1" size="lg">
                Crea prenotazione
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
