'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, ChevronRight, Lock, Unlock, AlertCircle } from 'lucide-react'
import { formatTime, isSlotPast } from '@/lib/utils'
import type { CalendarSlot } from '@/types/database'

const HOURS = Array.from({ length: 14 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`)

function getWeekDates(baseDate: Date): Date[] {
  const day = baseDate.getDay()
  const diff = (day === 0 ? -6 : 1 - day)
  const monday = new Date(baseDate)
  monday.setDate(monday.getDate() + diff)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function dateKey(d: Date): string {
  return d.toISOString().split('T')[0]
}

export default function CalendarioTutorPage() {
  const supabase = createClient()
  const [userId, setUserId] = useState('')
  const [weekBase, setWeekBase] = useState(new Date())
  const [slots, setSlots] = useState<CalendarSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  const weekDates = getWeekDates(weekBase)
  const weekStart = dateKey(weekDates[0])
  const weekEnd = dateKey(weekDates[6])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) { setUserId(user.id); loadSlots(user.id) }
    })
  }, [])

  useEffect(() => {
    if (userId) loadSlots(userId)
  }, [weekBase, userId])

  async function loadSlots(uid: string) {
    setLoading(true)
    const { data } = await supabase.from('calendar_slots')
      .select('*')
      .eq('tutor_id', uid)
      .gte('date', weekStart)
      .lte('date', weekEnd)
    setSlots(data || [])
    setLoading(false)
  }

  function getSlot(date: string, hour: string): CalendarSlot | undefined {
    return slots.find(s => s.date === date && s.start_time === `${hour}:00`)
  }

  async function toggleSlot(date: string, hour: string) {
    if (!userId) return
    const key = `${date}-${hour}`
    const slotEnd = `${String(parseInt(hour) + 1).padStart(2, '0')}:00`
    const existing = getSlot(date, hour)

    if (existing) {
      if (existing.status === 'prenotato') { alert('Non puoi modificare uno slot già prenotato.'); return }
      if (isSlotPast(date, slotEnd + ':00')) { alert('Non puoi modificare slot passati.'); return }
      setToggling(key)
      const newStatus = existing.status === 'disponibile' ? 'bloccato' : 'disponibile'
      await supabase.from('calendar_slots').update({ status: newStatus }).eq('id', existing.id)
      setSlots(prev => prev.map(s => s.id === existing.id ? { ...s, status: newStatus } : s))
    } else {
      if (isSlotPast(date, slotEnd + ':00')) { return }
      setToggling(key)
      const { data } = await supabase.from('calendar_slots').insert({
        tutor_id: userId,
        date,
        start_time: `${hour}:00`,
        end_time: slotEnd + ':00',
        status: 'disponibile',
      }).select().single()
      if (data) setSlots(prev => [...prev, data])
    }
    setToggling(null)
  }

  function slotColor(slot?: CalendarSlot, isPast?: boolean) {
    if (slot?.status === 'completato') return 'bg-green-100 text-green-700 cursor-not-allowed border border-green-300'
    if (slot?.status === 'prenotato') return 'bg-amber-100 text-amber-800 cursor-not-allowed border border-amber-300'
    if (isPast) return 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100'
    if (!slot || slot.status === 'bloccato') return 'bg-gray-100 text-gray-400 hover:bg-gray-200 cursor-pointer border border-gray-200'
    if (slot.status === 'disponibile') return 'bg-pink-100 text-pink-700 hover:bg-pink-200 cursor-pointer border border-pink-300 shadow-sm'
    return ''
  }

  function slotIcon(slot?: CalendarSlot) {
    if (!slot || slot.status === 'bloccato') return <Lock className="w-3 h-3" />
    if (slot.status === 'disponibile') return <Unlock className="w-3 h-3" />
    if (slot.status === 'prenotato') return <span className="text-xs">📅</span>
    if (slot.status === 'completato') return <span className="text-xs">✓</span>
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">Calendario</h1>
        <p className="text-gray-500 mt-1">Gestisci la tua disponibilità. Clicca su uno slot per sbloccarlo o bloccarlo.</p>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 bg-white rounded-2xl border border-gray-100 p-4">
        {[
          { color: 'bg-gray-100 border-gray-200', label: 'Bloccato' },
          { color: 'bg-pink-100 border-pink-300', label: 'Disponibile' },
          { color: 'bg-amber-100 border-amber-300', label: 'Prenotato' },
          { color: 'bg-green-100 border-green-300', label: 'Completato' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded border ${l.color}`} />
            <span className="text-sm text-gray-600">{l.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 ml-auto text-sm text-gray-500">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          Gli slot prenotati non sono modificabili
        </div>
      </div>

      {/* Navigazione settimana */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-5 py-4">
        <button onClick={() => { const d = new Date(weekBase); d.setDate(d.getDate() - 7); setWeekBase(d) }}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="font-semibold text-sm">{weekDates[0].toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })} – {weekDates[6].toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <button onClick={() => { const d = new Date(weekBase); d.setDate(d.getDate() + 7); setWeekBase(d) }}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Griglia calendario */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-auto">
        <div className="min-w-[700px]">
          {/* Header giorni */}
          <div className="grid grid-cols-8 border-b border-gray-100">
            <div className="p-3 bg-gray-50" />
            {weekDates.map(d => (
              <div key={dateKey(d)} className={`p-3 text-center bg-gray-50 border-l border-gray-100 ${dateKey(d) === dateKey(new Date()) ? 'bg-pink-50' : ''}`}>
                <p className="text-xs font-semibold text-gray-500 uppercase">{d.toLocaleDateString('it-IT', { weekday: 'short' })}</p>
                <p className={`text-lg font-bold mt-0.5 ${dateKey(d) === dateKey(new Date()) ? 'text-pink-600' : 'text-gray-900'}`}>
                  {d.getDate()}
                </p>
              </div>
            ))}
          </div>

          {/* Slot orari */}
          {HOURS.map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-50">
              <div className="p-2 text-xs text-gray-400 font-medium text-right pr-3 py-3 bg-gray-50/50">{hour}</div>
              {weekDates.map(d => {
                const dateStr = dateKey(d)
                const slot = getSlot(dateStr, hour)
                const endHour = `${String(parseInt(hour) + 1).padStart(2, '0')}:00:00`
                const past = isSlotPast(dateStr, endHour)
                const key = `${dateStr}-${hour}`
                return (
                  <div key={dateStr} className="border-l border-gray-100 p-1">
                    <button
                      onClick={() => !past && !toggling && toggleSlot(dateStr, hour)}
                      disabled={!!toggling || past}
                      title={slot?.status === 'prenotato' ? 'Slot prenotato - non modificabile' : past ? 'Slot passato' : slot?.status === 'disponibile' ? 'Clicca per bloccare' : 'Clicca per rendere disponibile'}
                      className={`w-full h-10 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1 ${slotColor(slot, past)} ${toggling === key ? 'opacity-50' : ''}`}>
                      {toggling === key ? (
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : slotIcon(slot)}
                    </button>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
