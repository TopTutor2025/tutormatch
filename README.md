# TutorMatch – Guida al Setup Completo

Marketplace di matching studenti-tutor con lezioni online e in presenza.

---

## Stack tecnologico

- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS
- **Backend/DB**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Deploy**: Vercel (via GitHub)

---

## STEP 1 – Crea il progetto Supabase

1. Vai su [supabase.com](https://supabase.com) e crea un account
2. Clicca **New project**
3. Scegli nome `tutormatch`, scegli una password per il DB, seleziona la regione (Europe West)
4. Aspetta che il progetto sia pronto (~2 minuti)

---

## STEP 2 – Configura il database

1. Nel pannello Supabase vai su **SQL Editor**
2. Clicca **+ New query**
3. Copia e incolla tutto il contenuto del file `supabase/migrations/001_schema.sql`
4. Clicca **Run** (il triangolo verde)
5. Verifica che non ci siano errori nella console

---

## STEP 3 – Configura lo Storage

1. Nel pannello Supabase vai su **Storage**
2. Clicca **New bucket**
3. Nome: `avatars`, spunta **Public bucket**
4. Clicca **Save**

---

## STEP 4 – Crea l'utente Admin

1. Nel pannello Supabase vai su **Authentication > Users**
2. Clicca **Add user > Create new user**
3. Inserisci email e password per l'admin
4. Clicca **Create user**
5. Vai su **SQL Editor** e lancia questa query (sostituisci con l'ID trovato):

```sql
SELECT id FROM auth.users WHERE email = 'tuamail@admin.com';

INSERT INTO profiles (id, role, first_name, last_name, email)
VALUES ('ID_UTENTE_QUI', 'admin', 'Admin', 'TutorMatch', 'tuamail@admin.com');
```

---

## STEP 5 – Configura le variabili d'ambiente

1. Nel pannello Supabase vai su **Settings > API**
2. Copia **Project URL**, **anon public key**, **service_role key**
3. Apri `.env.local` e incolla i valori:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ NON committare mai `.env.local` su GitHub! Il .gitignore lo esclude già.

---

## STEP 6 – Avvia il progetto in locale

```bash
cd "C:\Users\Medicina\Desktop\servizi online\tutormatch"
npm run dev
```

Il sito sarà disponibile su **http://localhost:3000**

---

## STEP 7 – Pubblica su GitHub

1. Apri VS Code, premi `Ctrl+Shift+G` (Source Control)
2. Clicca "Initialize Repository"
3. Stage tutti i file, scrivi "Initial commit", fai commit
4. Vai su github.com, crea un repository privato `tutormatch`
5. Segui le istruzioni per il push

---

## STEP 8 – Deploy su Vercel

1. Vai su [vercel.com](https://vercel.com), collegati con GitHub
2. Clicca **New Project** → importa il repo `tutormatch`
3. Aggiungi le 3 variabili d'ambiente
4. Clicca **Deploy**

---

## STEP 9 – Pagamenti mensili automatici (pg_cron)

Nel pannello Supabase → **Database > Extensions** → abilita `pg_cron`, poi:

```sql
SELECT cron.schedule('monthly-tutor-payments', '0 0 1 * *', $$SELECT generate_monthly_payments();$$);
SELECT cron.schedule('daily-expire-subscriptions', '0 0 * * *', $$SELECT expire_subscriptions();$$);
```

---

## Struttura del progetto

```
tutormatch/
├── app/
│   ├── page.tsx                     # Landing Page
│   ├── (auth)/login/                # Login
│   ├── (auth)/registrazione/
│   │   ├── studente/                # Registrazione studente
│   │   └── tutor/                   # Registrazione tutor (3 step)
│   └── (dashboard)/
│       ├── studente/                # Dashboard studente completa
│       ├── tutor/                   # Dashboard tutor completa
│       └── admin/                   # Dashboard admin completa
├── components/
│   ├── ui/                          # Button, Input, Card, Badge
│   ├── studente/DashboardLayout.tsx
│   ├── tutor/DashboardLayout.tsx
│   ├── admin/DashboardLayout.tsx
│   └── chat/ChatInterface.tsx       # Chat realtime
├── lib/
│   ├── supabase/                    # Client, server, middleware
│   └── utils.ts                     # Meet link, date utils
├── types/database.ts                # Tutti i TypeScript types
├── supabase/migrations/001_schema.sql
└── middleware.ts                    # Protezione route
```

---

## Google Meet Link

Ogni prenotazione online genera automaticamente un link univoco:
`https://meet.google.com/abc-defg-hij`

Il link è salvato nel database e mostrato a studente e tutor nelle card lezione. Il primo che clicca crea la stanza, il secondo si unisce.

---

## Comandi utili

```bash
npm run dev      # Sviluppo locale
npm run build    # Build produzione
npm run lint     # Lint TypeScript/ESLint
```
