import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'

export const metadata = { title: 'Termini e Condizioni – Proflive' }

export default function TerminiPage() {
  const lastUpdate = '29 aprile 2026'
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Torna alla home
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Contratto utente</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">Termini e Condizioni d&apos;uso</h1>
          <p className="text-sm text-gray-400 mt-2">Ultimo aggiornamento: {lastUpdate}</p>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 leading-relaxed">
            ⚠️ Leggere attentamente prima di utilizzare la piattaforma. L'utilizzo di Proflive implica l'accettazione integrale dei presenti Termini.
          </div>

          <div className="prose prose-gray max-w-none mt-8 text-sm leading-relaxed space-y-8">

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">1. Definizioni</h2>
              <div className="space-y-2 text-gray-600">
                {[
                  { term: 'Piattaforma', def: 'Il sito web e i servizi offerti da Proflive all\'indirizzo tutormatch.it.' },
                  { term: 'Utente', def: 'Chiunque si registri e utilizzi la Piattaforma, sia come Studente che come Tutor.' },
                  { term: 'Studente', def: 'L\'Utente che utilizza la Piattaforma per cercare e prenotare lezioni.' },
                  { term: 'Tutor', def: 'L\'Utente che offre servizi di tutoraggio tramite la Piattaforma.' },
                  { term: 'Slot', def: 'Finestra oraria di 1 ora messa a disposizione dal Tutor per le prenotazioni.' },
                  { term: 'Ore lezione', def: 'Crediti orari acquistati dallo Studente e scalati ad ogni prenotazione confermata.' },
                ].map(item => (
                  <div key={item.term} className="flex gap-2">
                    <span className="font-semibold text-gray-800 flex-shrink-0">«{item.term}»:</span>
                    <span>{item.def}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">2. Accettazione dei Termini</h2>
              <p className="text-gray-600">
                Completando la registrazione, l'Utente dichiara di aver letto, compreso e accettato integralmente i presenti Termini e la Privacy Policy. L'utilizzo della Piattaforma è consentito solo a persone fisiche maggiorenni o a minori con esplicito consenso dei genitori o tutori legali.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">3. Registrazione e account</h2>
              <p className="text-gray-600 mb-3">L'Utente si impegna a:</p>
              <ul className="space-y-1.5 text-gray-600">
                {[
                  'Fornire informazioni veritiere, accurate e aggiornate al momento della registrazione.',
                  'Mantenere riservate le credenziali di accesso e non condividerle con terzi.',
                  'Notificare immediatamente Proflive in caso di accesso non autorizzato al proprio account.',
                  'Non creare account multipli o falsi profili.',
                  'Non impersonare altre persone o entità.',
                ].map(item => (
                  <li key={item} className="flex gap-2">
                    <span className="text-purple-500 flex-shrink-0 mt-0.5">▸</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">4. Abbonamenti e pagamenti (Studenti)</h2>
              <div className="space-y-3 text-gray-600">
                <p><strong className="text-gray-800">Abbonamento:</strong> Per accedere alle prenotazioni, lo Studente deve sottoscrivere un abbonamento mensile o annuale. L'abbonamento si rinnova automaticamente alla scadenza, salvo disdetta effettuata entro 24 ore prima del rinnovo tramite le impostazioni dell'account.</p>
                <p><strong className="text-gray-800">Ore lezione:</strong> Le ore lezione sono acquistabili separatamente e non hanno scadenza. Sono suddivise per grado scolastico (Medie, Superiori, Università) e non trasferibili tra categorie.</p>
                <p><strong className="text-gray-800">Rimborsi:</strong> Le ore lezione vengono rimborsate automaticamente in caso di cancellazione della prenotazione da parte dell'amministratore. Gli abbonamenti non sono rimborsabili salvo vizi della Piattaforma imputabili a Proflive.</p>
                <p><strong className="text-gray-800">Pagamenti:</strong> Tutti i pagamenti sono elaborati tramite Stripe. Proflive non conserva dati di carte di credito.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">5. Prenotazioni</h2>
              <div className="space-y-3 text-gray-600">
                <p><strong className="text-gray-800">Conferma:</strong> La prenotazione è confermata nel momento in cui lo Studente seleziona uno slot disponibile e completa il form di prenotazione. Le ore vengono scalate immediatamente.</p>
                <p><strong className="text-gray-800">Lezioni online:</strong> Un link per la videochiamata viene generato automaticamente. È responsabilità delle parti garantire una connessione internet adeguata.</p>
                <p><strong className="text-gray-800">Lezioni in presenza:</strong> Richiedono 2 slot orari consecutivi (durata 2 ore). L'indirizzo dell'appuntamento viene comunicato allo Studente e al Tutor. Entrambe le parti sono responsabili della puntualità.</p>
                <p><strong className="text-gray-800">Cancellazione:</strong> Le prenotazioni possono essere cancellate dall'amministratore. Proflive si riserva di cancellare prenotazioni in caso di violazione dei presenti Termini.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">6. Obblighi del Tutor</h2>
              <ul className="space-y-1.5 text-gray-600">
                {[
                  'Mantenere aggiornato il profilo con informazioni veritiere su competenze, titoli di studio e indirizzo per le lezioni in presenza.',
                  'Gestire il calendario e rendere disponibili gli slot con congruo anticipo.',
                  'Presentarsi puntuale alle lezioni prenotate, sia online che in presenza.',
                  'Segnare le lezioni come "Completate" entro 48 ore dal loro svolgimento per attivare il processo di pagamento.',
                  'Non richiedere pagamenti diretti agli Studenti al di fuori della Piattaforma.',
                  'Rispettare la riservatezza degli studenti e i relativi dati personali.',
                ].map(item => (
                  <li key={item} className="flex gap-2">
                    <span className="text-purple-500 flex-shrink-0 mt-0.5">▸</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">7. Pagamenti ai Tutor</h2>
              <p className="text-gray-600">
                I Tutor vengono remunerati mensilmente in base alle lezioni segnate come "Completate". L'importo per lezione è stabilito dall'amministratore nella sezione Prezzi della piattaforma. Proflive si riserva di aggiornare le tariffe con preavviso di almeno 30 giorni. Il pagamento avviene tramite bonifico bancario entro il 15 del mese successivo al completamento delle lezioni.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">8. Condotta degli Utenti</h2>
              <p className="text-gray-600 mb-3">È severamente vietato:</p>
              <ul className="space-y-1.5 text-gray-600">
                {[
                  'Pubblicare contenuti offensivi, discriminatori, illegali o lesivi della dignità altrui.',
                  'Tentare di aggirare il sistema di prenotazione o di pagamento della Piattaforma.',
                  'Raccogliere dati personali di altri Utenti senza consenso.',
                  'Utilizzare la Piattaforma per scopi diversi dall\'erogazione e fruizione di servizi di tutoraggio.',
                  'Caricare malware, virus o qualsiasi codice dannoso.',
                  'Effettuare reverse engineering, scraping o accessi non autorizzati ai sistemi.',
                ].map(item => (
                  <li key={item} className="flex gap-2">
                    <span className="text-red-400 flex-shrink-0 mt-0.5">✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">9. Recensioni</h2>
              <p className="text-gray-600">
                Le recensioni devono essere veritiere e basate su esperienze reali. Proflive si riserva di rimuovere recensioni false, offensive o non pertinenti. I Tutor non possono condizionare o richiedere recensioni positive agli Studenti.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">10. Limitazione di responsabilità</h2>
              <p className="text-gray-600">
                Proflive è una piattaforma di intermediazione. Non è responsabile della qualità delle lezioni erogate dai Tutor, né di eventuali danni derivanti dall'incontro tra Studenti e Tutor in presenza. Proflive non garantisce la continuità del servizio e non è responsabile per interruzioni tecniche, perdita di dati o danni indiretti. La responsabilità massima di Proflive nei confronti di ciascun Utente è limitata all'importo pagato negli ultimi 3 mesi di utilizzo del servizio.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">11. Sospensione e cancellazione dell'account</h2>
              <p className="text-gray-600">
                Proflive si riserva di sospendere o cancellare account che violano i presenti Termini, senza preavviso in caso di violazioni gravi. L'Utente può richiedere la cancellazione del proprio account in qualsiasi momento scrivendo a{' '}
                <a href="mailto:astramentis.ltd.ad@gmail.com" className="text-blue-600 hover:underline">astramentis.ltd.ad@gmail.com</a>.
                I dati verranno trattati secondo la Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">12. Legge applicabile e foro competente</h2>
              <p className="text-gray-600">
                I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia relativa all'interpretazione o all'esecuzione dei presenti Termini, le parti si impegnano a tentare una risoluzione amichevole. In mancanza, il foro competente è quello del domicilio del Consumatore, ai sensi del D.Lgs. 206/2005 (Codice del Consumo).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">13. Modifiche ai Termini</h2>
              <p className="text-gray-600">
                Proflive si riserva di modificare i presenti Termini in qualsiasi momento. Le modifiche saranno comunicate agli Utenti registrati via email con almeno 15 giorni di preavviso. Il proseguimento dell'utilizzo della Piattaforma dopo la comunicazione costituisce accettazione dei nuovi Termini.
              </p>
            </section>

          </div>

          <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-400">
            <Link href="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link>
            <Link href="/cookie" className="hover:text-black transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
