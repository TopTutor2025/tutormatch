'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Mail, Phone, Save } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import type { Profile } from '@/types/database'

export default function ProfiloStudentePage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
      setForm({ first_name: data?.first_name || '', last_name: data?.last_name || '', phone: data?.phone || '' })
      setLoading(false)
    }
    load()
  }, [])

  async function save() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ first_name: form.first_name, last_name: form.last_name, phone: form.phone }).eq('id', user.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-black">Il mio profilo</h1>
        <p className="text-gray-500 mt-1">Gestisci le tue informazioni personali</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5 sm:p-8">
        <div className="flex items-center gap-3 sm:gap-4 mb-5 pb-5 sm:mb-8 sm:pb-8 border-b border-gray-100">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-700 font-bold text-lg sm:text-xl flex-shrink-0">
            {profile?.first_name?.[0]}{profile?.last_name?.[0]}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-base sm:text-lg truncate">{profile?.first_name} {profile?.last_name}</p>
            <p className="text-sm text-gray-500">Studente</p>
            <p className="text-xs text-gray-400 mt-0.5">Iscritto dal {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('it-IT') : ''}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nome" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} icon={<User className="w-4 h-4" />} />
            <Input label="Cognome" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-600 truncate">{profile?.email}</span>
              <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full flex-shrink-0 hidden sm:block">Non modificabile</span>
            </div>
          </div>
          <Input label="Telefono" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} icon={<Phone className="w-4 h-4" />} placeholder="+39 333 1234567" />

          <Button loading={saving} onClick={save} className="w-full" size="lg">
            <Save className="w-4 h-4" />
            {saved ? 'Salvato!' : 'Salva modifiche'}
          </Button>
        </div>
      </div>
    </div>
  )
}
