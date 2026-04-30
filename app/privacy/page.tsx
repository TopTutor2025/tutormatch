import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export const metadata = { title: 'Privacy Policy – TutorMatch' }

export default function PrivacyPage() {
  const lastUpdate = '29 aprile 2026'
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Torna alla home
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Privacy Policy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">Informativa sulla Privacy</h1>
          <p className="text-sm text-gray-400 mt-2">Ultimo aggiornamento: {lastUpdate}</p>

          <div className="prose prose-gray max-w-none mt-8 text-sm leading-relaxed space-y-8">

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">1. Titolare del trattamento</h2>
              <p className="text-gray-600">
                Il titolare del trattamento dei dati personali è <strong>TutorMatch</strong>, raggiungibile all'indirizzo email{' '}
                <a href="mailto:privacy@tutormatch.it" className="text-blue-600 hover:underline">privacy@tutormatch.it</a>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">2. Dati raccolti</h2>
              <p className="text-gray-600 mb-3">Raccogliamo le seguenti categorie di dati personali:</p>
              <ul className="space-y-2 text-gray-600">
                {[
                  { title: 'Dati di registrazione', desc: 'Nome, cognome, indirizzo email, numero di telefono, password (cifrata).' },
                  { title: 'Dati di profilo tutor', desc: 'Bio, materie insegnate, gradi scolastici, modalità di lezione, indirizzo, coordinate geografiche (per la ricerca in presenza).' },
                  { title: 'Dati di utilizzo', desc: 'Prenotazioni effettuate, lezioni completate, ore acquistate, recensioni pubblicate.' },
                  { title: 'Dati di pagamento', desc: 'Elaborati tramite Stripe. Non conserviamo dati di carte di credito o IBAN: questi sono gestiti direttamente da Stripe Inc. nel rispetto del PCI DSS.' },
                  { title: 'Dati tecnici', desc: 'Indirizzo IP, tipo di browser, pagine visitate (solo se hai accettato i cookie analitici).' },
                ].map(item => (
                  <li key={item.title} className="flex gap-2">
                    <span className="text-blue-500 mt-0.5 flex-shrink-0">▸</span>
                    <span><strong className="text-gray-800">{item.title}:</strong> {item.desc}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">3. Finalità e basi giuridiche del trattamento</h2>
              <div className="space-y-3">
                {[
                  { base: 'Esecuzione contrattuale', desc: 'Gestione dell\'account, prenotazioni, lezioni, pagamenti ai tutor.' },
                  { base: 'Legittimo interesse', desc: 'Prevenzione di frodi, sicurezza della piattaforma, miglioramento del servizio.' },
                  { base: 'Consenso', desc: 'Invio di comunicazioni promozionali, utilizzo di cookie analitici e di marketing (revocabile in qualsiasi momento).' },
                  { base: 'Obbligo legale', desc: 'Conservazione di documenti fiscali e contabili secondo la normativa italiana.' },
                ].map(item => (
                  <div key={item.base} className="bg-gray-50 rounded-2xl p-4">
                    <p className="font-semibold text-gray-800 text-xs uppercase tracking-wide">{item.base}</p>
                    <p className="text-gray-600 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">4. Conservazione dei dati</h2>
              <p className="text-gray-600">
                I dati dell'account vengono conservati per tutta la durata del rapporto contrattuale e per i 10 anni successivi alla sua cessazione, in conformità con gli obblighi fiscali italiani. I dati di log tecnico vengono conservati per massimo 12 mesi. I dati relativi ai pagamenti sono conservati per 10 anni ai sensi del D.Lgs. 231/2002.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">5. Destinatari dei dati</h2>
              <p className="text-gray-600 mb-3">I tuoi dati possono essere condivisi con:</p>
              <ul className="space-y-1 text-gray-600 list-disc list-inside">
                <li><strong>Supabase Inc.</strong> – infrastruttura di database e autenticazione (USA, con garanzie adeguate ex art. 46 GDPR)</li>
                <li><strong>Stripe Inc.</strong> – gestione pagamenti (USA, certificato PCI DSS)</li>
                <li><strong>Vercel Inc.</strong> – hosting dell'applicazione web</li>
                <li>Autorità competenti, su richiesta motivata di legge</li>
              </ul>
              <p className="text-gray-600 mt-3">Non vendiamo, affittiamo o cediamo i dati a terzi per scopi commerciali.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">6. I tuoi diritti (GDPR)</h2>
              <p className="text-gray-600 mb-3">Ai sensi del Regolamento UE 2016/679 hai diritto a:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Accedere ai tuoi dati (art. 15)',
                  'Rettificare i dati inesatti (art. 16)',
                  'Cancellare i dati ("diritto all\'oblio") (art. 17)',
                  'Limitare il trattamento (art. 18)',
                  'Portabilità dei dati (art. 20)',
                  'Opporti al trattamento (art. 21)',
                  'Revocare il consenso in qualsiasi momento',
                  'Proporre reclamo all\'Autorità Garante',
                ].map(right => (
                  <div key={right} className="flex items-start gap-2 text-gray-600">
                    <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
                    <span>{right}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-600 mt-3">
                Per esercitare i tuoi diritti scrivi a{' '}
                <a href="mailto:privacy@tutormatch.it" className="text-blue-600 hover:underline">privacy@tutormatch.it</a>.
                Risponderemo entro 30 giorni.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">7. Sicurezza</h2>
              <p className="text-gray-600">
                I dati sono trasmessi tramite connessioni cifrate (TLS/HTTPS). Le password sono archiviate con hashing sicuro. L'accesso ai dati è limitato al personale autorizzato. Utilizziamo l'autenticazione a due fattori per gli accessi amministrativi.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">8. Modifiche alla presente informativa</h2>
              <p className="text-gray-600">
                Ci riserviamo di aggiornare questa informativa. In caso di modifiche sostanziali, gli utenti registrati saranno notificati via email. La versione aggiornata sarà sempre disponibile su questa pagina con la data dell'ultimo aggiornamento.
              </p>
            </section>

          </div>

          <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-400">
            <Link href="/termini" className="hover:text-black transition-colors">Termini e Condizioni</Link>
            <Link href="/cookie" className="hover:text-black transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
