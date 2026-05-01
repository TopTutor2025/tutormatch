'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CreditCard } from 'lucide-react'
import { formatCurrency, getMonthName } from '@/lib/utils'
import type { TutorPayment } from '@/types/database'

export default function TutorPagamentiPage() {
  const supabase = createClient()
  const [payments, setPayments] = useState<TutorPayment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('tutor_payments').select('*').eq('tutor_id', user.id).order('year', { ascending: false }).order('month', { ascending: false })
      setPayments(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>

  const totalEarned = payments.filter(p => p.status === 'pagato').reduce((sum, p) => sum + p.amount, 0)
  const pendingAmount = payments.filter(p => p.status === 'in_elaborazione').reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black">Pagamenti</h1>
        <p className="text-gray-500 mt-1">Storico dei tuoi compensi mensili</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6">
          <p className="text-sm text-gray-500 mb-2">Totale guadagnato</p>
          <p className="text-3xl font-extrabold text-black">{formatCurrency(totalEarned)}</p>
          <p className="text-xs text-gray-400 mt-1">Da pagamenti con stato "Pagato"</p>
        </div>
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6">
          <p className="text-sm text-amber-700 mb-2">In elaborazione</p>
          <p className="text-3xl font-extrabold text-amber-800">{formatCurrency(pendingAmount)}</p>
          <p className="text-xs text-amber-600 mt-1">In attesa di liquidazione</p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-600">Nessun record di pagamento</p>
          <p className="text-sm text-gray-400 mt-1">I record vengono generati automaticamente ogni mese</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-x-auto">
          <table className="w-full min-w-[500px] text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Periodo', 'Lezioni completate', 'Ore totali', 'Importo', 'Stato'].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map(payment => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium capitalize">{getMonthName(payment.month)} {payment.year}</td>
                  <td className="px-5 py-4">{payment.completed_lessons}</td>
                  <td className="px-5 py-4">{payment.total_hours}h</td>
                  <td className="px-5 py-4 font-bold">{formatCurrency(payment.amount)}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      payment.status === 'pagato' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {payment.status === 'pagato' ? '✓ Pagato' : '⏳ In elaborazione'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
        <p className="text-sm text-gray-600 font-medium mb-2">Come funzionano i pagamenti</p>
        <ul className="text-xs text-gray-500 space-y-1.5">
          <li>• I record vengono generati automaticamente il 1° di ogni mese per il mese precedente</li>
          <li>• L'importo si basa sulle lezioni contrassegnate come "Completate" durante il mese</li>
          <li>• Il pagamento viene processato dall'admin e lo stato passa da "In elaborazione" a "Pagato"</li>
        </ul>
      </div>
    </div>
  )
}
