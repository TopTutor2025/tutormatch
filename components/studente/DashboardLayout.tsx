'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GraduationCap, MapPin, Search, Heart, Calendar, CreditCard, Clock, MessageSquare, User, LogOut, Menu, X, ChevronRight } from 'lucide-react'
import type { Profile, StudentProfile } from '@/types/database'

const navItems = [
  { href: '/studente', label: 'Dashboard', icon: GraduationCap, exact: true },
  { href: '/studente/cerca', label: 'Cerca tutor', icon: Search },
  { href: '/studente/preferiti', label: 'Preferiti', icon: Heart },
  { href: '/studente/lezioni', label: 'Le mie lezioni', icon: Calendar },
  { href: '/studente/abbonamento', label: 'Abbonamento', icon: CreditCard },
  { href: '/studente/ore', label: 'Ore lezione', icon: Clock },
  { href: '/studente/chat', label: 'Chat', icon: MessageSquare },
  { href: '/studente/profilo', label: 'Profilo', icon: User },
]

interface Props {
  children: React.ReactNode
}

export default function StudentDashboardLayout({ children }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const [{ data: p }, { data: sp }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('student_profiles').select('*').eq('id', user.id).single(),
      ])
      setProfile(p)
      setStudentProfile(sp)
    }
    load()
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const totalHours = studentProfile
    ? studentProfile.hour_credits_medie + studentProfile.hour_credits_superiori + studentProfile.hour_credits_universita
    : 0

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>

        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">Proflive</span>
          </Link>
        </div>

        {/* User info */}
        {profile && (
          <div className="p-4 mx-4 mt-4 bg-pink-50 rounded-2xl border border-pink-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-200 rounded-xl flex items-center justify-center text-pink-800 font-bold text-sm">
                {profile.first_name[0]}{profile.last_name[0]}
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold text-sm text-gray-900 truncate">{profile.first_name} {profile.last_name}</p>
                <p className="text-xs text-gray-500 truncate">{totalHours}h disponibili</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-2">
          {navItems.map(item => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${isActive ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all w-full">
            <LogOut className="w-4 h-4" />
            Esci
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0 overflow-x-hidden">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-4 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold">Proflive</span>
          {sidebarOpen && (
            <button onClick={() => setSidebarOpen(false)} className="ml-auto p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
