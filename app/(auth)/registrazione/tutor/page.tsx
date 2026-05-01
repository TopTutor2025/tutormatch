'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { User, Mail, Lock, Phone, CreditCard, Building, Eye, EyeOff, Upload } from 'lucide-react'
import type { Subject } from '@/types/database'

const GRADES = [
  { value: 'medie', label: 'Scuola Media' },
  { value: 'superiori', label: 'Scuola Superiore' },
  { value: 'universita', label: 'Università' },
]
const MODES = [
  { value: 'online', label: 'Solo Online' },
  { value: 'presenza', label: 'Solo In Presenza' },
  { value: 'entrambe', label: 'Online e In Presenza' },
]

export default function RegisterTutorPage() {
  const router = useRouter()
  const supabase = createClient()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    password: '', confirmPassword: '',
    fiscalCode: '', iban: '',
    address: '', city: '',
    bio: '',
    lessonMode: 'online',
  })
  const [selectedGrades, setSelectedGrades] = useState<string[]>([])
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [ibanConfirmed, setIbanConfirmed] = useState(false)
  const [terms, setTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)

  useEffect(() => {
    supabase.from('subjects').select('*').eq('active', true).order('name').then(({ data }) => {
      if (data) setSubjects(data)
    })
  }, [])

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))
  }

  function toggleGrade(g: string) {
    setSelectedGrades(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  }

  function toggleSubject(id: string) {
    setSelectedSubjects(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!terms) { setError('Devi accettare i termini e condizioni.'); return }
    if (!ibanConfirmed) { setError('Devi confermare la titolarità del conto.'); return }
    if (!avatarFile) { setError('La foto profilo è obbligatoria.'); return }
    if (form.password !== form.confirmPassword) { setError('Le password non coincidono.'); return }
    if (selectedGrades.length === 0) { setError('Seleziona almeno un grado scolastico.'); return }
    if (selectedSubjects.length === 0) { setError('Seleziona almeno una materia.'); return }

    setLoading(true); setError('')

    // 1. Registrazione
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          role: 'tutor',
          first_name: form.firstName,
          last_name: form.lastName,
          phone: form.phone,
        }
      }
    })
    if (signUpError || !authData.user) { setError(signUpError?.message || 'Errore registrazione'); setLoading(false); return }

    const userId = authData.user.id

    // 2. Upload avatar
    let avatarUrl = ''
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const { data: uploadData } = await supabase.storage.from('avatars').upload(`${userId}.${ext}`, avatarFile, { upsert: true })
      if (uploadData) {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(uploadData.path)
        avatarUrl = publicUrl
      }
    }

    // 3. Update profile con avatar
    await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', userId)

    // 4. Crea profilo tutor
    await supabase.from('tutor_profiles').insert({
      id: userId,
      bio: form.bio,
      fiscal_code: form.fiscalCode,
      iban: form.iban,
      iban_confirmed: ibanConfirmed,
      lesson_mode: form.lessonMode,
      address: form.lessonMode !== 'online' ? form.address : null,
      city: form.lessonMode !== 'online' ? form.city : null,
      terms_accepted: terms,
    })

    // 5. Materie e gradi
    await supabase.from('tutor_subjects').insert(selectedSubjects.map(sid => ({ tutor_id: userId, subject_id: sid })))
    await supabase.from('tutor_grades').insert(selectedGrades.map(g => ({ tutor_id: userId, grade: g })))

    router.push('/tutor')
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-6 sm:p-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            Per tutor
          </div>
          <h1 className="text-2xl font-bold text-black mb-2">Diventa tutor su Proflive</h1>
          <p className="text-gray-500 text-sm">Compila il profilo e inizia a ricevere prenotazioni</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full transition-all ${s <= step ? 'bg-black' : 'bg-gray-200'}`} />
              <p className={`text-xs mt-1.5 font-medium ${s === step ? 'text-black' : 'text-gray-400'}`}>
                {s === 1 ? 'Dati personali' : s === 2 ? 'Insegnamento' : 'Documenti'}
              </p>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3 mb-6">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* STEP 1: Dati personali */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className={`w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center border-2 ${avatarPreview ? 'border-black' : 'border-dashed border-gray-300'}`}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl inline-block transition-colors">
                    Carica foto *
                    <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
                  </label>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG - max 5MB. Obbligatoria</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Nome" placeholder="Marco" value={form.firstName} onChange={set('firstName')} icon={<User className="w-4 h-4" />} required />
                <Input label="Cognome" placeholder="Bianchi" value={form.lastName} onChange={set('lastName')} required />
              </div>
              <Input label="Email" type="email" placeholder="marco@email.com" value={form.email} onChange={set('email')} icon={<Mail className="w-4 h-4" />} required />
              <Input label="Telefono" type="tel" placeholder="+39 333 1234567" value={form.phone} onChange={set('phone')} icon={<Phone className="w-4 h-4" />} required />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Breve bio</label>
                <textarea value={form.bio} onChange={set('bio')} rows={3} placeholder="Raccontati in poche righe: la tua esperienza, il tuo stile di insegnamento..."
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm bg-white placeholder-gray-400 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Minimo 6 caratteri" required
                    className="w-full border border-gray-200 rounded-2xl pl-10 pr-10 py-3 text-sm bg-white placeholder-gray-400 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Input label="Conferma password" type="password" placeholder="Ripeti la password" value={form.confirmPassword} onChange={set('confirmPassword')} required />

              <Button type="button" className="w-full mt-2" size="lg" onClick={() => {
                if (!form.firstName || !form.email || !form.password || !avatarFile) { setError('Compila tutti i campi obbligatori e carica la foto.'); return }
                setError(''); setStep(2)
              }}>
                Continua
              </Button>
            </div>
          )}

          {/* STEP 2: Insegnamento */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Gradi scolastici *</p>
                <div className="flex gap-3 flex-wrap">
                  {GRADES.map(g => (
                    <button key={g.value} type="button"
                      onClick={() => toggleGrade(g.value)}
                      className={`px-4 py-2.5 rounded-2xl text-sm font-medium border transition-all ${selectedGrades.includes(g.value) ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Materie che insegni *</p>
                <div className="flex gap-2 flex-wrap max-h-48 overflow-y-auto">
                  {subjects.map(s => (
                    <button key={s.id} type="button"
                      onClick={() => toggleSubject(s.id)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${selectedSubjects.includes(s.id) ? 'bg-pink-100 text-pink-800 border-pink-300' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Modalità di insegnamento *</p>
                <div className="space-y-2">
                  {MODES.map(m => (
                    <label key={m.value} className="flex items-center gap-3 cursor-pointer p-3 rounded-2xl border border-gray-200 hover:border-gray-400 transition-all">
                      <input type="radio" name="mode" value={m.value} checked={form.lessonMode === m.value} onChange={set('lessonMode')} className="accent-black" />
                      <span className="text-sm font-medium text-gray-700">{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {form.lessonMode !== 'online' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Indirizzo" placeholder="Via Roma 1" value={form.address} onChange={set('address')} required />
                  <Input label="Città" placeholder="Milano" value={form.city} onChange={set('city')} required />
                </div>
              )}

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" size="lg" onClick={() => setStep(1)}>Indietro</Button>
                <Button type="button" className="flex-1" size="lg" onClick={() => {
                  if (selectedGrades.length === 0 || selectedSubjects.length === 0) { setError('Seleziona almeno un grado e una materia.'); return }
                  setError(''); setStep(3)
                }}>Continua</Button>
              </div>
            </div>
          )}

          {/* STEP 3: Documenti */}
          {step === 3 && (
            <div className="space-y-4">
              <Input label="Codice Fiscale" placeholder="RSSMRC80A01H501T" value={form.fiscalCode} onChange={set('fiscalCode')} icon={<CreditCard className="w-4 h-4" />} required />
              <Input label="IBAN" placeholder="IT60X0542811101000000123456" value={form.iban} onChange={set('iban')} icon={<Building className="w-4 h-4" />} required />

              <label className="flex items-start gap-3 cursor-pointer p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <input type="checkbox" checked={ibanConfirmed} onChange={e => setIbanConfirmed(e.target.checked)} className="mt-0.5 accent-black" required />
                <span className="text-sm text-gray-600">
                  Attesto di essere il titolare del conto bancario indicato e di essere responsabile dei dati inseriti *
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} className="mt-0.5 accent-black" required />
                <span className="text-sm text-gray-600">
                  Accetto i <a href="#" className="text-black font-medium underline">Termini e Condizioni</a> di Proflive per i tutor *
                </span>
              </label>

              <div className="flex gap-3 mt-2">
                <Button type="button" variant="outline" className="flex-1" size="lg" onClick={() => setStep(2)}>Indietro</Button>
                <Button type="submit" loading={loading} className="flex-1" size="lg">Completa registrazione</Button>
              </div>
            </div>
          )}
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Hai già un account?{' '}
          <Link href="/login" className="text-black font-semibold hover:underline">Accedi</Link>
        </p>
      </div>
    </div>
  )
}
