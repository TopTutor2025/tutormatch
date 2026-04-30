import Link from 'next/link'
import { ArrowLeft, Cookie } from 'lucide-react'

export const metadata = { title: 'Cookie Policy – TutorMatch' }

export default function CookiePage() {
  const lastUpdate = '29 aprile 2026'
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Torna alla home
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center">
              <Cookie className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Cookie Policy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">Cookie Policy</h1>
          <p className="text-sm text-gray-400 mt-2">Ultimo aggiornamento: {lastUpdate}</p>

          <div className="prose prose-gray max-w-none mt-8 text-sm leading-relaxed space-y-8">

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">1. Cosa sono i cookie?</h2>
              <p className="text-gray-600">
                I cookie sono piccoli file di testo che i siti web salvano sul dispositivo dell'utente durante la navigazione. Servono a memorizzare preferenze, mantenere sessioni attive e raccogliere informazioni statistiche sull'utilizzo del sito. I cookie non contengono virus e non possono accedere ad altre informazioni sul tuo dispositivo.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">2. Tipologie di cookie utilizzati</h2>

              <div className="space-y-4">
                {/* Tecnici */}
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <p className="font-semibold text-gray-800 text-xs uppercase tracking-wide">Cookie Tecnici Necessari</p>
                    <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Sempre attivi</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-gray-600 text-xs mb-3">Indispensabili per il funzionamento della piattaforma. Non richiedono consenso ai sensi dell'art. 122 D.Lgs. 196/2003.</p>
                    {[
                      { name: 'sb-auth-token', purpose: 'Gestione della sessione autenticata (Supabase)', duration: 'Sessione / 1 anno', party: '1ª parte' },
                      { name: 'student_tutorial_done', purpose: 'Ricorda se lo studente ha già visto il tutorial', duration: 'Persistente', party: '1ª parte' },
                      { name: 'tutor_tutorial_done', purpose: 'Ricorda se il tutor ha già visto il tutorial', duration: 'Persistente', party: '1ª parte' },
                      { name: 'cookie_consent', purpose: 'Salva le preferenze sui cookie espresse dall\'utente', duration: 'Persistente', party: '1ª parte' },
                      { name: 'cookie_consent_date', purpose: 'Data in cui è stato espresso il consenso', duration: 'Persistente', party: '1ª parte' },
                    ].map(cookie => (
                      <div key={cookie.name} className="grid grid-cols-4 gap-2 text-xs bg-white rounded-xl p-3 border border-gray-50">
                        <div><p className="text-gray-400 font-medium mb-0.5">Nome</p><p className="font-mono text-gray-700 text-[11px] break-all">{cookie.name}</p></div>
                        <div className="col-span-2"><p className="text-gray-400 font-medium mb-0.5">Scopo</p><p className="text-gray-600">{cookie.purpose}</p></div>
                        <div><p className="text-gray-400 font-medium mb-0.5">Durata</p><p className="text-gray-600">{cookie.duration}</p></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analitici */}
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <p className="font-semibold text-gray-800 text-xs uppercase tracking-wide">Cookie Analitici</p>
                    <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Consenso richiesto</span>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 text-xs mb-3">Ci permettono di capire come gli utenti utilizzano la piattaforma, quali pagine vengono visitate più spesso e dove si riscontrano problemi. I dati sono aggregati e anonimi.</p>
                    <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
                      ℹ️ Attualmente TutorMatch non utilizza servizi analitici di terze parti (es. Google Analytics). I dati di utilizzo sono raccolti internamente su database Supabase esclusivamente per migliorare il servizio.
                    </div>
                  </div>
                </div>

                {/* Marketing */}
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <p className="font-semibold text-gray-800 text-xs uppercase tracking-wide">Cookie di Marketing</p>
                    <span className="ml-auto text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">Consenso richiesto</span>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 text-xs">
                      Attualmente TutorMatch non utilizza cookie di marketing o di profilazione di terze parti. Questa categoria è riservata per eventuali future integrazioni, che saranno comunicate con apposito aggiornamento della presente Policy.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">3. Cookie di terze parti</h2>
              <p className="text-gray-600 mb-3">Alcune funzionalità della Piattaforma si avvalgono di servizi esterni che possono impostare propri cookie:</p>
              <div className="space-y-2">
                {[
                  { name: 'Stripe', purpose: 'Elaborazione sicura dei pagamenti. Stripe può utilizzare cookie per prevenire frodi e garantire la sicurezza delle transazioni.', link: 'https://stripe.com/it/privacy' },
                  { name: 'Jitsi Meet', purpose: 'Per le lezioni online viene generato un link Jitsi Meet (meet.jit.si). L\'apertura del link è soggetta alla Privacy Policy di 8x8 Inc.', link: 'https://www.8x8.com/terms-and-conditions/privacy-policy' },
                ].map(service => (
                  <div key={service.name} className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-800 text-sm">{service.name}</p>
                      <a href={service.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Privacy Policy ↗</a>
                    </div>
                    <p className="text-xs text-gray-500">{service.purpose}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">4. Come gestire le preferenze</h2>
              <div className="space-y-3 text-gray-600">
                <p>
                  <strong className="text-gray-800">Banner cookie:</strong> Al primo accesso viene mostrato un banner che permette di accettare tutti i cookie, accettare solo quelli necessari o personalizzare le preferenze categoria per categoria.
                </p>
                <p>
                  <strong className="text-gray-800">Modifica preferenze:</strong> Puoi modificare le tue scelte in qualsiasi momento cancellando il cookie <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-[11px]">cookie_consent</code> dal tuo browser: al successivo accesso il banner verrà nuovamente mostrato.
                </p>
                <p>
                  <strong className="text-gray-800">Impostazioni browser:</strong> Puoi bloccare o eliminare i cookie direttamente dalle impostazioni del tuo browser. Tieni presente che la disabilitazione dei cookie tecnici potrebbe compromettere il funzionamento della Piattaforma.
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { name: 'Chrome', link: 'https://support.google.com/chrome/answer/95647' },
                  { name: 'Firefox', link: 'https://support.mozilla.org/it/kb/Gestione%20dei%20cookie' },
                  { name: 'Safari', link: 'https://support.apple.com/it-it/guide/safari/sfri11471/mac' },
                  { name: 'Edge', link: 'https://support.microsoft.com/it-it/windows/eliminare-e-gestire-i-cookie' },
                  { name: 'Opera', link: 'https://help.opera.com/en/latest/web-preferences/#cookies' },
                ].map(b => (
                  <a key={b.name} href={b.link} target="_blank" rel="noopener noreferrer"
                    className="text-center text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition-colors font-medium">
                    {b.name} →
                  </a>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">5. Base giuridica</h2>
              <p className="text-gray-600">
                Il trattamento tramite cookie tecnici si basa sul legittimo interesse del Titolare (art. 6(1)(f) GDPR) e sull'art. 122 D.Lgs. 196/2003. Il trattamento tramite cookie analitici e di marketing si basa sul consenso esplicito dell'Utente (art. 6(1)(a) GDPR), revocabile in qualsiasi momento senza pregiudizio per la liceità del trattamento precedente alla revoca.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">6. Contatti</h2>
              <p className="text-gray-600">
                Per qualsiasi domanda relativa all'utilizzo dei cookie, scrivi a{' '}
                <a href="mailto:privacy@tutormatch.it" className="text-blue-600 hover:underline">privacy@tutormatch.it</a>.
              </p>
            </section>

          </div>

          <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-400">
            <Link href="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link>
            <Link href="/termini" className="hover:text-black transition-colors">Termini e Condizioni</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
