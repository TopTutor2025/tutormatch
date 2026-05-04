'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function ReimpostaPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri.')
      return
    }
    if (password !== confirm) {
      setError('Le password non coincidono.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('Link scaduto o non valido. Richiedi un nuovo link.')
      setLoading(false)
      return
    }

    setDone(true)
    setTimeout(() => router.push('/login'), 3000)
  }

  if (done) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-6 sm:p-10 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-black mb-3">Password aggiornata!</h1>
          <p className="text-gray-500 text-sm">Verrai reindirizzato al login tra pochi secondi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-6 sm:p-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-black mb-2">Nuova password</h1>
          <p className="text-gray-500 text-sm">Scegli una nuova password per il tuo account.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Nuova password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Almeno 6 caratteri"
                required
                className="w-full border border-gray-200 rounded-2xl pl-10 pr-10 py-3 text-sm bg-white placeholder-gray-400 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Conferma password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Ripeti la password"
                required
                className="w-full border border-gray-200 rounded-2xl pl-10 pr-10 py-3 text-sm bg-white placeholder-gray-400 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
              />
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
            Salva nuova password
          </Button>
        </form>
      </div>
    </div>
  )
}
