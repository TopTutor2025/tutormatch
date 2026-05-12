'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star, Trash2, Edit2, Plus, X, Search, Check, ChevronDown } from 'lucide-react'
import Button from '@/components/ui/Button'

type TutorOption = { id: string; first_name: string; last_name: string; avatar_url: string | null }
type StudentOption = { id: string; first_name: string; last_name: string }
type Review = {
  id: string
  student_id: string
  tutor_id: string
  rating: number
  comment: string | null
  created_at: string
  student: { first_name: string; last_name: string } | null
}

const EMPTY_FORM = { student_id: '', rating: 5, comment: '' }

function Stars({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button"
          onClick={() => onChange?.(n)}
          className={`transition-colors ${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}>
          <Star className={`w-5 h-5 ${n <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
        </button>
      ))}
    </div>
  )
}

export default function AdminRecensioniTutorPage() {
  const supabase = createClient()

  const [tutors, setTutors] = useState<TutorOption[]>([])
  const [students, setStudents] = useState<StudentOption[]>([])
  const [selectedTutor, setSelectedTutor] = useState<TutorOption | null>(null)
  const [tutorSearch, setTutorSearch] = useState('')
  const [tutorDropdown, setTutorDropdown] = useState(false)

  const [reviews, setReviews] = useState<Review[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)

  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ rating: 5, comment: '' })

  useEffect(() => { loadTutors(); loadStudents() }, [])

  async function loadTutors() {
    const { data: profiles } = await supabase
      .from('profiles').select('id, first_name, last_name, avatar_url').eq('role', 'tutor').order('first_name')
    setTutors(profiles || [])
  }

  async function loadStudents() {
    const { data } = await supabase
      .from('profiles').select('id, first_name, last_name').eq('role', 'studente').order('first_name')
    setStudents(data || [])
  }

  async function selectTutor(tutor: TutorOption) {
    setSelectedTutor(tutor)
    setTutorDropdown(false)
    setTutorSearch(`${tutor.first_name} ${tutor.last_name}`)
    setShowAddForm(false)
    setEditingId(null)
    await loadReviews(tutor.id)
  }

  async function loadReviews(tutorId: string) {
    setLoadingReviews(true)
    const { data } = await supabase
      .from('reviews')
      .select('*, student:profiles!reviews_student_id_fkey(first_name, last_name)')
      .eq('tutor_id', tutorId)
      .order('created_at', { ascending: false })
    setReviews(data || [])
    setLoadingReviews(false)
  }

  async function addReview() {
    if (!selectedTutor) return
    if (!form.student_id) { setFormError('Seleziona uno studente.'); return }
    if (!form.comment.trim()) { setFormError('Scrivi un commento.'); return }
    setSaving(true); setFormError('')
    const { error } = await supabase.from('reviews').insert({
      tutor_id: selectedTutor.id,
      student_id: form.student_id,
      rating: form.rating,
      comment: form.comment.trim(),
      // booking_id: null (admin-created)
    })
    if (error) { setFormError(error.message); setSaving(false); return }
    setForm(EMPTY_FORM)
    setShowAddForm(false)
    setSaving(false)
    await loadReviews(selectedTutor.id)
  }

  async function saveEdit(reviewId: string) {
    await supabase.from('reviews').update({
      rating: editForm.rating,
      comment: editForm.comment.trim() || null,
    }).eq('id', reviewId)
    setEditingId(null)
    if (selectedTutor) await loadReviews(selectedTutor.id)
  }

  async function deleteReview(reviewId: string) {
    if (!confirm('Eliminare questa recensione?')) return
    await supabase.from('reviews').delete().eq('id', reviewId)
    setReviews(prev => prev.filter(r => r.id !== reviewId))
  }

  const filteredTutors = tutors.filter(t =>
    `${t.first_name} ${t.last_name}`.toLowerCase().includes(tutorSearch.toLowerCase())
  )

  const avgRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-black">Recensioni tutor</h1>
        <p className="text-gray-500 mt-1">Visualizza, aggiungi, modifica ed elimina le recensioni dei tutor</p>
      </div>

      {/* Selettore tutor */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">Seleziona tutor</label>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca tutor per nome..."
              value={tutorSearch}
              onChange={e => { setTutorSearch(e.target.value); setTutorDropdown(true) }}
              onFocus={() => setTutorDropdown(true)}
              className="w-full border border-gray-200 rounded-2xl pl-11 pr-10 py-3 text-sm outline-none focus:border-gray-900 transition-all"
            />
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          {tutorDropdown && filteredTutors.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg z-20 max-h-56 overflow-y-auto">
              {filteredTutors.map(t => (
                <button key={t.id} onClick={() => selectTutor(t)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left first:rounded-t-2xl last:rounded-b-2xl">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                    {t.first_name[0]}{t.last_name[0]}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{t.first_name} {t.last_name}</span>
                  {selectedTutor?.id === t.id && <Check className="w-4 h-4 text-green-500 ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sezione recensioni tutor selezionato */}
      {selectedTutor && (
        <>
          {/* Header tutor selezionato */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center font-bold text-gray-600 text-sm">
                {selectedTutor.first_name[0]}{selectedTutor.last_name[0]}
              </div>
              <div>
                <p className="font-bold text-gray-900">{selectedTutor.first_name} {selectedTutor.last_name}</p>
                <p className="text-xs text-gray-500">
                  {reviews.length} {reviews.length === 1 ? 'recensione' : 'recensioni'}
                  {avgRating && <span className="ml-2">· Media <span className="font-semibold text-yellow-600">{avgRating} ★</span></span>}
                </p>
              </div>
            </div>
            <Button onClick={() => { setShowAddForm(true); setForm(EMPTY_FORM); setFormError('') }}>
              <Plus className="w-4 h-4" /> Aggiungi recensione
            </Button>
          </div>

          {/* Form aggiunta */}
          {showAddForm && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-gray-900">Nuova recensione per {selectedTutor.first_name}</h3>
                <button onClick={() => setShowAddForm(false)} className="p-1.5 rounded-xl hover:bg-gray-100">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Seleziona studente */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Studente autore</label>
                <select value={form.student_id} onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-gray-900 bg-white">
                  <option value="">Seleziona uno studente...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                  ))}
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Valutazione</label>
                <Stars value={form.rating} onChange={n => setForm(f => ({ ...f, rating: n }))} />
              </div>

              {/* Commento */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Commento</label>
                <textarea rows={3} placeholder="Scrivi la recensione..."
                  value={form.comment}
                  onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-gray-900 resize-none" />
              </div>

              {formError && <p className="text-sm text-red-500">{formError}</p>}

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Annulla</Button>
                <Button loading={saving} onClick={addReview}>Salva recensione</Button>
              </div>
            </div>
          )}

          {/* Lista recensioni */}
          {loadingReviews ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <Star className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="font-medium text-gray-500">Nessuna recensione</p>
              <p className="text-sm text-gray-400 mt-1">Aggiungi la prima recensione per questo tutor</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map(review => (
                <div key={review.id} className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
                  {editingId === review.id ? (
                    /* Modalità modifica */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm text-gray-900">
                          {review.student?.first_name} {review.student?.last_name}
                        </p>
                        <button onClick={() => setEditingId(null)} className="p-1.5 rounded-xl hover:bg-gray-100">
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1.5 block">Valutazione</label>
                        <Stars value={editForm.rating} onChange={n => setEditForm(f => ({ ...f, rating: n }))} />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1.5 block">Commento</label>
                        <textarea rows={3} value={editForm.comment}
                          onChange={e => setEditForm(f => ({ ...f, comment: e.target.value }))}
                          className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-gray-900 resize-none" />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setEditingId(null)}>Annulla</Button>
                        <Button onClick={() => saveEdit(review.id)}>Salva modifiche</Button>
                      </div>
                    </div>
                  ) : (
                    /* Modalità visualizzazione */
                    <div className="flex gap-4">
                      <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {review.student?.first_name?.[0]}{review.student?.last_name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-sm text-gray-900">
                              {review.student?.first_name} {review.student?.last_name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Stars value={review.rating} />
                              <span className="text-xs text-gray-400">
                                {new Date(review.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => { setEditingId(review.id); setEditForm({ rating: review.rating, comment: review.comment || '' }) }}
                              className="p-2 rounded-xl hover:bg-gray-100 transition-colors" title="Modifica">
                              <Edit2 className="w-4 h-4 text-gray-400" />
                            </button>
                            <button onClick={() => deleteReview(review.id)}
                              className="p-2 rounded-xl hover:bg-red-50 transition-colors" title="Elimina">
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-600 mt-2 leading-relaxed">"{review.comment}"</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
