'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Phone, FileText, Upload, Save } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function TutorProfiloPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [tutorProfile, setTutorProfile] = useState<any>(null)
  const [subjects, setSubjects] = useState<any[]>([])
  const [allSubjects, setAllSubjects] = useState<any[]>([])
  const [grades, setGrades] = useState<string[]>([])
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', bio: '', address: '', city: '', lesson_mode: 'online' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [selectedGrades, setSelectedGrades] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: p }, { data: tp }, { data: ts }, { data: tg }, { data: as_ }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('tutor_profiles').select('*').eq('id', user.id).single(),
        supabase.from('tutor_subjects').select('subject_id').eq('tutor_id', user.id),
        supabase.from('tutor_grades').select('grade').eq('tutor_id', user.id),
        supabase.from('subjects').select('*').eq('active', true).order('name'),
      ])
      setProfile(p)
      setTutorProfile(tp)
      setAllSubjects(as_ || [])
      setSelectedSubjects((ts || []).map((s: any) => s.subject_id))
      setSelectedGrades((tg || []).map((g: any) => g.grade))
      setForm({
        first_name: p?.first_name || '',
        last_name: p?.last_name || '',
        phone: p?.phone || '',
        bio: tp?.bio || '',
        address: tp?.address || '',
        city: tp?.city || '',
        lesson_mode: tp?.lesson_mode || 'online',
      })
      if (p?.avatar_url) setAvatarPreview(p.avatar_url)
      setLoading(false)
    }
    load()
  }, [])

  async function save() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Geocode address for presenza lessons
    let latitude: number | null = tutorProfile?.latitude || null
    let longitude: number | null = tutorProfile?.longitude || null
    if (form.lesson_mode !== 'online' && form.address && form.city) {
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`${form.address}, ${form.city}, Italia`)}&format=json&limit=1`,
          { headers: { 'User-Agent': 'TutorMatch/1.0 (tutormatch.it)' } }
        )
        const geoData = await geoRes.json()
        if (geoData.length > 0) {
          latitude = parseFloat(geoData[0].lat)
          longitude = parseFloat(geoData[0].lon)
        } else {
          alert('Indirizzo non trovato su mappa. Controlla indirizzo e città e riprova.')
          setSaving(false)
          return
        }
      } catch {
        alert('Errore nella geocodifica dell\'indirizzo. Controlla la connessione e riprova.')
        setSaving(false)
        return
      }
    } else if (form.lesson_mode === 'online') {
      latitude = null
      longitude = null
    }

    let avatarUrl = profile?.avatar_url || null
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars').upload(`${user.id}.${ext}`, avatarFile, { upsert: true })
      if (uploadError) {
        alert(`Errore caricamento foto: ${uploadError.message}`)
        setSaving(false)
        return
      }
      if (uploadData) {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(uploadData.path)
        avatarUrl = publicUrl
      }
    }

    await Promise.all([
      supabase.from('profiles').update({ first_name: form.first_name, last_name: form.last_name, phone: form.phone, avatar_url: avatarUrl }).eq('id', user.id),
      supabase.from('tutor_profiles').update({ bio: form.bio, address: form.address, city: form.city, lesson_mode: form.lesson_mode, latitude, longitude }).eq('id', user.id),
    ])

    await supabase.from('tutor_subjects').delete().eq('tutor_id', user.id)
    if (selectedSubjects.length > 0) {
      await supabase.from('tutor_subjects').insert(selectedSubjects.map(sid => ({ tutor_id: user.id, subject_id: sid })))
    }
    await supabase.from('tutor_grades').delete().eq('tutor_id', user.id)
    if (selectedGrades.length > 0) {
      await supabase.from('tutor_grades').insert(selectedGrades.map(g => ({ tutor_id: user.id, grade: g })))
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-black">Il mio profilo</h1>
        <p className="text-gray-500 mt-1">Gestisci le tue informazioni (l'email non è modificabile)</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-8 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-500 font-bold text-xl">
                {form.first_name?.[0]}{form.last_name?.[0]}
              </div>
            )}
          </div>
          <div>
            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl inline-flex items-center gap-2 transition-colors">
              <Upload className="w-4 h-4" /> Cambia foto
              <input type="file" accept="image/*" onChange={e => {
                const f = e.target.files?.[0]
                if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)) }
              }} className="hidden" />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Nome" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} icon={<User className="w-4 h-4" />} />
          <Input label="Cognome" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
        </div>

        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
          <span className="text-sm text-gray-600">{profile?.email}</span>
          <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Email non modificabile</span>
        </div>

        <Input label="Telefono" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} icon={<Phone className="w-4 h-4" />} />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Bio</label>
          <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-gray-900 transition-all resize-none"
            placeholder="Descrivi la tua esperienza..."
          />
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Gradi scolastici</p>
          <div className="flex gap-3 flex-wrap">
            {[{ value: 'medie', label: 'Scuola Media' }, { value: 'superiori', label: 'Superiore' }, { value: 'universita', label: 'Università' }].map(g => (
              <button key={g.value} type="button" onClick={() => setSelectedGrades(prev => prev.includes(g.value) ? prev.filter(x => x !== g.value) : [...prev, g.value])}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${selectedGrades.includes(g.value) ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Materie insegnate</p>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {allSubjects.map(s => (
              <button key={s.id} type="button" onClick={() => setSelectedSubjects(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${selectedSubjects.includes(s.id) ? 'bg-pink-100 text-pink-800 border-pink-300' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Modalità di insegnamento</p>
          <div className="flex gap-3">
            {[{ value: 'online', label: 'Online' }, { value: 'presenza', label: 'In presenza' }, { value: 'entrambe', label: 'Entrambe' }].map(m => (
              <button key={m.value} onClick={() => setForm(f => ({ ...f, lesson_mode: m.value }))}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${form.lesson_mode === m.value ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {form.lesson_mode !== 'online' && (
          <div className="grid grid-cols-2 gap-4">
            <Input label="Indirizzo" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Via Roma 1" />
            <Input label="Città" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Milano" />
          </div>
        )}

        <Button loading={saving} onClick={save} className="w-full" size="lg">
          <Save className="w-4 h-4" /> {saved ? 'Salvato!' : 'Salva modifiche'}
        </Button>
      </div>
    </div>
  )
}
