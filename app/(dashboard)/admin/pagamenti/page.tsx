'use client'
import { useState, useEffect } from 'react'
import { CheckCircle, Clock, RefreshCw } from 'lucide-react'
import { formatCurrency, getMonthName } from '@/lib/utils'

export default function AdminPagamentiPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTutor, setFilterTutor] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [generateMsg, setGenerateMsg] = useState('')

  useEffect(() => { loadPayments() }, [])

  async function loadPayments() {
    const res = await fetch('/api/admin/payments')
    const json = await res.json()
    setPayments(json.data || [])
    setLoading(false)
  }

  async function generatePayments() {
    setGenerating(true)
    setGenerateMsg('')
    const res = await fetch('/api/admin/generate-payments', { method: 'POST' })
    const data = await res.json()
    if (data.success) {
      setGenerateMsg('✓ Pagamenti generati con successo!')
      await loadPayments()
    } else {
      setGenerateMsg(`Errore: ${data.error}`)
    }
    setGenerating(false)
    setTimeout(() => setGenerateMsg(''), 4000)
  }

  async function toggleStatus(id: string, current: string) {
    setUpdating(id)
    const newStatus = current === 'in_elaborazione' ? 'pagato' : 'in_elaborazione'
    await fetch('/api/admin/payments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    })
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p))
    setUpdating(null)
  }

  const months = [...new Set(payments.map(p => p.month))].sort((a, b) => b - a)
  const years = [...new Set(payments.map(p => p.year))].sort((a, b) => b - a)
  const tutors = [...new Map(payments.map(p => [p.tutor_id, p.tutor?.profile])).entries()].filter(([, p]) => p)

  const filtered = payments.filter(p => {
    const tutorName = `${p.tutor?.profile?.first_name} ${p.tutor?.profile?.last_name}`.toLowerCase()
    const matchTutor = !filterTutor || tutorName.includes(filterTutor.toLowerCase()) || p.tutor_id === filterTutor
    const matchMonth = !filterMonth || p.month === parseInt(filterMonth)
    const matchYear = !filterYear || p.year === parseInt(filterYear)
    return matchTutor && matchMonth && matchYear
  })

  const totalPending = filtered.filter(p => p.status === 'in_elaborazione').reduce((s, p) => s + p.amount, 0)
  const totalPaid = filtered.filter(p => p.status === 'pagato').reduce((s, p) => s + p.amount, 0)

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Pagamenti Tutor</h1>
          <p className="text-gray-500 mt-1">Gestisci i compensi mensili dei tutor</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button onClick={generatePayments} disabled={generating}
            className="flex items-center gap-2 bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 flex-shrink-0">
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Generando...' : 'Genera pagamenti mese scorso'}
          </button>
          {generateMsg && (
            <p className={`text-xs font-medium ${generateMsg.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
              {generateMsg}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="text-sm text-amber-700">In elaborazione</p>
          <p className="text-2xl font-bold text-amber-800">{formatCurrency(totalPending)}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <p className="text-sm text-green-700">Pagati (filtro attivo)</p>
          <p className="text-2xl font-bold text-green-800">{formatCurrency(totalPaid)}</p>
        </div>
      </div>

      {/* Filtri */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Filtra per tutor</label>
            <select value={filterTutor} onChange={e => setFilterTutor(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-gray-900 bg-white">
              <option value="">Tutti i tutor</option>
              {tutors.map(([id, p]) => (
                <option key={id} value={id}>{p?.first_name} {p?.last_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Mese</label>
            <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-gray-900 bg-white">
              <option value="">Tutti i mesi</option>
              {months.map(m => <option key={m} value={m}>{getMonthName(m)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Anno</label>
            <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-gray-900 bg-white">
              <option value="">Tutti gli anni</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Tabella */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Tutor', 'Periodo', 'Lezioni', 'Ore', 'Importo', 'Stato', 'Azione'].map(h => (
                <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">Nessun record trovato</td></tr>
            ) : filtered.map(payment => (
              <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-medium text-gray-900">{payment.tutor?.profile?.first_name} {payment.tutor?.profile?.last_name}</p>
                </td>
                <td className="px-5 py-4 capitalize">{getMonthName(payment.month)} {payment.year}</td>
                <td className="px-5 py-4">{payment.completed_lessons}</td>
                <td className="px-5 py-4">{payment.total_hours}h</td>
                <td className="px-5 py-4 font-bold">{formatCurrency(payment.amount)}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    payment.status === 'pagato' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {payment.status === 'pagato' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {payment.status === 'pagato' ? 'Pagato' : 'In elaborazione'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <button onClick={() => toggleStatus(payment.id, payment.status)} disabled={updating === payment.id}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors ${
                      payment.status === 'pagato' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-green-50 text-green-700 hover:bg-green-100'
                    } disabled:opacity-50`}>
                    {updating === payment.id ? '...' : payment.status === 'pagato' ? '↩ In elaborazione' : '✓ Segna pagato'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
