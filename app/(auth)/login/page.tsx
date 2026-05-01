'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError('Email o password non corretti.')
      setLoading(false)
      return
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role === 'studente') router.push('/studente')
    else if (profile?.role === 'tutor') router.push('/tutor')
    else if (profile?.role === 'admin') router.push('/admin')
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-6 sm:p-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-black mb-2">Bentornato</h1>
          <p className="text-gray-500 text-sm">Accedi al tuo account Proflive</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="nome@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-gray-200 rounded-2xl pl-10 pr-10 py-3 text-sm bg-white placeholder-gray-400 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
            Accedi
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 space-y-3 text-center text-sm text-gray-500">
          <p>Non hai un account?</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/registrazione/studente" className="flex-1 border border-gray-200 text-gray-700 font-medium py-2.5 rounded-2xl hover:bg-gray-50 transition-colors text-center">
              Iscriviti come studente
            </Link>
            <Link href="/registrazione/tutor" className="flex-1 border border-gray-200 text-gray-700 font-medium py-2.5 rounded-2xl hover:bg-gray-50 transition-colors text-center">
              Iscriviti come tutor
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
