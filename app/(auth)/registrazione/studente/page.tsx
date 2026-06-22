'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { User, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react'

export default function RegisterStudentPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [terms, setTerms] = useState(false)
  const [privacy, setPrivacy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!terms || !privacy) { setError('Devi accettare termini e privacy policy per procedere.'); return }
    if (form.password !== form.confirmPassword) { setError('Le password non coincidono.'); return }
    if (form.password.length < 6) { setError('La password deve essere di almeno 6 caratteri.'); return }
    setLoading(true); setError('')
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          role: 'studente',
          first_name: form.firstName,
          last_name: form.lastName,
          phone: form.phone,
        }
      }
    })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    router.push('/studente')
  }

  return (
    <div className="w-full max-w-lg">
      <div className="bg-white/[0.04] rounded-3xl border border-white/10 shadow-2xl backdrop-blur-sm p-6 sm:p-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            Per studenti
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Crea il tuo account</h1>
          <p className="text-gray-400 text-sm">Inizia a trovare il tuo tutor ideale</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-2xl px-4 py-3 mb-6">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nome" placeholder="Mario" value={form.firstName} onChange={set('firstName')} icon={<User className="w-4 h-4" />} required />
            <Input label="Cognome" placeholder="Rossi" value={form.lastName} onChange={set('lastName')} required />
          </div>
          <Input label="Email" type="email" placeholder="mario@email.com" value={form.email} onChange={set('email')} icon={<Mail className="w-4 h-4" />} required />
          <Input label="Telefono" type="tel" placeholder="+39 333 1234567" value={form.phone} onChange={set('phone')} icon={<Phone className="w-4 h-4" />} required />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Password</label>
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

          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} className="mt-0.5 accent-emerald-400" required />
              <span className="text-sm text-gray-400">
                Accetto i <Link href="/termini" target="_blank" className="text-emerald-400 font-medium hover:underline">Termini e Condizioni</Link> di proflive.app *
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={privacy} onChange={e => setPrivacy(e.target.checked)} className="mt-0.5 accent-emerald-400" required />
              <span className="text-sm text-gray-400">
                Accetto la <Link href="/privacy" target="_blank" className="text-emerald-400 font-medium hover:underline">Privacy Policy</Link> *
              </span>
            </label>
          </div>

          <Button type="submit" loading={loading} size="lg"
            className="w-full mt-2 !bg-gradient-to-r from-emerald-400 to-teal-400 !text-black shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)]">
            Crea account studente
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Hai già un account?{' '}
          <Link href="/login" className="text-emerald-400 font-semibold hover:underline">Accedi</Link>
        </p>
      </div>
    </div>
  )
}
