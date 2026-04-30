'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, ChevronDown, ChevronUp, Plus, Minus, ToggleLeft, ToggleRight, Edit, Trash2 } from 'lucide-react'
import { formatDate, formatTime, formatCurrency, GRADE_LABELS } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function AdminStudentiPage() {
  const supabase = createClient()
  const [students, setStudents] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [editModal, setEditModal] = useState<any>(null)
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', phone: '' })
  const [hoursModal, setHoursModal] = useState<any>(null)
  const [hoursForm, setHoursForm] = useState({ grade: 'medie', hours: 1, action: 'add' })
  const [subModal, setSubModal] = useState<any>(null)
  const [subForm, setSubForm] = useState({ type: 'mensile' })
  const [pricing, setPricing] = useState<any>(null)
  const [studentBookingsMap, setStudentBookingsMap] = useState<Record<string, any[]>>({})

  useEffect(() => {
    loadStudents()
    supabase.from('pricing_config').select('*').single().then(({ data }) => setPricing(data))
  }, [])

  async function loadStudents() {
    const { data: profiles } = await supabase
      .from('profiles').select('*').eq('role', 'studente').order('created_at', { ascending: false })
    if (!profiles?.length) { setStudents([]); setLoading(false); return }
    const ids = profiles.map(p => p.id)
    const [{ data: sps }, { data: subs }, { data: bks }] = await Promise.all([
      supabase.from('student_profiles').select('*').in('id', ids),
      supabase.from('subscriptions').select('*').in('student_id', ids),
      supabase.from('bookings').select('id, student_id').in('student_id', ids),
    ])
    const spMap = Object.fromEntries((sps || []).map(sp => [sp.id, sp]))
    const subMap: Record<string, any[]> = {}
    const bkMap: Record<string, any[]> = {};
    (subs || []).forEach(s => { subMap[s.student_id] = [...(subMap[s.student_id] || []), s] });
    (bks || []).forEach(b => { bkMap[b.student_id] = [...(bkMap[b.student_id] || []), b] })
    setStudents(profiles.map(p => ({
      ...p,
      student_profile: spMap[p.id] || null,
      subscriptions: subMap[p.id] || [],
      bookings: bkMap[p.id] || [],
    })))
    setLoading(false)
  }

  async function expandStudent(studentId: string) {
    if (expanded === studentId) { setExpanded(null); return }
    setExpanded(studentId)
    if (studentBookingsMap[studentId] !== undefined) return
    const { data: bks } = await supabase.from('bookings').select('*').eq('student_id', studentId).order('created_at', { ascending: false })
    if (!bks?.length) { setStudentBookingsMap(m => ({ ...m, [studentId]: [] })); return }
    const tutorIds = [...new Set(bks.map((b: any) => b.tutor_id))]
    const slotIds = [...new Set([...bks.map((b: any) => b.slot_id), ...bks.map((b: any) => b.second_slot_id).filter(Boolean)])]
    const subjectIds = [...new Set(bks.map((b: any) => b.subject_id))]
    const [{ data: tutors }, { data: slots }, { data: subjects }] = await Promise.all([
      supabase.from('profiles').select('id, first_name, last_name').in('id', tutorIds),
      supabase.from('calendar_slots').select('*').in('id', slotIds),
      supabase.from('subjects').select('*').in('id', subjectIds),
    ])
    const tutorMap = Object.fromEntries((tutors || []).map((p: any) => [p.id, p]))
    const slotMap = Object.fromEntries((slots || []).map((s: any) => [s.id, s]))
    const subjectMap = Object.fromEntries((subjects || []).map((s: any) => [s.id, s]))
    setStudentBookingsMap(m => ({ ...m, [studentId]: bks.map((b: any) => ({
      ...b,
      tutor: tutorMap[b.tutor_id] || null,
      slot: slotMap[b.slot_id] || null,
      second_slot: b.second_slot_id ? (slotMap[b.second_slot_id] || null) : null,
      subject: subjectMap[b.subject_id] || null,
    })) }))
  }

  async function saveEdit() {
    await supabase.from('profiles').update({ first_name: editForm.first_name, last_name: editForm.last_name, phone: editForm.phone }).eq('id', editModal.id)
    setEditModal(null)
    loadStudents()
  }

  async function updateHours() {
    if (!hoursModal) return
    const field = hoursForm.grade === 'medie' ? 'hour_credits_medie' : hoursForm.grade === 'superiori' ? 'hour_credits_superiori' : 'hour_credits_universita'
    const sp = hoursModal.student_profile
    const current = sp?.[field] || 0
    const newVal = hoursForm.action === 'add' ? current + hoursForm.hours : Math.max(0, current - hoursForm.hours)
    await supabase.from('student_profiles').update({ [field]: newVal }).eq('id', hoursModal.id)
    setHoursModal(null)
    loadStudents()
  }

  async function toggleSubscription(studentId: string, subId: string, currentStatus: string) {
    const newStatus = currentStatus === 'attivo' ? 'cancellato' : 'attivo'
    await supabase.from('subscriptions').update({ status: newStatus }).eq('id', subId)
    loadStudents()
  }

  async function deleteUser(userId: string, name: string) {
    if (!confirm(`Eliminare definitivamente l'account di ${name}?\n\nQuesta azione è irreversibile e cancella tutti i dati associati (prenotazioni, ore, abbonamenti).`)) return
    const res = await fetch('/api/admin/delete-user', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    if (res.ok) {
      setStudents(prev => prev.filter(s => s.id !== userId))
    } else {
      const { error } = await res.json()
      alert(`Errore: ${error}`)
    }
  }

  async function createSubscription() {
    if (!subModal || !pricing) return
    const isAnnual = subForm.type === 'annuale'
    const price = isAnnual ? pricing.subscription_annual : pricing.subscription_monthly
    const startsAt = new Date()
    const expiresAt = new Date(startsAt)
    if (isAnnual) expiresAt.setFullYear(expiresAt.getFullYear() + 1)
    else expiresAt.setMonth(expiresAt.getMonth() + 1)
    await supabase.from('subscriptions').insert({
      student_id: subModal.id,
      type: subForm.type,
      status: 'attivo',
      price,
      starts_at: startsAt.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    setSubModal(null)
    loadStudents()
  }

  const filtered = students.filter(s =>
    `${s.first_name} ${s.last_name} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Studenti</h1>
          <p className="text-gray-500 mt-1">{filtered.length} studenti registrati</p>
        </div>
      </div>

      <Input placeholder="Cerca per nome o email..." value={search} onChange={e => setSearch(e.target.value)} icon={<Search className="w-4 h-4" />} />

      <div className="space-y-3">
        {filtered.map(student => {
          const activeSub = student.subscriptions?.find((s: any) => s.status === 'attivo')
          const sp = student.student_profile
          const isExpanded = expanded === student.id
          return (
            <div key={student.id} className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
              <div className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center font-bold text-blue-700 text-sm flex-shrink-0">
                  {student.first_name?.[0]}{student.last_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{student.first_name} {student.last_name}</p>
                  <p className="text-sm text-gray-500 truncate">{student.email} · {student.phone || 'N/A'}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {activeSub ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                      {activeSub.type === 'mensile' ? 'Mensile' : 'Annuale'}
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">No abbonamento</span>
                  )}
                  <button onClick={() => { setEditModal(student); setEditForm({ first_name: student.first_name, last_name: student.last_name, phone: student.phone || '' }) }}
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                    <Edit className="w-4 h-4 text-gray-500" />
                  </button>
                  <button onClick={() => deleteUser(student.id, `${student.first_name} ${student.last_name}`)}
                    className="p-2 rounded-xl hover:bg-red-50 transition-colors" title="Elimina account">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                  <button onClick={() => expandStudent(student.id)}
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-5">
                  {/* Ore lezione */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold text-sm">Ore lezione</p>
                      <Button size="sm" variant="outline" onClick={() => setHoursModal(student)}>
                        Gestisci ore
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Medie', field: 'hour_credits_medie' },
                        { label: 'Superiori', field: 'hour_credits_superiori' },
                        { label: 'Università', field: 'hour_credits_universita' },
                      ].map(item => (
                        <div key={item.field} className="bg-white rounded-xl p-3 text-center border border-gray-200">
                          <p className="text-xl font-bold">{sp?.[item.field] || 0}h</p>
                          <p className="text-xs text-gray-500">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Abbonamenti */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold text-sm">Abbonamenti</p>
                      <Button size="sm" variant="outline" onClick={() => { setSubModal(student); setSubForm({ type: 'mensile' }) }}>
                        + Crea abbonamento
                      </Button>
                    </div>
                    {!student.subscriptions?.length ? (
                      <p className="text-sm text-gray-400">Nessun abbonamento</p>
                    ) : (
                      <div className="space-y-2">
                        {student.subscriptions?.map((sub: any) => (
                          <div key={sub.id} className="flex items-center justify-between bg-white rounded-xl p-3 border border-gray-200">
                            <div>
                              <p className="text-sm font-medium capitalize">{sub.type} · {formatCurrency(sub.price)}</p>
                              <p className="text-xs text-gray-400">{formatDate(sub.starts_at)} – {formatDate(sub.expires_at)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sub.status === 'attivo' ? 'bg-green-100 text-green-700' : sub.status === 'scaduto' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                                {sub.status}
                              </span>
                              {sub.status === 'attivo' ? (
                                <button onClick={() => toggleSubscription(student.id, sub.id, sub.status)}
                                  className="text-xs text-red-500 hover:text-red-700 font-medium">
                                  Disattiva
                                </button>
                              ) : (
                                <button onClick={() => toggleSubscription(student.id, sub.id, sub.status)}
                                  className="text-xs text-green-600 hover:text-green-800 font-medium">
                                  Riattiva
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Prenotazioni */}
                  <div>
                    <p className="font-semibold text-sm mb-3">Prenotazioni ({student.bookings?.length || 0} totali)</p>
                    {studentBookingsMap[student.id] === undefined ? (
                      <p className="text-sm text-gray-400">Caricamento...</p>
                    ) : studentBookingsMap[student.id].length === 0 ? (
                      <p className="text-sm text-gray-400">Nessuna prenotazione</p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {studentBookingsMap[student.id].map((b: any) => (
                          <div key={b.id} className="bg-white rounded-xl p-3 border border-gray-200 text-sm">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium">{b.subject?.name || '—'} · {GRADE_LABELS[b.grade] || b.grade}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                                b.status === 'completato' ? 'bg-green-100 text-green-700' :
                                b.status === 'cancellato' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>{b.status}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Tutor: {b.tutor?.first_name} {b.tutor?.last_name?.[0]}.
                              {b.slot ? ` · ${formatDate(b.slot.date)} ${formatTime(b.slot.start_time)}–${formatTime(b.second_slot?.end_time ?? b.slot.end_time)}` : ''}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">Argomento: {b.topic}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-3">Iscritto il {formatDate(student.created_at)}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Edit modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold mb-6">Modifica studente</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Nome" value={editForm.first_name} onChange={e => setEditForm(f => ({ ...f, first_name: e.target.value }))} />
                <Input label="Cognome" value={editForm.last_name} onChange={e => setEditForm(f => ({ ...f, last_name: e.target.value }))} />
              </div>
              <Input label="Telefono" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-500">Email: {editModal.email} (non modificabile)</div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditModal(null)} className="flex-1 border border-gray-200 text-gray-700 font-medium py-3 rounded-2xl hover:bg-gray-50 transition-colors">Annulla</button>
              <button onClick={saveEdit} className="flex-1 bg-black text-white font-semibold py-3 rounded-2xl hover:bg-gray-800 transition-colors">Salva</button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription modal */}
      {subModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold mb-1">Crea abbonamento</h3>
            <p className="text-sm text-gray-500 mb-6">{subModal.first_name} {subModal.last_name}</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Tipo abbonamento</label>
                <div className="flex gap-3">
                  {[
                    { value: 'mensile', label: 'Mensile', price: pricing?.subscription_monthly },
                    { value: 'annuale', label: 'Annuale', price: pricing?.subscription_annual },
                  ].map(opt => (
                    <button key={opt.value} onClick={() => setSubForm({ type: opt.value })}
                      className={`flex-1 py-3 px-4 rounded-2xl border-2 text-sm font-medium transition-all ${subForm.type === opt.value ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-700 hover:border-gray-400'}`}>
                      <p>{opt.label}</p>
                      <p className={`text-xs mt-0.5 ${subForm.type === opt.value ? 'text-white/70' : 'text-gray-400'}`}>{opt.price ? formatCurrency(opt.price) : '—'}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-500">
                Scadenza: {subForm.type === 'mensile' ? '1 mese dalla data odierna' : '1 anno dalla data odierna'}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setSubModal(null)} className="flex-1 border border-gray-200 text-gray-700 font-medium py-3 rounded-2xl hover:bg-gray-50 transition-colors">Annulla</button>
              <button onClick={createSubscription} className="flex-1 bg-black text-white font-semibold py-3 rounded-2xl hover:bg-gray-800 transition-colors">Crea abbonamento</button>
            </div>
          </div>
        </div>
      )}

      {/* Hours modal */}
      {hoursModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold mb-2">Gestisci ore lezione</h3>
            <p className="text-sm text-gray-500 mb-6">{hoursModal.first_name} {hoursModal.last_name}</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Grado scolastico</label>
                <select value={hoursForm.grade} onChange={e => setHoursForm(f => ({ ...f, grade: e.target.value }))}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none">
                  <option value="medie">Scuola Media</option>
                  <option value="superiori">Scuola Superiore</option>
                  <option value="universita">Università</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Azione</label>
                <div className="flex gap-2">
                  {[{ value: 'add', label: '+ Aggiungi' }, { value: 'remove', label: '- Rimuovi' }].map(a => (
                    <button key={a.value} onClick={() => setHoursForm(f => ({ ...f, action: a.value }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${hoursForm.action === a.value ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-700'}`}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setHoursForm(f => ({ ...f, hours: Math.max(1, f.hours - 1) }))} className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center font-bold text-lg hover:bg-gray-100">−</button>
                <span className="flex-1 text-center text-2xl font-bold">{hoursForm.hours}h</span>
                <button onClick={() => setHoursForm(f => ({ ...f, hours: f.hours + 1 }))} className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center font-bold text-lg hover:bg-gray-100">+</button>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setHoursModal(null)} className="flex-1 border border-gray-200 text-gray-700 font-medium py-3 rounded-2xl hover:bg-gray-50 transition-colors">Annulla</button>
              <button onClick={updateHours} className="flex-1 bg-black text-white font-semibold py-3 rounded-2xl hover:bg-gray-800 transition-colors">Conferma</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
