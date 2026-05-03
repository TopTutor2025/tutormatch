import Link from 'next/link'
import { BookOpen, Video, MapPin, Star, Shield, Clock, ChevronRight, Sparkles, Users } from 'lucide-react'
import LandingReviews from '@/components/LandingReviews'
import LandingNavbar from '@/components/LandingNavbar'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />

      {/* HERO */}
      <section className="pt-28 pb-16 px-4 md:pt-32 md:pb-24 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* Left: text */}
            <div className="flex-1 min-w-0 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-pink-50 border border-pink-200 text-pink-700 text-xs font-semibold px-4 py-2 rounded-full mb-6 md:mb-8">
                <Sparkles className="w-3.5 h-3.5" />
                Il marketplace dei tutor più completo d&apos;Italia
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-black leading-[1.05] mb-6 md:mb-8">
                Trova il tutor
                <br />
                <span className="relative">
                  <span className="relative z-10">perfetto</span>
                  <span className="absolute bottom-1 md:bottom-2 left-0 right-0 h-3 md:h-4 bg-pink-200/60 -rotate-1 rounded" />
                </span>
                {" "}per te
              </h1>
              <p className="text-base md:text-xl text-gray-500 leading-relaxed mb-6 md:mb-10 max-w-xl mx-auto lg:mx-0">
                Lezioni personalizzate online e in presenza. Studenti delle medie, superiori e università.
                Prenota in pochi clic il tutor che fa per te.
              </p>

              {/* Visual — mobile only, shown inline after description */}
              <div className="block lg:hidden mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-pink-50 to-white rounded-3xl -rotate-1 scale-105" />
                <div className="relative p-4 space-y-3">
                  {/* Card 1 */}
                  <div className="bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-300 to-pink-500 flex items-center justify-center text-white text-base font-bold flex-shrink-0">S</div>
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
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center text-white text-base font-bold flex-shrink-0">L</div>
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
                <Link href="/registrazione/studente" className="inline-flex items-center justify-center gap-2 bg-black text-white font-bold text-base px-8 py-4 rounded-2xl hover:bg-gray-800 transition-all hover:-translate-y-0.5 hover:shadow-lg">
                  Trova un tutor
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link href="/registrazione/tutor" className="inline-flex items-center justify-center gap-2 border-2 border-black text-black font-bold text-base px-8 py-4 rounded-2xl hover:bg-gray-50 transition-all">
                  Diventa tutor
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 md:gap-8 mt-10 md:mt-14">
                {[
                  { value: '500+', label: 'Tutor verificati' },
                  { value: '20+', label: 'Materie disponibili' },
                  { value: '4.9★', label: 'Rating medio' },
                ].map((s) => (
                  <div key={s.label} className="text-center lg:text-left">
                    <div className="text-2xl md:text-3xl font-extrabold text-black">{s.value}</div>
                    <div className="text-xs md:text-sm text-gray-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: visual — hidden on small screens */}
            <div className="hidden lg:block flex-shrink-0 w-[480px] relative">
              {/* Background blob */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-pink-50 to-white rounded-3xl -rotate-2 scale-105" />

              <div className="relative p-6 space-y-4">
                {/* Main tutor card */}
                <div className="bg-white rounded-2xl shadow-lg p-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-300 to-pink-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">S</div>
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
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">L</div>
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
      <section id="come-funziona" className="py-16 md:py-24 px-4 md:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-4">Come funziona</h2>
            <p className="text-base md:text-lg text-gray-500">Tre semplici passi per iniziare</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 md:gap-8">
            {[
              { icon: Users, step: '01', title: 'Registrati', desc: 'Crea il tuo account in 2 minuti. Scegli materia, grado scolastico e modalità di lezione.' },
              { icon: Star, step: '02', title: 'Scegli il tuo tutor', desc: 'Esplora i profili, leggi le recensioni e controlla la disponibilità nel calendario del tutor.' },
              { icon: BookOpen, step: '03', title: 'Prenota e studia', desc: 'Prenota lo slot che preferisci, ricevi il link videochiamata per le lezioni online e inizia a studiare.' },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4 mb-5 md:mb-6">
                  <span className="text-5xl font-black text-pink-300">{item.step}</span>
                  <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-black mb-3">{item.title}</h3>
                <p className="text-sm md:text-base text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-6">
                Tutto quello che ti serve,<br />in un unico posto
              </h2>
              <div className="space-y-6">
                {[
                  { icon: Video, title: 'Lezioni online in videochiamata', desc: 'Ogni prenotazione genera automaticamente un link dedicato per la videochiamata.' },
                  { icon: MapPin, title: 'Tutor vicino a te', desc: 'Cerca tutor disponibili per lezioni in presenza nel raggio di 5km dalla tua posizione.' },
                  { icon: Shield, title: 'Pagamenti sicuri', desc: 'Abbonamento mensile o annuale, più ore acquistabili singolarmente.' },
                  { icon: Clock, title: 'Flessibilità totale', desc: 'Prenota quando vuoi. I tutor gestiscono la loro disponibilità in autonomia.' },
                ].map((f) => (
                  <div key={f.title} className="flex gap-4">
                    <div className="w-10 h-10 bg-pink-50 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      <f.icon className="w-5 h-5 text-pink-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-black mb-1">{f.title}</h4>
                      <p className="text-sm text-gray-500">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-white rounded-3xl p-6 md:p-8 border border-pink-100">
              <div className="space-y-4">
                {/* Simulated tutor cards */}
                {[
                  { name: 'Marco R.', subject: 'Matematica', grade: 'Superiori', rating: 5, reviews: 34, mode: 'Online' },
                  { name: 'Giulia T.', subject: 'Inglese', grade: 'Università', rating: 5, reviews: 67, mode: 'Online e Presenza' },
                  { name: 'Andrea B.', subject: 'Fisica', grade: 'Superiori', rating: 4, reviews: 21, mode: 'Online' },
                ].map((tutor) => (
                  <div key={tutor.name} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {tutor.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-black">{tutor.name}</p>
                        <p className="text-xs text-gray-400">{tutor.subject} · {tutor.grade}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                        <span className="text-xs font-medium">{tutor.rating} ({tutor.reviews})</span>
                      </div>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{tutor.mode}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PREZZI */}
      <section id="prezzi" className="py-16 md:py-24 px-4 md:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-4">Prezzi trasparenti</h2>
            <p className="text-base md:text-lg text-gray-500">Nessuna sorpresa. Paghi solo quello che usi.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
            {/* Abbonamento Mensile */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-black mb-2">Mensile</h3>
              <div className="text-4xl font-extrabold text-black mb-1">€14,99<span className="text-lg font-normal text-gray-400">/mese</span></div>
              <p className="text-sm text-gray-500 mb-6">Accesso alla piattaforma per un mese</p>
              <ul className="space-y-3 text-sm text-gray-600">
                {['Accesso completo ai tutor', 'Chat con i tutor', 'Ricerca avanzata', 'Storico lezioni'].map(f => (
                  <li key={f} className="flex items-center gap-2"><span className="text-green-500">✓</span>{f}</li>
                ))}
              </ul>
            </div>
            {/* Abbonamento Annuale */}
            <div className="bg-black rounded-3xl p-8 border border-black shadow-lg relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full">Migliore offerta</div>
              <h3 className="text-lg font-bold text-white mb-2">Annuale</h3>
              <div className="text-4xl font-extrabold text-white mb-1">€99,99<span className="text-lg font-normal text-gray-400">/anno</span></div>
              <p className="text-sm text-gray-400 mb-6">Risparmia €79,89 rispetto al mensile</p>
              <ul className="space-y-3 text-sm text-gray-300">
                {['Tutto del mensile', 'Valutazioni DSA', 'Supporto dedicato', 'Rimborso ore annullate'].map(f => (
                  <li key={f} className="flex items-center gap-2"><span className="text-pink-400">✓</span>{f}</li>
                ))}
              </ul>
            </div>
            {/* Ore lezione */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-black mb-2">Ore lezione</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center bg-gray-50 rounded-2xl px-4 py-3">
                  <span className="text-sm font-medium">Medie</span>
                  <span className="font-bold">€10,00/h</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 rounded-2xl px-4 py-3">
                  <span className="text-sm font-medium">Superiori</span>
                  <span className="font-bold">€10,00/h</span>
                </div>
                <div className="flex justify-between items-center bg-pink-50 rounded-2xl px-4 py-3 border border-pink-100">
                  <span className="text-sm font-medium">Università</span>
                  <span className="font-bold text-pink-700">€12,50/h</span>
                </div>
              </div>
              <p className="text-xs text-gray-400">Acquistabili singolarmente, valide con abbonamento attivo</p>
            </div>
          </div>
        </div>
      </section>

      {/* RECENSIONI */}
      <LandingReviews />

      {/* DIVENTA TUTOR */}
      <section id="tutor" className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-gray-900 to-black rounded-3xl p-8 md:p-16 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-8 right-8 w-64 h-64 bg-pink-300 rounded-full blur-3xl" />
              <div className="absolute bottom-8 left-8 w-48 h-48 bg-yellow-300 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full mb-6 md:mb-8">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                Per i tutor
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4 md:mb-6 leading-tight">
                Guadagna insegnando<br />ciò che ami
              </h2>
              <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-6 md:mb-8">
                Registrati come tutor, imposta la tua disponibilità e ricevi prenotazioni automaticamente.
                Pagamento mensile garantito, zero commissioni nascoste.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 md:gap-4">
                <Link href="/registrazione/tutor" className="inline-flex items-center justify-center gap-2 bg-white text-black font-bold text-base px-8 py-4 rounded-2xl hover:bg-gray-100 transition-all hover:-translate-y-0.5">
                  Inizia ora come tutor
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link href="/faq-tutor" className="inline-flex items-center justify-center gap-2 text-white/80 hover:text-white font-semibold text-sm border border-white/30 hover:border-white/60 px-6 py-4 rounded-2xl transition-all">
                  Leggi le FAQ tutor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-10 md:mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-bold">Proflive</span>
              </div>
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
          <div className="border-t border-gray-800 pt-6 md:pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">© 2025 Proflive. Tutti i diritti riservati.</p>
            <p className="text-gray-600 text-xs">Designed with ♥ in Italia</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
