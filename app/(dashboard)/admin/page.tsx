'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Users, BookOpen, CreditCard, Star, Tag, ChevronRight, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function AdminDashboardPage() {
  const supabase = createClient()
  const [stats, setStats] = useState({
    totalStudents: 0, totalTutors: 0, totalBookings: 0, completedBookings: 0,
    activeSubscriptions: 0, pendingPayments: 0, totalSubjects: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [
        { count: students }, { count: tutors }, { count: bookings },
        { count: completed }, { count: activeSubs }, { count: pending }, { count: subjects }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'studente'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'tutor'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'completato'),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'attivo'),
        supabase.from('tutor_payments').select('*', { count: 'exact', head: true }).eq('status', 'in_elaborazione'),
        supabase.from('subjects').select('*', { count: 'exact', head: true }).eq('active', true),
      ])
      setStats({
        totalStudents: students || 0, totalTutors: tutors || 0, totalBookings: bookings || 0,
        completedBookings: completed || 0, activeSubscriptions: activeSubs || 0,
        pendingPayments: pending || 0, totalSubjects: subjects || 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-gray-600 border-t-transparent rounded-full animate-spin" /></div>

  const cards = [
    { label: 'Studenti registrati', value: stats.totalStudents, icon: Users, color: 'bg-blue-500', href: '/admin/studenti' },
    { label: 'Tutor attivi', value: stats.totalTutors, icon: Star, color: 'bg-purple-500', href: '/admin/tutor' },
    { label: 'Prenotazioni totali', value: stats.totalBookings, icon: BookOpen, color: 'bg-green-500', href: '/admin/prenotazioni' },
    { label: 'Lezioni completate', value: stats.completedBookings, icon: TrendingUp, color: 'bg-yellow-500', href: '/admin/prenotazioni' },
    { label: 'Abbonamenti attivi', value: stats.activeSubscriptions, icon: CreditCard, color: 'bg-pink-500', href: '/admin/studenti' },
    { label: 'Pagamenti in attesa', value: stats.pendingPayments, icon: CreditCard, color: 'bg-orange-500', href: '/admin/pagamenti' },
    { label: 'Materie attive', value: stats.totalSubjects, icon: Tag, color: 'bg-teal-500', href: '/admin/materie' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black">Dashboard Admin</h1>
        <p className="text-gray-500 mt-1">Panoramica completa della piattaforma Proflive</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(card => (
          <Link key={card.label} href={card.href}
            className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5 hover:-translate-y-0.5 hover:shadow-card transition-all">
            <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-black">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {[
          { title: 'Azioni rapide', items: [
            { label: 'Gestisci studenti', href: '/admin/studenti', desc: 'Profili, abbonamenti e ore lezione' },
            { label: 'Gestisci tutor', href: '/admin/tutor', desc: 'Profili e calendari' },
            { label: 'Approva pagamenti', href: '/admin/pagamenti', desc: `${stats.pendingPayments} in attesa` },
            { label: 'Gestisci materie', href: '/admin/materie', desc: 'Aggiungi, modifica o elimina' },
          ]},
          { title: 'Configurazione', items: [
            { label: 'Aggiorna prezzi', href: '/admin/prezzi', desc: 'Abbonamenti e ore lezione' },
            { label: 'Chat di supporto', href: '/admin/chat', desc: 'Rispondi a studenti e tutor' },
            { label: 'Gestisci prenotazioni', href: '/admin/prenotazioni', desc: 'Crea, modifica, elimina' },
          ]},
        ].map(section => (
          <div key={section.title} className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6">
            <h2 className="font-bold text-gray-900 mb-4">{section.title}</h2>
            <div className="space-y-2">
              {section.items.map(item => (
                <Link key={item.label} href={item.href}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
