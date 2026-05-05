'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GraduationCap, MapPin, Calendar, BookOpen, CreditCard, MessageSquare, User, LogOut, Menu, ChevronRight } from 'lucide-react'
import type { Profile } from '@/types/database'

const navItems = [
  { href: '/tutor', label: 'Dashboard', icon: GraduationCap, exact: true },
  { href: '/tutor/calendario', label: 'Calendario', icon: Calendar },
  { href: '/tutor/lezioni', label: 'Le mie lezioni', icon: BookOpen },
  { href: '/tutor/pagamenti', label: 'Pagamenti', icon: CreditCard },
  { href: '/tutor/chat', label: 'Chat', icon: MessageSquare },
  { href: '/tutor/profilo', label: 'Profilo', icon: User },
]

export default function TutorDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const userIdRef = useRef<string>('')

  async function loadUnreadCount(userId: string) {
    const { data: convs } = await supabase.from('conversations').select('id').eq('tutor_id', userId)
    if (!convs?.length) { setUnreadCount(0); return }
    const convIds = convs.map(c => c.id)
    const { count } = await supabase.from('messages')
      .select('id', { count: 'exact', head: true })
      .in('conversation_id', convIds)
      .eq('read', false)
      .neq('sender_id', userId)
    setUnreadCount(count || 0)
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      userIdRef.current = user.id
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => setProfile(data))
      loadUnreadCount(user.id)

      const channel = supabase.channel('tutor-unread')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' },
          payload => {
            if (payload.new.sender_id !== userIdRef.current) {
              loadUnreadCount(userIdRef.current)
            }
          }
        )
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' },
          () => { loadUnreadCount(userIdRef.current) }
        )
        .subscribe()
    })
  }, [])

  useEffect(() => {
    if (pathname.startsWith('/tutor/chat') && userIdRef.current) {
      setTimeout(() => loadUnreadCount(userIdRef.current), 800)
    }
  }, [pathname])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">Proflive</span>
          </Link>
          <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full mt-2 inline-block">Tutor</span>
        </div>

        {profile && (
          <div className="p-4 mx-4 mt-4 bg-gray-50 rounded-2xl border border-gray-200">
            <div className="flex items-center gap-3">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.first_name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {profile.first_name[0]}{profile.last_name[0]}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="font-semibold text-sm text-gray-900 truncate">{profile.first_name} {profile.last_name}</p>
                <p className="text-xs text-gray-500">Tutor</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-2">
          {navItems.map(item => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${isActive ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {item.href === '/tutor/chat' && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
                {isActive && unreadCount === 0 && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all w-full">
            <LogOut className="w-4 h-4" /> Esci
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <header className="lg:hidden bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-4 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold">Proflive · Tutor</span>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  )
}
