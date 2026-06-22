'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, ChevronRight, Megaphone, Users, UserCheck, TrendingUp, Save } from 'lucide-react'
import Button from '@/components/ui/Button'

type DayRow = { date: string; posts: number; contacts: number }

function ymd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function pct(num: number, den: number): string {
  if (!den) return '—'
  return `${Math.round((num / den) * 100)}%`
}

export default function AdminMarketingPage() {
  const supabase = createClient()
  const [monthBase, setMonthBase] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [rows, setRows] = useState<DayRow[]>([])
  const [clientsCount, setClientsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => { load() }, [monthBase])

  async function load() {
    setLoading(true)
    const year = monthBase.getFullYear()
    const month = monthBase.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const start = new Date(year, month, 1)
    const end = new Date(year, month + 1, 1)

    const [{ data: tracking }, { count }] = await Promise.all([
      supabase.from('ad_tracking').select('*').gte('date', ymd(start)).lt('date', ymd(end)),
      supabase.from('profiles').select('id', { count: 'exact', head: true })
        .eq('role', 'studente').gte('created_at', start.toISOString()).lt('created_at', end.toISOString()),
    ])

    const map: Record<string, any> = Object.fromEntries((tracking || []).map(t => [t.date, t]))
    const allRows: DayRow[] = []
    for (let day = 1; day <= daysInMonth; day++) {
      const ds = ymd(new Date(year, month, day))
      const ex = map[ds]
      allRows.push({ date: ds, posts: ex?.posts || 0, contacts: ex?.contacts || 0 })
    }
    setRows(allRows)
    setClientsCount(count || 0)
    setDirty(false)
    setLoading(false)
  }

  function updateRow(date: string, field: 'posts' | 'contacts', value: number) {
    setRows(prev => prev.map(r => r.date === date ? { ...r, [field]: Math.max(0, value) } : r))
    setDirty(true)
  }

  async function save() {
    setSaving(true)
    const toUpsert = rows.filter(r => r.posts > 0 || r.contacts > 0)
      .map(r => ({ date: r.date, posts: r.posts, contacts: r.contacts }))
    const toDelete = rows.filter(r => r.posts === 0 && r.contacts === 0).map(r => r.date)
    if (toUpsert.length) await supabase.from('ad_tracking').upsert(toUpsert, { onConflict: 'date' })
    if (toDelete.length) await supabase.from('ad_tracking').delete().in('date', toDelete)
    setSaving(false)
    await load()
  }

  function changeMonth(delta: number) {
    setMonthBase(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
  }

  const totalPosts = rows.reduce((a, r) => a + r.posts, 0)
  const totalContacts = rows.reduce((a, r) => a + r.contacts, 0)
  const maxVal = Math.max(1, ...rows.map(r => Math.max(r.posts, r.contacts)))

  const monthLabel = monthBase.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
  const isCurrentMonth = (() => {
    const now = new Date()
    return now.getFullYear() === monthBase.getFullYear() && now.getMonth() === monthBase.getMonth()
  })()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Tracciamento pubblicità</h1>
          <p className="text-gray-500 mt-1">Post fatti, contatti ricevuti e clienti chiusi per ogni campagna</p>
        </div>
        {/* Navigazione mese */}
        <div className="flex items-center gap-2 bg-white rounded-2xl border border-gray-100 shadow-soft p-1.5">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-sm capitalize min-w-[130px] text-center">{monthLabel}</span>
          <button onClick={() => changeMonth(1)} disabled={isCurrentMonth}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Post fatti', value: totalPosts, sub: 'questo mese', icon: Megaphone, color: 'bg-blue-50 text-blue-700' },
              { label: 'Contatti ricevuti', value: totalContacts, sub: 'questo mese', icon: Users, color: 'bg-purple-50 text-purple-700' },
              { label: 'Clienti chiusi', value: clientsCount, sub: 'iscrizioni studenti', icon: UserCheck, color: 'bg-pink-50 text-pink-700' },
              { label: 'Conversione totale', value: pct(clientsCount, totalPosts), sub: 'clienti / post', icon: TrendingUp, color: 'bg-green-50 text-green-700' },
            ].map(card => (
              <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-soft">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-black">{card.value}</p>
                <p className="text-xs text-gray-500 mt-1">{card.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Funnel / tassi */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
            <p className="font-semibold text-sm mb-4">Funnel di conversione (mese)</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Contatti per post', value: pct(totalContacts, totalPosts), detail: `${totalContacts} contatti / ${totalPosts} post` },
                { label: 'Conversione contatti', value: pct(clientsCount, totalContacts), detail: `${clientsCount} clienti / ${totalContacts} contatti` },
                { label: 'Conversione totale', value: pct(clientsCount, totalPosts), detail: `${clientsCount} clienti / ${totalPosts} post` },
              ].map(t => (
                <div key={t.label} className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-extrabold text-black">{t.value}</p>
                  <p className="text-sm font-medium text-gray-700 mt-1">{t.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Grafico giornaliero */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-sm">Andamento giornaliero</p>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-500" /> Post</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-purple-500" /> Contatti</span>
              </div>
            </div>
            {totalPosts === 0 && totalContacts === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">Nessun dato per questo mese. Inserisci i dati qui sotto.</p>
            ) : (
              <div className="overflow-x-auto">
                <div className="flex items-end gap-1.5 h-44 min-w-max pb-1">
                  {rows.map(r => {
                    const day = parseInt(r.date.slice(8, 10))
                    return (
                      <div key={r.date} className="flex flex-col items-center gap-1 flex-shrink-0">
                        <div className="flex items-end gap-0.5 h-36">
                          <div title={`${r.posts} post`} style={{ height: `${(r.posts / maxVal) * 100}%` }}
                            className="w-2.5 bg-blue-500 rounded-t min-h-[2px]" />
                          <div title={`${r.contacts} contatti`} style={{ height: `${(r.contacts / maxVal) * 100}%` }}
                            className="w-2.5 bg-purple-500 rounded-t min-h-[2px]" />
                        </div>
                        <span className="text-[9px] text-gray-400">{day}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Inserimento dati di oggi (solo mese corrente) */}
          {isCurrentMonth ? (() => {
            const todayStr = ymd(new Date())
            const today = rows.find(r => r.date === todayStr)
            if (!today) return null
            const todayLabel = new Date(todayStr + 'T00:00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })
            return (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold text-sm">Inserimento dati di oggi</p>
                    <p className="text-xs text-gray-400 capitalize mt-0.5">{todayLabel}</p>
                  </div>
                  <Button size="sm" loading={saving} disabled={!dirty} onClick={save}>
                    <Save className="w-4 h-4" /> Salva
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Post fatti</label>
                    <input type="number" min={0} value={today.posts || ''} placeholder="0"
                      onChange={e => updateRow(todayStr, 'posts', parseInt(e.target.value) || 0)}
                      className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-gray-900 transition-all" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Contatti ricevuti</label>
                    <input type="number" min={0} value={today.contacts || ''} placeholder="0"
                      onChange={e => updateRow(todayStr, 'contacts', parseInt(e.target.value) || 0)}
                      className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-gray-900 transition-all" />
                  </div>
                </div>
                {dirty && <p className="text-xs text-amber-600 mt-3">Hai modifiche non salvate. Clicca "Salva" per registrarle.</p>}
              </div>
            )
          })() : (
            <p className="text-sm text-gray-400 text-center py-4">L'inserimento dati è disponibile solo per la giornata corrente. Torna al mese attuale per inserire i dati di oggi.</p>
          )}
        </>
      )}
    </div>
  )
}
