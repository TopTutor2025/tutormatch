'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function PasswordDimenticataPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reimposta-password`,
    })

    if (error) {
      setError('Errore nell\'invio. Controlla l\'email e riprova.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white/[0.04] rounded-3xl border border-white/10 shadow-2xl backdrop-blur-sm p-6 sm:p-10">

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-400/15 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Email inviata!</h1>
            <p className="text-gray-400 text-sm mb-2">
              Abbiamo inviato un link per reimpostare la password a:
            </p>
            <p className="font-semibold text-white text-sm mb-6">{email}</p>
            <p className="text-gray-500 text-xs mb-8">
              Controlla anche la cartella spam. Il link scade dopo 1 ora.
            </p>
            <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Torna al login
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Password dimenticata?</h1>
              <p className="text-gray-400 text-sm">Inserisci la tua email e ti mandiamo un link per reimpostare la password.</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-2xl px-4 py-3 mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="nome@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />
              <Button type="submit" loading={loading} size="lg"
                className="w-full mt-2 !bg-gradient-to-r from-emerald-400 to-teal-400 !text-black shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)]">
                Invia link di reset
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Torna al login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
