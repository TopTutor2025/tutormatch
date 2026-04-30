'use client'
import { useState } from 'react'
import Link from 'next/link'
import { GraduationCap, Menu, X } from 'lucide-react'

export default function LandingNavbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">TutorMatch</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#come-funziona" className="hover:text-black transition-colors">Come funziona</a>
          <a href="#prezzi" className="hover:text-black transition-colors">Prezzi</a>
          <a href="#tutor" className="hover:text-black transition-colors">Diventa Tutor</a>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-black transition-colors px-4 py-2">
            Accedi
          </Link>
          <Link href="/registrazione/studente" className="bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-2xl hover:bg-gray-800 transition-colors">
            Inizia gratis
          </Link>
        </div>

        {/* Mobile: CTA ridotto + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/login" className="text-sm font-medium text-gray-700 px-3 py-2">
            Accedi
          </Link>
          <button
            onClick={() => setOpen(v => !v)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-5 py-4 space-y-1">
          <a href="#come-funziona" onClick={() => setOpen(false)}
            className="block text-sm font-medium text-gray-700 hover:text-black py-3 border-b border-gray-50 transition-colors">
            Come funziona
          </a>
          <a href="#prezzi" onClick={() => setOpen(false)}
            className="block text-sm font-medium text-gray-700 hover:text-black py-3 border-b border-gray-50 transition-colors">
            Prezzi
          </a>
          <a href="#tutor" onClick={() => setOpen(false)}
            className="block text-sm font-medium text-gray-700 hover:text-black py-3 border-b border-gray-50 transition-colors">
            Diventa Tutor
          </a>
          <div className="pt-3">
            <Link href="/registrazione/studente" onClick={() => setOpen(false)}
              className="block w-full text-center bg-black text-white text-sm font-semibold px-5 py-3 rounded-2xl hover:bg-gray-800 transition-colors">
              Inizia gratis
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
