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
      <div className="bg-white/[0.04] rounded-3xl border border-white/10 shadow-2xl backdrop-blur-sm p-6 sm:p-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Bentornato</h1>
          <p className="text-gray-400 text-sm">Accedi al tuo account proflive.app</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-2xl px-4 py-3 mb-6">
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
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <Link href="/password-dimenticata" className="text-xs text-gray-400 hover:text-emerald-400 transition-colors">
                Password dimenticata?
              </Link>
            </div>
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

          <Button type="submit" loading={loading} size="lg"
            className="w-full mt-2 !bg-gradient-to-r from-emerald-400 to-teal-400 !text-black shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)]">
            Accedi
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 space-y-3 text-center text-sm text-gray-400">
          <p>Non hai un account?</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/registrazione/studente" className="flex-1 border border-white/15 text-gray-200 font-medium py-2.5 rounded-2xl hover:bg-white/10 transition-colors text-center">
              Iscriviti come studente
            </Link>
            <Link href="/registrazione/tutor" className="flex-1 border border-white/15 text-gray-200 font-medium py-2.5 rounded-2xl hover:bg-white/10 transition-colors text-center">
              Iscriviti come tutor
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
