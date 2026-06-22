'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import LanguageSwitcher from './LanguageSwitcher'

export default function LandingNavbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 20) }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const solid = scrolled || open

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${solid ? 'bg-black/70 backdrop-blur-md' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0 -ml-1">
          <span className="text-2xl font-extrabold tracking-tight">
            <span className="text-white">prof</span>
            <span className="italic bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">live</span>
            <span className="text-white">.app</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-200">
          <a href="#come-funziona" className="transition-colors hover:text-white">Come funziona</a>
          <a href="#prezzi" className="transition-colors hover:text-white">Prezzi</a>
          <a href="#tutor" className="transition-colors hover:text-white">Diventa Tutor</a>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <Link href="/login" className="text-sm font-medium transition-colors px-4 py-2 text-gray-200 hover:text-white">
            Accedi
          </Link>
          <Link href="/registrazione/studente" className="text-sm font-semibold px-5 py-2.5 rounded-2xl transition-all bg-gradient-to-r from-emerald-400 to-teal-400 text-black shadow-[0_0_22px_rgba(16,185,129,0.5)] hover:shadow-[0_0_32px_rgba(16,185,129,0.7)]">
            Inizia gratis
          </Link>
        </div>

        {/* Mobile: CTA ridotto + hamburger */}
        <div className="flex md:hidden items-center gap-1">
          <LanguageSwitcher />
          <Link href="/login" className="text-sm font-medium px-2 py-2 text-gray-200">
            Accedi
          </Link>
          <button
            onClick={() => setOpen(v => !v)}
            className="p-2 rounded-xl transition-colors text-white hover:bg-white/10">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-black/80 backdrop-blur-md px-5 py-4 space-y-1">
          <a href="#come-funziona" onClick={() => setOpen(false)}
            className="block text-sm font-medium text-gray-200 hover:text-white py-3 border-b border-white/10 transition-colors">
            Come funziona
          </a>
          <a href="#prezzi" onClick={() => setOpen(false)}
            className="block text-sm font-medium text-gray-200 hover:text-white py-3 border-b border-white/10 transition-colors">
            Prezzi
          </a>
          <a href="#tutor" onClick={() => setOpen(false)}
            className="block text-sm font-medium text-gray-200 hover:text-white py-3 border-b border-white/10 transition-colors">
            Diventa Tutor
          </a>
          <div className="pt-3">
            <Link href="/registrazione/studente" onClick={() => setOpen(false)}
              className="block w-full text-center bg-gradient-to-r from-emerald-400 to-teal-400 text-black text-sm font-semibold px-5 py-3 rounded-2xl">
              Inizia gratis
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
