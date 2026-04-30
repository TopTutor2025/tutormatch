'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GraduationCap, Users, BookOpen, CreditCard, MessageSquare, Settings, Tag, LogOut, Menu, ChevronRight, Shield, Star } from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: GraduationCap, exact: true },
  { href: '/admin/studenti', label: 'Studenti', icon: Users },
  { href: '/admin/tutor', label: 'Tutor', icon: GraduationCap },
  { href: '/admin/prenotazioni', label: 'Prenotazioni', icon: BookOpen },
  { href: '/admin/pagamenti', label: 'Pagamenti tutor', icon: CreditCard },
  { href: '/admin/materie', label: 'Materie', icon: Tag },
  { href: '/admin/prezzi', label: 'Prezzi', icon: Settings },
  { href: '/admin/recensioni', label: 'Recensioni homepage', icon: Star },
  { href: '/admin/chat', label: 'Chat supporto', icon: MessageSquare },
]

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      supabase.from('profiles').select('role').eq('id', user.id).single().then(({ data }) => {
        if (data?.role !== 'admin') router.push('/login')
      })
    })
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>
        <div className="p-6 border-b border-gray-800">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-black" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">TutorMatch</span>
              <div className="flex items-center gap-1 mt-0.5">
                <Shield className="w-3 h-3 text-yellow-400" />
                <span className="text-xs text-yellow-400 font-semibold">Admin Panel</span>
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-2">
          {navItems.map(item => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${isActive ? 'bg-white text-black' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-all w-full">
            <LogOut className="w-4 h-4" /> Esci
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <header className="lg:hidden bg-gray-900 px-4 py-4 flex items-center gap-4 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-gray-800 transition-colors">
            <Menu className="w-5 h-5 text-white" />
          </button>
          <span className="font-semibold text-white">Admin Panel</span>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  )
}
