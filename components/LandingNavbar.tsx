'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Menu, X } from 'lucide-react'

export default function LandingNavbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 20) }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const dark = !scrolled && !open // testo chiaro sopra la hero scura

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${scrolled || open ? 'bg-white/90 backdrop-blur-md' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${dark ? 'bg-white' : 'bg-black'}`}>
            <MapPin className={`w-5 h-5 ${dark ? 'text-black' : 'text-white'}`} />
          </div>
          <span className={`text-xl font-bold tracking-tight ${dark ? 'text-white' : 'text-black'}`}>Proflive</span>
        </Link>

        {/* Desktop links */}
        <div className={`hidden md:flex items-center gap-8 text-sm font-medium ${dark ? 'text-gray-200' : 'text-gray-600'}`}>
          <a href="#come-funziona" className={`transition-colors ${dark ? 'hover:text-white' : 'hover:text-black'}`}>Come funziona</a>
          <a href="#prezzi" className={`transition-colors ${dark ? 'hover:text-white' : 'hover:text-black'}`}>Prezzi</a>
          <a href="#tutor" className={`transition-colors ${dark ? 'hover:text-white' : 'hover:text-black'}`}>Diventa Tutor</a>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className={`text-sm font-medium transition-colors px-4 py-2 ${dark ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-black'}`}>
            Accedi
          </Link>
          <Link href="/registrazione/studente" className={`text-sm font-semibold px-5 py-2.5 rounded-2xl transition-all ${dark ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-black shadow-[0_0_22px_rgba(16,185,129,0.5)] hover:shadow-[0_0_32px_rgba(16,185,129,0.7)]' : 'bg-black text-white hover:bg-gray-800'}`}>
            Inizia gratis
          </Link>
        </div>

        {/* Mobile: CTA ridotto + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/login" className={`text-sm font-medium px-3 py-2 ${dark ? 'text-gray-200' : 'text-gray-700'}`}>
            Accedi
          </Link>
          <button
            onClick={() => setOpen(v => !v)}
            className={`p-2 rounded-xl transition-colors ${dark ? 'text-white hover:bg-white/10' : 'text-black hover:bg-gray-100'}`}>
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
