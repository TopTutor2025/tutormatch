'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star, Trash2, Edit2, Plus, X, Search, Check, ChevronDown } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

type TutorOption = { id: string; first_name: string; last_name: string }
type Review = {
  id: string
  student_id: string | null
  author_name: string | null
  tutor_id: string
  rating: number
  comment: string | null
  created_at: string
  student: { first_name: string; last_name: string } | null
}

const EMPTY_FORM = { author_name: '', rating: 5, comment: '' }

function Stars({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange?.(n)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}>
          <Star className={`w-5 h-5 ${n <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
        </button>
      ))}
    </div>
  )
}

function reviewAuthor(r: Review): string {
  if (r.author_name) return r.author_name
  if (r.student) return `${r.student.first_name} ${r.student.last_name}`
  return 'Studente'
}

export default function AdminRecensioniTutorPage() {
  const supabase = createClient()

  const [tutors, setTutors] = useState<TutorOption[]>([])
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
  const [editForm, setEditForm] = useState({ author_name: '', rating: 5, comment: '' })

  useEffect(() => { loadTutors() }, [])

  async function loadTutors() {
    const { data } = await supabase
      .from('profiles').select('id, first_name, last_name').eq('role', 'tutor').order('first_name')
    setTutors(data || [])
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
    if (!form.author_name.trim()) { setFormError('Inserisci un nome per la recensione.'); return }
    if (!form.comment.trim()) { setFormError('Scrivi un commento.'); return }
    setSaving(true); setFormError('')
    const { error } = await supabase.from('reviews').insert({
      tutor_id: selectedTutor.id,
      student_id: null,
      author_name: form.author_name.trim(),
      rating: form.rating,
      comment: form.comment.trim(),
    })
    if (error) { setFormError(error.message); setSaving(false); return }
    setForm(EMPTY_FORM)
    setShowAddForm(false)
    setSaving(false)
    await loadReviews(selectedTutor.id)
  }

  async function startEdit(review: Review) {
    setEditingId(review.id)
    setEditForm({
      author_name: reviewAuthor(review),
      rating: review.rating,
      comment: review.comment || '',
    })
  }

  async function saveEdit(review: Review) {
    const update: any = {
      rating: editForm.rating,
      comment: editForm.comment.trim() || null,
    }
    // Se era una recensione admin (author_name) aggiorna il nome, altrimenti lascia student_id invariato
    if (review.author_name !== null || review.student_id === null) {
      update.author_name = editForm.author_name.trim() || null
    }
    await supabase.from('reviews').update(update).eq('id', review.id)
    setEditingId(null)
    if (selectedTutor) await loadReviews(selectedTutor.id)
  }

  async function deleteReview(id: string) {
    if (!confirm('Eliminare questa recensione?')) return
    await supabase.from('reviews').delete().eq('id', id)
    setReviews(prev => prev.filter(r => r.id !== id))
  }

  const filteredTutors = tutors.filter(t =>
    `${t.first_name} ${t.last_name}`.toLowerCase().includes(tutorSearch.toLowerCase())
  )

  const avgRating = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
          <input type="text" placeholder="Cerca tutor per nome..."
            value={tutorSearch}
            onChange={e => { setTutorSearch(e.target.value); setTutorDropdown(true) }}
            onFocus={() => setTutorDropdown(true)}
            className="w-full border border-gray-200 rounded-2xl pl-11 pr-10 py-3 text-sm outline-none focus:border-gray-900 transition-all"
          />
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          {tutorDropdown && filteredTutors.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg z-20 max-h-56 overflow-y-auto">
              {filteredTutors.map(t => (
                <button key={t.id} onClick={() => selectTutor(t)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left first:rounded-t-2xl last:rounded-b-2xl">
                  <div className="w-7 h-7 rounded-lg bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                    {t.first_name[0]}{t.last_name[0]}
                  </div>
                  <span className="text-sm font-medium">{t.first_name} {t.last_name}</span>
                  {selectedTutor?.id === t.id && <Check className="w-4 h-4 text-green-500 ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedTutor && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-sm">
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
              <Plus className="w-4 h-4" /> Aggiungi
            </Button>
          </div>

          {/* Form aggiunta */}
          {showAddForm && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Nuova recensione</h3>
                <button onClick={() => setShowAddForm(false)} className="p-1.5 rounded-xl hover:bg-gray-100">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <Input label="Nome autore (es. Marco R.)" placeholder="Nome che apparirà sulla recensione"
                value={form.author_name}
                onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))} />

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Valutazione</label>
                <Stars value={form.rating} onChange={n => setForm(f => ({ ...f, rating: n }))} />
              </div>

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
                <Button loading={saving} onClick={addReview}>Salva</Button>
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
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-700">Modifica recensione</p>
                        <button onClick={() => setEditingId(null)} className="p-1.5 rounded-xl hover:bg-gray-100">
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                      <Input label="Nome autore"
                        value={editForm.author_name}
                        onChange={e => setEditForm(f => ({ ...f, author_name: e.target.value }))} />
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
                        <Button onClick={() => saveEdit(review)}>Salva modifiche</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {reviewAuthor(review).split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm text-gray-900">{reviewAuthor(review)}</p>
                              {!review.student_id && (
                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">admin</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Stars value={review.rating} />
                              <span className="text-xs text-gray-400">
                                {new Date(review.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => startEdit(review)}
                              className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                              <Edit2 className="w-4 h-4 text-gray-400" />
                            </button>
                            <button onClick={() => deleteReview(review.id)}
                              className="p-2 rounded-xl hover:bg-red-50 transition-colors">
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
