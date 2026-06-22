import Link from 'next/link'
import { BookOpen, Video, MapPin, Star, Shield, Clock, ChevronRight, Sparkles, Users, Wallet, CalendarCheck, TrendingUp } from 'lucide-react'
import LandingReviews from '@/components/LandingReviews'
import LandingNavbar from '@/components/LandingNavbar'
import LandingSubjects from '@/components/LandingSubjects'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#060a08] pt-28 pb-16 px-4 md:pt-32 md:pb-24 md:px-6">
        {/* Sfondo: bagliori */}
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-[420px] h-[420px] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* Left: text */}
            <div className="flex-1 min-w-0 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 md:mb-8 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 shadow-[0_0_25px_rgba(168,85,247,0.55)]">
                <Sparkles className="w-3.5 h-3.5" />
                Il marketplace dei tutor più completo d&apos;Italia
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6 md:mb-8">
                <span className="text-white">Trova il tutor</span>
                <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">perfetto per te</span>
              </h1>
              <p className="text-base md:text-xl leading-relaxed mb-6 md:mb-10 max-w-xl mx-auto lg:mx-0">
                <span className="text-emerald-400 font-bold">20+ tutor verificati</span>
                <span className="text-gray-400"> | Online e in presenza | Medie, Superiori e Università</span>
              </p>

              {/* Visual — mobile only, shown inline after description */}
              <div className="block lg:hidden mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent rounded-3xl -rotate-1 scale-105 blur-xl" />
                <div className="relative p-4 space-y-3">
                  {/* Card 1 */}
                  <div className="bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop&crop=faces&auto=format" alt="Sofia Martinelli" className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-gray-900 text-sm">Sofia Martinelli</p>
                        <span className="text-xs bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded-full flex-shrink-0">Online</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Matematica · Fisica · Chimica</p>
                      <div className="flex items-center gap-0.5 mt-1">
                        {[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400 text-xs">★</span>)}
                        <span className="text-xs text-gray-400 ml-1">5.0 (48)</span>
                      </div>
                    </div>
                  </div>
                  {/* Card 2 */}
                  <div className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-3">
                    <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=faces&auto=format" alt="Luca Ferrara" className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-gray-900 text-sm">Luca Ferrara</p>
                        <span className="text-xs bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded-full flex-shrink-0">Presenza</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Italiano · Latino · Storia</p>
                      <div className="flex items-center gap-0.5 mt-1">
                        {[1,2,3,4,5].map(i => <span key={i} className={`text-xs ${i <= 4 ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>)}
                        <span className="text-xs text-gray-400 ml-1">4.8 (31)</span>
                      </div>
                    </div>
                  </div>
                  {/* Chip */}
                  <div className="bg-black text-white rounded-2xl p-3 flex items-center gap-3 shadow-xl">
                    <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Video className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Lezione confermata!</p>
                      <p className="text-xs text-white/60">Link videochiamata pronto · Domani 15:00</p>
                    </div>
                    <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
                <Link href="/registrazione/studente" className="inline-flex items-center justify-center gap-2 text-black font-bold text-base px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:shadow-[0_0_45px_rgba(16,185,129,0.75)] hover:-translate-y-0.5 transition-all">
                  Trova un tutor
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link href="/registrazione/tutor" className="inline-flex items-center justify-center gap-2 border border-white/20 text-white font-bold text-base px-8 py-4 rounded-2xl hover:bg-white/10 transition-all">
                  Diventa tutor
                </Link>
              </div>

              {/* Trust row */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8 md:mt-10 text-sm text-gray-400 justify-center lg:justify-start">
                <span className="inline-flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-400" /> Tutor verificati</span>
                <span className="inline-flex items-center gap-2"><Star className="w-4 h-4 text-emerald-400" /> Recensioni reali</span>
                <span className="inline-flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-400" /> Lezione di prova a 15€</span>
              </div>
            </div>

            {/* Right: visual — hidden on small screens */}
            <div className="hidden lg:block flex-shrink-0 w-[480px] relative">
              {/* Background blob */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/25 via-teal-500/10 to-transparent rounded-3xl -rotate-2 scale-105 blur-xl" />

              <div className="relative p-6 space-y-4">
                {/* Main tutor card */}
                <div className="bg-white rounded-2xl shadow-lg p-5 flex items-center gap-4">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop&crop=faces&auto=format" alt="Sofia Martinelli" className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-900">Sofia Martinelli</p>
                      <span className="text-xs bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded-full">Online</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">Matematica · Fisica · Chimica</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400 text-xs">★</span>)}
                      <span className="text-xs text-gray-400 ml-1">5.0 (48 recensioni)</span>
                    </div>
                  </div>
                </div>

                {/* Second tutor card */}
                <div className="bg-white rounded-2xl shadow-md p-5 flex items-center gap-4 ml-4">
                  <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=faces&auto=format" alt="Luca Ferrara" className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-900">Luca Ferrara</p>
                      <span className="text-xs bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded-full">Presenza</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">Italiano · Latino · Storia</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1,2,3,4,5].map(i => <span key={i} className={`text-xs ${i <= 4 ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>)}
                      <span className="text-xs text-gray-400 ml-1">4.8 (31 recensioni)</span>
                    </div>
                  </div>
                </div>

                {/* Booking confirmation chip */}
                <div className="bg-black text-white rounded-2xl p-4 flex items-center gap-3 shadow-xl mx-2">
                  <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Lezione confermata!</p>
                    <p className="text-xs text-white/60">Link videochiamata pronto · Domani 15:00</p>
                  </div>
                  <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </div>

                {/* Floating badge */}
                <div className="absolute -top-3 -right-3 bg-white border border-gray-100 shadow-lg rounded-2xl px-4 py-2.5 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-bold text-gray-800">Tutor verificati</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* COME FUNZIONA */}
      <section id="come-funziona" className="relative overflow-hidden py-16 md:py-24 px-4 md:px-6 bg-[#060a08]">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[640px] h-[320px] bg-emerald-500/10 blur-[130px] pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 px-4 py-2 rounded-full mb-5">
              <Sparkles className="w-3.5 h-3.5" /> Semplice e veloce
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
              Inizia in <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">3 semplici passi</span>
            </h2>
            <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto">Dalla registrazione alla tua prima lezione in pochi minuti. Nessuna complicazione.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 md:gap-8">
            {[
              { icon: Users, step: '01', title: 'Registrati gratis', desc: 'Crea il tuo account in 2 minuti. Scegli materia, grado scolastico e modalità di lezione.' },
              { icon: Star, step: '02', title: 'Scegli il tuo tutor', desc: 'Esplora i profili, leggi le recensioni reali e controlla la disponibilità nel calendario.' },
              { icon: BookOpen, step: '03', title: 'Prenota e studia', desc: 'Scegli lo slot che preferisci, ricevi subito il link per la videochiamata e inizia a studiare.' },
            ].map((item) => (
              <div key={item.step}
                className="group relative bg-white/[0.04] rounded-3xl p-7 md:p-8 border border-white/10 hover:border-emerald-400/30 hover:bg-white/[0.06] hover:-translate-y-1 transition-all duration-300">
                <span className="absolute top-5 right-6 text-6xl font-black text-white/[0.06] group-hover:text-emerald-400/15 transition-colors select-none">{item.step}</span>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-6 shadow-[0_0_22px_rgba(16,185,129,0.35)]">
                  <item.icon className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-sm md:text-base text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA conversione */}
          <div className="mt-12 md:mt-16 relative rounded-3xl overflow-hidden border border-emerald-400/25 bg-gradient-to-br from-emerald-500/10 to-transparent p-8 md:p-10 text-center">
            <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3">Prova senza pensieri: la prima lezione a soli 15€</h3>
            <p className="text-gray-400 max-w-2xl mx-auto mb-7">Una lezione di prova online, valida per ogni grado e <strong className="text-white">senza abbonamento</strong>. Se ti trovi bene, continui con il piano che preferisci.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
              <Link href="/registrazione/studente" className="inline-flex items-center justify-center gap-2 text-black font-bold text-base px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:shadow-[0_0_45px_rgba(16,185,129,0.75)] hover:-translate-y-0.5 transition-all">
                Inizia ora
                <ChevronRight className="w-5 h-5" />
              </Link>
              <span className="inline-flex items-center gap-2 text-sm text-gray-400">
                <Shield className="w-4 h-4 text-emerald-400" /> Nessun vincolo · disdici quando vuoi
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative overflow-hidden py-16 md:py-24 px-4 md:px-6 bg-[#060a08]">
        <div className="absolute bottom-0 right-0 w-[520px] h-[320px] bg-teal-500/10 blur-[130px] pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
                Tutto quello che ti serve,<br />
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">in un unico posto</span>
              </h2>
              <div className="space-y-6">
                {[
                  { icon: Video, title: 'Lezioni online in videochiamata', desc: 'Ogni prenotazione genera automaticamente un link dedicato per la videochiamata.' },
                  { icon: MapPin, title: 'Tutor vicino a te', desc: 'Cerca tutor disponibili per lezioni in presenza nel raggio di 5km dalla tua posizione.' },
                  { icon: Shield, title: 'Pagamenti sicuri', desc: 'Abbonamento mensile o annuale, lezione di prova e pacchetto spot senza abbonamento.' },
                  { icon: Clock, title: 'Flessibilità totale', desc: 'Prenota quando vuoi. I tutor gestiscono la loro disponibilità in autonomia.' },
                ].map((f) => (
                  <div key={f.title} className="flex gap-4">
                    <div className="w-10 h-10 bg-emerald-400/10 border border-emerald-400/20 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      <f.icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{f.title}</h4>
                      <p className="text-sm text-gray-400">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              {/* Background blob (stile hero) */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/25 via-teal-500/10 to-transparent rounded-3xl rotate-2 scale-105 blur-xl" />

              <div className="relative p-6 space-y-4">
                {/* Main tutor card */}
                <div className="bg-white rounded-2xl shadow-lg p-5 flex items-center gap-4">
                  <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&fit=crop&crop=faces&auto=format" alt="Giulia Romano" className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-900">Giulia Romano</p>
                      <span className="text-xs bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded-full">Online</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">Inglese · Spagnolo · Francese</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400 text-xs">★</span>)}
                      <span className="text-xs text-gray-400 ml-1">4.9 (52 recensioni)</span>
                    </div>
                  </div>
                </div>

                {/* Second tutor card */}
                <div className="bg-white rounded-2xl shadow-md p-5 flex items-center gap-4 ml-4">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=faces&auto=format" alt="Davide Esposito" className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-900">Davide Esposito</p>
                      <span className="text-xs bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded-full">Presenza</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">Storia · Filosofia · Latino</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1,2,3,4,5].map(i => <span key={i} className={`text-xs ${i <= 4 ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>)}
                      <span className="text-xs text-gray-400 ml-1">4.7 (28 recensioni)</span>
                    </div>
                  </div>
                </div>

                {/* Booking confirmation chip */}
                <div className="bg-black text-white rounded-2xl p-4 flex items-center gap-3 shadow-xl mx-2">
                  <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Lezione confermata!</p>
                    <p className="text-xs text-white/60">Link videochiamata pronto · Domani 15:00</p>
                  </div>
                  <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </div>

                {/* Floating badge */}
                <div className="absolute -top-3 -right-3 bg-white border border-gray-100 shadow-lg rounded-2xl px-4 py-2.5 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-bold text-gray-800">Tutor verificati</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MATERIE */}
      <LandingSubjects />

      {/* PREZZI */}
      <section id="prezzi" className="relative overflow-hidden py-16 md:py-24 px-4 md:px-6 bg-[#060a08]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[640px] h-[320px] bg-emerald-500/10 blur-[130px] pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
              Prezzi <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">trasparenti</span>
            </h2>
            <p className="text-base md:text-lg text-gray-400">Nessuna sorpresa. Paghi solo quello che usi.</p>
          </div>

          {/* Riga 1: Lezione di prova + Ore lezione */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto">
            {/* Lezione di prova */}
            <div className="rounded-3xl p-8 bg-white/[0.04] border border-emerald-400/25">
              <span className="inline-flex items-center text-xs font-bold uppercase tracking-wide bg-emerald-400/15 text-emerald-300 px-3 py-1 rounded-full">Lezione di prova</span>
              <div className="text-4xl font-extrabold text-white mt-4 mb-1">€15</div>
              <p className="text-sm text-gray-400 mb-4">una tantum · una per account</p>
              <p className="text-sm text-gray-300 leading-relaxed">
                1 lezione <strong className="text-white">online da 1 ora</strong>, valida per ogni grado e prenotabile <strong className="text-white">senza abbonamento</strong>. Per provare il servizio.
              </p>
            </div>
            {/* Ore lezione */}
            <div className="rounded-3xl p-8 bg-white/[0.04] border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">Ore lezione</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center bg-white/5 rounded-2xl px-4 py-3">
                  <span className="text-sm font-medium text-gray-300">Medie</span>
                  <span className="font-bold text-white">€12,50/h</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 rounded-2xl px-4 py-3">
                  <span className="text-sm font-medium text-gray-300">Superiori</span>
                  <span className="font-bold text-white">€12,50/h</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 rounded-2xl px-4 py-3">
                  <span className="text-sm font-medium text-gray-300">Università</span>
                  <span className="font-bold text-white">€15,00/h</span>
                </div>
              </div>
              <p className="text-xs text-gray-500">Acquistabili con abbonamento attivo</p>
            </div>
          </div>

          {/* Riga 2: Abbonamenti */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto mt-6 md:mt-8">
            {/* Mensile */}
            <div className="rounded-3xl p-8 bg-white/[0.04] border border-white/10">
              <h3 className="text-lg font-bold text-white mb-2">Mensile</h3>
              <div className="text-4xl font-extrabold text-white mb-1">€14,99<span className="text-lg font-normal text-gray-500">/mese</span></div>
              <p className="text-sm text-gray-400 mb-6">Accesso alla piattaforma per un mese</p>
              <ul className="space-y-3 text-sm text-gray-300">
                {['Accesso completo ai tutor', 'Chat con i tutor', 'Ricerca avanzata', 'Storico lezioni'].map(f => (
                  <li key={f} className="flex items-center gap-2"><span className="text-emerald-400">✓</span>{f}</li>
                ))}
              </ul>
            </div>
            {/* Annuale — evidenziato */}
            <div className="relative rounded-3xl p-8 bg-white/[0.06] border border-emerald-400/40 shadow-[0_0_45px_rgba(16,185,129,0.18)] overflow-hidden">
              <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-400 to-teal-400 text-black text-xs font-bold px-3 py-1 rounded-full">Risparmia 44%</div>
              <h3 className="text-lg font-bold text-white mb-2">Annuale</h3>
              <div className="text-4xl font-extrabold text-white mb-1">€8,33<span className="text-lg font-normal text-gray-500">/mese</span></div>
              <p className="text-gray-400 text-sm mb-1">€99,99 fatturati una volta all'anno</p>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-gray-500 line-through text-sm">€14,99/mese</span>
                <span className="bg-emerald-400/15 text-emerald-300 text-xs font-bold px-2 py-0.5 rounded-full">risparmi €79,89</span>
              </div>
              <ul className="space-y-3 text-sm text-gray-300">
                {['Tutto del mensile', 'Valutazioni DSA', 'Supporto dedicato', 'Rimborso ore annullate'].map(f => (
                  <li key={f} className="flex items-center gap-2"><span className="text-emerald-400">✓</span>{f}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Riga 3: Pacchetto Spot (card lunga) */}
          <div className="max-w-3xl mx-auto mt-6 md:mt-8">
            <div className="rounded-3xl p-8 bg-white/[0.04] border border-pink-400/30 flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
              <div className="flex-1">
                <span className="inline-flex items-center text-xs font-bold uppercase tracking-wide bg-pink-500/15 text-pink-300 px-3 py-1 rounded-full">Senza abbonamento</span>
                <h3 className="text-lg font-bold text-white mt-3 mb-1">Pacchetto Spot</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Pacchetto unico da 15 ore valide per <strong className="text-white">ogni grado</strong> e utilizzabili <strong className="text-white">senza abbonamento attivo</strong>.
                </p>
              </div>
              <div className="text-center sm:text-right flex-shrink-0 sm:pl-6 sm:border-l border-white/10">
                <div className="text-4xl font-extrabold text-white">€300</div>
                <p className="text-sm text-gray-400 mt-0.5">15 ore · 20€/ora</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RECENSIONI */}
      <LandingReviews />

      {/* DIVENTA TUTOR */}
      <section id="tutor" className="relative overflow-hidden py-16 md:py-24 px-4 md:px-6 bg-[#060a08]">
        <div className="absolute -bottom-20 left-1/4 w-[560px] h-[320px] bg-emerald-500/10 blur-[140px] pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: testo */}
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-xs font-semibold px-4 py-2 rounded-full mb-6 md:mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              Per i tutor
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 md:mb-6 leading-tight text-white">
              Guadagna insegnando<br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">ciò che ami</span>
            </h2>
            <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-6 md:mb-8">
              Registrati come tutor, imposta la tua disponibilità e ricevi prenotazioni automaticamente.
              Pagamento mensile garantito, zero commissioni nascoste.
            </p>

            {/* Mini vantaggi */}
            <div className="grid sm:grid-cols-3 gap-3 mb-8">
              {[
                { icon: Wallet, label: 'Pagamento mensile' },
                { icon: Shield, label: 'Zero commissioni' },
                { icon: CalendarCheck, label: 'Orari liberi' },
              ].map(v => (
                <div key={v.label} className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3">
                  <v.icon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-gray-200">{v.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 md:gap-4">
              <Link href="/registrazione/tutor" className="inline-flex items-center justify-center gap-2 text-black font-bold text-base px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:shadow-[0_0_45px_rgba(16,185,129,0.75)] hover:-translate-y-0.5 transition-all">
                Inizia ora come tutor
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link href="/faq-tutor" className="inline-flex items-center justify-center gap-2 text-gray-300 hover:text-white font-semibold text-sm border border-white/20 hover:border-white/40 px-6 py-4 rounded-2xl transition-all">
                Leggi le FAQ tutor
              </Link>
            </div>
          </div>

          {/* Right: proiezione guadagni */}
          <div className="rounded-3xl p-6 md:p-8 bg-white/[0.04] border border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-bold text-white">Proiezione guadagni</p>
                <p className="text-xs text-gray-400">Stima mensile in base alle ore svolte</p>
              </div>
            </div>

            <div className="space-y-5 mt-6">
              {[
                { label: 'Part-time', hint: '~10 ore/sett', min: 500, max: 900 },
                { label: 'Costante', hint: '~20 ore/sett', min: 1000, max: 1600 },
                { label: 'Alta disponibilità', hint: '~30 ore/sett', min: 1800, max: 2400 },
              ].map(t => {
                const MAXE = 2400
                const left = (t.min / MAXE) * 100
                const width = ((t.max - t.min) / MAXE) * 100
                return (
                  <div key={t.label}>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-sm font-semibold text-white">{t.label} <span className="text-xs font-normal text-gray-500">· {t.hint}</span></span>
                      <span className="text-sm font-bold text-emerald-400">€{t.min.toLocaleString('it-IT')}–{t.max.toLocaleString('it-IT')}</span>
                    </div>
                    <div className="relative h-3 rounded-full bg-white/5">
                      <div className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
                        style={{ left: `${left}%`, width: `${width}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Asse */}
            <div className="flex justify-between text-[11px] text-gray-500 mt-3">
              <span>€0</span>
              <span>€1.200</span>
              <span>€2.400</span>
            </div>

            <p className="text-xs text-gray-500 mt-5 leading-relaxed">
              Stime indicative basate sulle ore di lezione effettivamente completate. I compensi reali dipendono dalla tua disponibilità e dalle prenotazioni ricevute.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black border-t border-white/10 text-white py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-10 md:mb-12">
            <div className="col-span-2 md:col-span-1">
              <span className="text-xl font-extrabold tracking-tight block mb-4">
                <span className="text-white">prof</span>
                <span className="italic bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">live</span>
                <span className="text-white">.app</span>
              </span>
              <p className="text-gray-400 text-sm leading-relaxed">La piattaforma che connette studenti e tutor per lezioni online e in presenza.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Studenti</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/registrazione/studente" className="hover:text-white transition-colors">Registrati</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Accedi</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Tutor</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/registrazione/tutor" className="hover:text-white transition-colors">Diventa tutor</Link></li>
                <li><Link href="/faq-tutor" className="hover:text-white transition-colors">FAQ Tutor</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Area tutor</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legale</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/termini" className="hover:text-white transition-colors">Termini e condizioni</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/cookie" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 md:pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">© 2026 proflive.app · Tutti i diritti riservati.</p>
            <p className="text-gray-600 text-xs">Designed with ♥ in Italia</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
