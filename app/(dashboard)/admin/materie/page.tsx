'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Edit, Tag } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import type { Subject } from '@/types/database'

export default function AdminMateriePage() {
  const supabase = createClient()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [newName, setNewName] = useState('')
  const [editItem, setEditItem] = useState<Subject | null>(null)
  const [editName, setEditName] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  useEffect(() => { loadSubjects() }, [])

  async function loadSubjects() {
    const { data } = await supabase.from('subjects').select('*').order('name')
    setSubjects(data || [])
    setLoading(false)
  }

  async function addSubject() {
    if (!newName.trim()) return
    setAdding(true)
    await supabase.from('subjects').insert({ name: newName.trim() })
    setNewName('')
    setAdding(false)
    loadSubjects()
  }

  async function saveEdit() {
    if (!editItem || !editName.trim()) return
    await supabase.from('subjects').update({ name: editName.trim() }).eq('id', editItem.id)
    setEditItem(null)
    loadSubjects()
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('subjects').update({ active: !current }).eq('id', id)
    loadSubjects()
  }

  async function deleteSubject(id: string) {
    if (!confirm('Eliminare questa materia? I tutor che la insegnano la perderanno dal profilo.')) return
    await supabase.from('subjects').delete().eq('id', id)
    loadSubjects()
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black">Gestione Materie</h1>
        <p className="text-gray-500 mt-1">{subjects.filter(s => s.active).length} materie attive, {subjects.filter(s => !s.active).length} disattivate</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6">
        <h2 className="font-bold mb-4">Aggiungi nuova materia</h2>
        <div className="flex gap-3">
          <Input placeholder="Nome materia (es. Trigonometria)" value={newName} onChange={e => setNewName(e.target.value)}
            className="flex-1" icon={<Tag className="w-4 h-4" />}
            onKeyDown={e => { if (e.key === 'Enter') addSubject() }}
          />
          <Button loading={adding} onClick={addSubject} disabled={!newName.trim()}>
            <Plus className="w-4 h-4" /> Aggiungi
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-5">
          {subjects.map(subject => (
            <div key={subject.id} className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${subject.active ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
              {editItem?.id === subject.id ? (
                <div className="flex-1 flex gap-2">
                  <input value={editName} onChange={e => setEditName(e.target.value)} autoFocus
                    className="flex-1 text-sm border border-gray-300 rounded-lg px-2 py-1 outline-none focus:border-gray-900"
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditItem(null) }}
                  />
                  <button onClick={saveEdit} className="text-green-600 text-xs font-semibold">Salva</button>
                </div>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium text-gray-700 truncate">{subject.name}</span>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => { setEditItem(subject); setEditName(subject.name) }}
                      className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => toggleActive(subject.id, subject.active)}
                      className={`p-1 rounded transition-colors text-xs font-bold ${subject.active ? 'hover:bg-yellow-50 text-yellow-600' : 'hover:bg-green-50 text-green-600'}`}
                      title={subject.active ? 'Disattiva' : 'Attiva'}>
                      {subject.active ? '●' : '○'}
                    </button>
                    <button onClick={() => deleteSubject(subject.id)}
                      className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
