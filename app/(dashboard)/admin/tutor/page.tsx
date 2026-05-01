'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Edit, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Calendar, Lock, Unlock, Trash2, RotateCcw, X } from 'lucide-react'
import { formatTime, isSlotPast } from '@/lib/utils'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const HOURS = Array.from({ length: 15 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`)

function getWeekDates(base: Date): Date[] {
  const day = base.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(base)
  monday.setDate(monday.getDate() + diff)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function dateKey(d: Date): string {
  return d.toISOString().split('T')[0]
}

export default function AdminTutorPage() {
  const supabase = createClient()
  const [tutors, setTutors] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [tutorSlots, setTutorSlots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [editModal, setEditModal] = useState<any>(null)
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', phone: '', bio: '', is_active: true })
  const [weekBase, setWeekBase] = useState(new Date())
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null)

  useEffect(() => { loadTutors() }, [])

  async function loadTutors() {
    const { data: profiles } = await supabase
      .from('profiles').select('*').eq('role', 'tutor').order('created_at', { ascending: false })
    if (!profiles?.length) { setTutors([]); setLoading(false); return }
    const { data: tps } = await supabase
      .from('tutor_profiles').select('*').in('id', profiles.map(p => p.id))
    const tpMap = Object.fromEntries((tps || []).map(tp => [tp.id, tp]))
    setTutors(profiles.map(p => ({ ...p, tutor_profile: tpMap[p.id] || null })))
    setLoading(false)
  }

  async function loadSlotsForTutor(tutorId: string, weekDates: Date[]) {
    setSlotsLoading(true)
    const weekStart = dateKey(weekDates[0])
    const weekEnd = dateKey(weekDates[6])
    const { data: slots } = await supabase
      .from('calendar_slots').select('*').eq('tutor_id', tutorId)
      .gte('date', weekStart).lte('date', weekEnd)
      .order('date').order('start_time')
    if (!slots?.length) { setTutorSlots([]); setSlotsLoading(false); return }

    const bookedSlotIds = slots.filter(s => s.status === 'prenotato').map(s => s.id)
    if (bookedSlotIds.length) {
      const { data: bks } = await supabase
        .from('bookings').select('*').in('slot_id', bookedSlotIds).neq('status', 'cancellato')
      if (bks?.length) {
        const subjectIds = [...new Set(bks.map(b => b.subject_id))]
        const studentIds = [...new Set(bks.map(b => b.student_id))]
        const [{ data: subjects }, { data: students }] = await Promise.all([
          supabase.from('subjects').select('*').in('id', subjectIds),
          supabase.from('profiles').select('*').in('id', studentIds),
        ])
        const subMap = Object.fromEntries((subjects || []).map(s => [s.id, s]))
        const stuMap = Object.fromEntries((students || []).map(s => [s.id, s]))
        const bkBySlot: Record<string, any> = {}
        bks.forEach(b => {
          const enriched = { ...b, subject: subMap[b.subject_id] || null, student: stuMap[b.student_id] || null }
          bkBySlot[b.slot_id] = enriched
          if (b.second_slot_id) bkBySlot[b.second_slot_id] = { ...enriched, isSecondSlot: true }
        })
        setTutorSlots(slots.map(s => ({ ...s, booking: bkBySlot[s.id] || null })))
        setSlotsLoading(false)
        return
      }
    }
    setTutorSlots(slots.map(s => ({ ...s, booking: null })))
    setSlotsLoading(false)
  }

  async function expandTutor(tutorId: string) {
    if (expanded === tutorId) { setExpanded(null); setSelectedSlot(null); return }
    const newWeek = new Date()
    setWeekBase(newWeek)
    setExpanded(tutorId)
    setSelectedSlot(null)
    await loadSlotsForTutor(tutorId, getWeekDates(newWeek))
  }

  async function navigateWeek(delta: number) {
    if (!expanded) return
    const newBase = new Date(weekBase)
    newBase.setDate(newBase.getDate() + delta * 7)
    setWeekBase(newBase)
    setSelectedSlot(null)
    await loadSlotsForTutor(expanded, getWeekDates(newBase))
  }

  function getSlotForCell(date: string, hour: string) {
    return tutorSlots.find(s => s.date === date && s.start_time.slice(0, 5) === hour) || null
  }

  function cellStyle(slot: any | null, isPast: boolean) {
    if (!slot) return 'bg-gray-50 border-gray-100 cursor-default'
    if (slot.status === 'completato') return 'bg-green-100 border-green-200 cursor-pointer'
    if (slot.status === 'prenotato') return 'bg-amber-100 border-amber-300 cursor-pointer'
    if (isPast) return 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50'
    if (slot.status === 'disponibile') return 'bg-pink-100 border-pink-300 hover:bg-pink-200 cursor-pointer'
    if (slot.status === 'bloccato') return 'bg-gray-100 border-gray-200 hover:bg-gray-200 cursor-pointer'
    return 'bg-gray-50 border-gray-100 cursor-default'
  }

  function cellIcon(slot: any | null) {
    if (!slot) return null
    if (slot.status === 'disponibile') return <Unlock className="w-3 h-3 text-pink-600" />
    if (slot.status === 'bloccato') return <Lock className="w-3 h-3 text-gray-400" />
    if (slot.status === 'prenotato') {
      if (slot.booking?.isSecondSlot) return <span className="text-[10px] font-bold text-amber-600 leading-none">+1h</span>
      return <span className="text-[10px] font-bold text-amber-700 leading-none">{slot.booking?.student?.first_name?.slice(0, 3) || '📅'}</span>
    }
    if (slot.status === 'completato') return <span className="text-[10px] text-green-600">✓</span>
    return null
  }

  async function handleCellClick(slot: any | null, date: string, hour: string) {
    if (!slot) return
    const endH = `${String(parseInt(hour) + 1).padStart(2, '0')}:00:00`
    const past = isSlotPast(date, endH)
    if (slot.status === 'prenotato') { setSelectedSlot(slot); return }
    if (slot.status === 'completato') { setSelectedSlot(slot); return }
    if (past) return
    // Toggle disponibile ↔ bloccato
    const newStatus = slot.status === 'disponibile' ? 'bloccato' : 'disponibile'
    await supabase.from('calendar_slots').update({ status: newStatus }).eq('id', slot.id)
    setTutorSlots(prev => prev.map(s => s.id === slot.id ? { ...s, status: newStatus } : s))
    if (selectedSlot?.id === slot.id) setSelectedSlot(null)
  }

  async function deleteBookingAdmin(slot: any) {
    const booking = slot.booking
    if (!booking) return
    const refund = confirm('Rimborsare le ore allo studente?')
    await supabase.from('bookings').update({ status: 'cancellato' }).eq('id', booking.id)
    const slotUpdates: any[] = [supabase.from('calendar_slots').update({ status: 'disponibile' }).eq('id', slot.id)]
    if (booking.second_slot_id) slotUpdates.push(supabase.from('calendar_slots').update({ status: 'disponibile' }).eq('id', booking.second_slot_id))
    await Promise.all(slotUpdates)
    if (refund) {
      const field = booking.grade === 'medie' ? 'hour_credits_medie' : booking.grade === 'superiori' ? 'hour_credits_superiori' : 'hour_credits_universita'
      const { data: sp } = await supabase.from('student_profiles').select(field).eq('id', booking.student_id).single()
      if (sp) await supabase.from('student_profiles').update({ [field]: (sp as any)[field] + booking.hours_used }).eq('id', booking.student_id)
    }
    setSelectedSlot(null)
    await loadSlotsForTutor(expanded!, getWeekDates(weekBase))
  }

  async function changeBookingStatus(slot: any, newStatus: string) {
    await supabase.from('bookings').update({ status: newStatus }).eq('id', slot.booking.id)
    setSelectedSlot(null)
    await loadSlotsForTutor(expanded!, getWeekDates(weekBase))
  }

  async function deleteUser(userId: string, name: string) {
    if (!confirm(`Eliminare definitivamente l'account di ${name}?\n\nQuesta azione è irreversibile e cancella tutti i dati associati.`)) return
    const res = await fetch('/api/admin/delete-user', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    if (res.ok) {
      setTutors(prev => prev.filter(t => t.id !== userId))
      if (expanded === userId) { setExpanded(null); setSelectedSlot(null) }
    } else {
      const { error } = await res.json()
      alert(`Errore: ${error}`)
    }
  }

  async function saveEdit() {
    if (!editModal) return
    await supabase.from('profiles').update({ first_name: editForm.first_name, last_name: editForm.last_name, phone: editForm.phone }).eq('id', editModal.id)
    await supabase.from('tutor_profiles').update({ bio: editForm.bio, is_active: editForm.is_active }).eq('id', editModal.id)
    setEditModal(null)
    loadTutors()
  }

  const filtered = tutors.filter(t => `${t.first_name} ${t.last_name} ${t.email}`.toLowerCase().includes(search.toLowerCase()))
  const weekDates = getWeekDates(weekBase)
  const today = dateKey(new Date())

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">Gestione Tutor</h1>
        <p className="text-gray-500 mt-1">{filtered.length} tutor registrati</p>
      </div>

      <Input placeholder="Cerca tutor..." value={search} onChange={e => setSearch(e.target.value)} icon={<Search className="w-4 h-4" />} />

      <div className="space-y-3">
        {filtered.map(tutor => {
          const isExpanded = expanded === tutor.id
          const isActive = tutor.tutor_profile?.is_active
          return (
            <div key={tutor.id} className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
              {/* Tutor header row */}
              <div className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {tutor.avatar_url ? (
                    <img src={tutor.avatar_url} alt={tutor.first_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold text-sm">
                      {tutor.first_name?.[0]}{tutor.last_name?.[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{tutor.first_name} {tutor.last_name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {isActive ? 'Attivo' : 'Inattivo'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 truncate mt-0.5">{tutor.email}</p>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <button onClick={() => { setEditModal(tutor); setEditForm({ first_name: tutor.first_name, last_name: tutor.last_name, phone: tutor.phone || '', bio: tutor.tutor_profile?.bio || '', is_active: isActive }) }}
                    className="p-1.5 sm:p-2 rounded-xl hover:bg-gray-100 transition-colors">
                    <Edit className="w-4 h-4 text-gray-500" />
                  </button>
                  <button onClick={() => deleteUser(tutor.id, `${tutor.first_name} ${tutor.last_name}`)}
                    className="p-1.5 sm:p-2 rounded-xl hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                  <button onClick={() => expandTutor(tutor.id)} className="p-1.5 sm:p-2 rounded-xl hover:bg-gray-100 transition-colors">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded calendar section */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50">
                  {/* Legenda + navigazione */}
                  <div className="px-5 pt-4 pb-3 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="font-semibold text-sm text-gray-800">Calendario slot</p>
                    </div>
                    <div className="flex items-center gap-3 ml-auto flex-wrap">
                      {[
                        { color: 'bg-gray-100 border-gray-300', label: 'Bloccato' },
                        { color: 'bg-pink-100 border-pink-300', label: 'Disponibile' },
                        { color: 'bg-amber-100 border-amber-300', label: 'Prenotato' },
                        { color: 'bg-green-100 border-green-300', label: 'Completato' },
                      ].map(l => (
                        <div key={l.label} className="flex items-center gap-1.5">
                          <div className={`w-3.5 h-3.5 rounded border ${l.color}`} />
                          <span className="text-xs text-gray-500">{l.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Week navigation */}
                  <div className="px-5 pb-3 flex items-center justify-between">
                    <button onClick={() => navigateWeek(-1)} className="p-1.5 rounded-xl hover:bg-white border border-gray-200 transition-colors">
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <p className="text-sm font-medium text-gray-700">
                      {weekDates[0].toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} – {weekDates[6].toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <button onClick={() => navigateWeek(1)} className="p-1.5 rounded-xl hover:bg-white border border-gray-200 transition-colors">
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  {/* Calendar grid */}
                  <div className="px-5 pb-5">
                    {slotsLoading ? (
                      <div className="flex items-center justify-center py-10">
                        <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl border border-gray-100 overflow-auto">
                        <div className="min-w-[680px]">
                          {/* Header giorni */}
                          <div className="grid grid-cols-8 border-b border-gray-100">
                            <div className="p-2 bg-gray-50" />
                            {weekDates.map(d => (
                              <div key={dateKey(d)} className={`p-2 text-center border-l border-gray-100 ${dateKey(d) === today ? 'bg-blue-50' : 'bg-gray-50'}`}>
                                <p className="text-[10px] font-semibold text-gray-500 uppercase">{d.toLocaleDateString('it-IT', { weekday: 'short' })}</p>
                                <p className={`text-sm font-bold mt-0.5 ${dateKey(d) === today ? 'text-blue-600' : 'text-gray-800'}`}>{d.getDate()}</p>
                              </div>
                            ))}
                          </div>

                          {/* Righe orarie */}
                          {HOURS.map(hour => (
                            <div key={hour} className="grid grid-cols-8 border-b border-gray-50 last:border-b-0">
                              <div className="py-1 px-2 text-[10px] text-gray-400 font-medium text-right bg-gray-50/60 flex items-center justify-end">{hour}</div>
                              {weekDates.map(d => {
                                const dateStr = dateKey(d)
                                const slot = getSlotForCell(dateStr, hour)
                                const endH = `${String(parseInt(hour) + 1).padStart(2, '0')}:00:00`
                                const past = isSlotPast(dateStr, endH)
                                const isSelected = selectedSlot?.id === slot?.id
                                return (
                                  <div key={dateStr} className="border-l border-gray-100 p-0.5">
                                    <button
                                      onClick={() => handleCellClick(slot, dateStr, hour)}
                                      disabled={!slot}
                                      className={`w-full h-9 rounded-lg border text-center flex items-center justify-center transition-all
                                        ${slot ? cellStyle(slot, past) : 'bg-transparent border-transparent cursor-default'}
                                        ${isSelected ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}>
                                      {cellIcon(slot)}
                                    </button>
                                  </div>
                                )
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pannello dettaglio slot selezionato */}
                    {selectedSlot && (
                      <div className="mt-3 bg-white border border-gray-200 rounded-2xl p-4 flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg
                          ${selectedSlot.status === 'prenotato' ? 'bg-amber-100' : 'bg-green-100'}`}>
                          {selectedSlot.status === 'prenotato' ? '📅' : '✓'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900">
                            {new Date(selectedSlot.date + 'T00:00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
                            {' · '}{formatTime(selectedSlot.start_time)} – {formatTime(selectedSlot.end_time)}
                            {selectedSlot.booking?.isSecondSlot && (
                              <span className="ml-2 text-xs font-normal bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">2ª ora presenza</span>
                            )}
                          </p>
                          {selectedSlot.booking && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              Studente: <span className="font-medium">{selectedSlot.booking.student?.first_name} {selectedSlot.booking.student?.last_name}</span>
                              {' · '}{selectedSlot.booking.subject?.name}
                              {' · '}{selectedSlot.booking.grade}
                              {' · '}{selectedSlot.booking.mode === 'online' ? '📺 Online' : '📍 Presenza'}
                            </p>
                          )}
                          {selectedSlot.booking?.topic && (
                            <p className="text-xs text-gray-400 mt-0.5">Argomento: {selectedSlot.booking.topic}</p>
                          )}
                          {selectedSlot.booking?.isSecondSlot && (
                            <p className="text-xs text-amber-600 mt-1">Slot aggiuntivo — per cancellare seleziona la 1ª ora della lezione</p>
                          )}
                          <p className={`text-xs mt-1 font-medium ${selectedSlot.status === 'prenotato' ? 'text-amber-700' : 'text-green-700'}`}>
                            {selectedSlot.status === 'prenotato' ? 'Prenotato' : 'Completato'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {/* Cancella solo dal primo slot, non dal secondo */}
                          {selectedSlot.booking && !selectedSlot.booking.isSecondSlot && selectedSlot.status === 'prenotato' && (
                            <button
                              onClick={() => deleteBookingAdmin(selectedSlot)}
                              className="flex items-center gap-1.5 text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-xl font-medium hover:bg-red-100 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" /> Cancella prenotazione
                            </button>
                          )}
                          {selectedSlot.booking && !selectedSlot.booking.isSecondSlot && selectedSlot.status === 'prenotato' && isSlotPast(selectedSlot.date, selectedSlot.end_time) && (
                            <button
                              onClick={() => changeBookingStatus(selectedSlot, 'completato')}
                              className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-xl font-medium hover:bg-green-100 transition-colors">
                              <RotateCcw className="w-3.5 h-3.5" /> Segna completata
                            </button>
                          )}
                          {selectedSlot.status === 'completato' && !selectedSlot.booking?.isSecondSlot && (
                            <button
                              onClick={() => changeBookingStatus(selectedSlot, 'confermato')}
                              className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-xl font-medium hover:bg-amber-100 transition-colors">
                              <RotateCcw className="w-3.5 h-3.5" /> Ripristina
                            </button>
                          )}
                          <button onClick={() => setSelectedSlot(null)} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors ml-1">
                            <X className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal modifica tutor */}
      {editModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold mb-6">Modifica tutor</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Nome" value={editForm.first_name} onChange={e => setEditForm(f => ({ ...f, first_name: e.target.value }))} />
                <Input label="Cognome" value={editForm.last_name} onChange={e => setEditForm(f => ({ ...f, last_name: e.target.value }))} />
              </div>
              <Input label="Telefono" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Bio</label>
                <textarea value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} rows={3}
                  className="border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-gray-900 resize-none" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-2xl border border-gray-200">
                <input type="checkbox" checked={editForm.is_active} onChange={e => setEditForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-black" />
                <span className="text-sm font-medium">Tutor attivo (visibile agli studenti)</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditModal(null)} className="flex-1 border border-gray-200 text-gray-700 font-medium py-3 rounded-2xl hover:bg-gray-50 transition-colors">Annulla</button>
              <button onClick={saveEdit} className="flex-1 bg-black text-white font-semibold py-3 rounded-2xl hover:bg-gray-800 transition-colors">Salva</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
