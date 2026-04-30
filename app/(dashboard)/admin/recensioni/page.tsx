'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star, Trash2, Eye, EyeOff, Plus, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

type Review = {
  id: string
  author_name: string
  author_role: string
  rating: number
  comment: string
  visible: boolean
  created_at: string
}

const EMPTY_FORM = { author_name: '', author_role: '', rating: 5, comment: '' }

export default function AdminRecensioniPage() {
  const supabase = createClient()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('landing_reviews')
      .select('*')
      .order('created_at', { ascending: false })
    setReviews(data || [])
    setLoading(false)
  }

  async function addReview() {
    if (!form.author_name.trim() || !form.author_role.trim() || !form.comment.trim()) {
      setError('Compila tutti i campi.'); return
    }
    setSaving(true); setError('')
    const { error: err } = await supabase.from('landing_reviews').insert({
      author_name: form.author_name.trim(),
      author_role: form.author_role.trim(),
      rating: form.rating,
      comment: form.comment.trim(),
      visible: true,
    })
    if (err) { setError(err.message); setSaving(false); return }
    setForm(EMPTY_FORM)
    setShowForm(false)
    setSaving(false)
    load()
  }

  async function toggleVisible(review: Review) {
    await supabase.from('landing_reviews').update({ visible: !review.visible }).eq('id', review.id)
    setReviews(prev => prev.map(r => r.id === review.id ? { ...r, visible: !r.visible } : r))
  }

  async function deleteReview(id: string) {
    if (!confirm('Eliminare questa recensione?')) return
    await supabase.from('landing_reviews').delete().eq('id', id)
    setReviews(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Recensioni landing page</h1>
          <p className="text-gray-500 mt-1">Gestisci le recensioni mostrate nella homepage pubblica</p>
        </div>
        <Button onClick={() => { setShowForm(true); setError('') }}>
          <Plus className="w-4 h-4" /> Aggiungi
        </Button>
      </div>

      {/* Form aggiunta */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Nuova recensione</h2>
            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-xl hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nome autore" placeholder="es. Marco R."
                value={form.author_name} onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))} />
              <Input label="Ruolo" placeholder="es. Studente · Scuola Superiore"
                value={form.author_role} onChange={e => setForm(f => ({ ...f, author_role: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Valutazione</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setForm(f => ({ ...f, rating: n }))}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${form.rating >= n ? 'bg-yellow-400 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                ))}
                <span className="ml-2 self-center text-sm text-gray-500">{form.rating}/5</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Recensione</label>
              <textarea rows={3} placeholder="Testo della recensione..."
                value={form.comment}
                onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>Annulla</Button>
              <Button loading={saving} onClick={addReview}>Salva recensione</Button>
            </div>
          </div>
        </div>
      )}

      {/* Lista recensioni */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-500">Nessuna recensione</p>
          <p className="text-sm text-gray-400 mt-1">Aggiungi la prima recensione da mostrare in homepage</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(review => (
            <div key={review.id}
              className={`bg-white rounded-2xl border p-5 flex gap-4 transition-opacity ${review.visible ? 'border-gray-100' : 'border-gray-100 opacity-50'}`}>
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                {review.author_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{review.author_name}</p>
                    <p className="text-xs text-gray-400">{review.author_role}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Stelle */}
                    <div className="flex gap-0.5 mr-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                      ))}
                    </div>
                    {/* Toggle visibilità */}
                    <button onClick={() => toggleVisible(review)} title={review.visible ? 'Nascondi' : 'Mostra'}
                      className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                      {review.visible
                        ? <Eye className="w-4 h-4 text-green-500" />
                        : <EyeOff className="w-4 h-4 text-gray-400" />}
                    </button>
                    {/* Elimina */}
                    <button onClick={() => deleteReview(review.id)} title="Elimina"
                      className="p-2 rounded-xl hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">"{review.comment}"</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${review.visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {review.visible ? 'Visibile in homepage' : 'Nascosta'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
