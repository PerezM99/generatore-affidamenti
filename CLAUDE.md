# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Panoramica del Progetto

"Generatore Affidamenti" è un sistema interno per la generazione automatizzata di documenti amministrativi per gli affidamenti. L'applicazione genera tre tipi di documenti: Affidamento, Proposta d'Affidamento e Determina (basata sull'importo).

## Stack Tecnologico

- **Framework**: Next.js 16.0.1 (App Router)
- **React**: 19.2.0 con React Server Components e Client Components
- **TypeScript**: Modalità strict abilitata
- **Styling**: Tailwind CSS v4 con design tokens personalizzati
- **Font**: Geist Sans e Geist Mono tramite next/font
- **Autenticazione**: NextAuth.js v4.24.13 con magic link via email
- **Email Provider**: Resend v6.4.2 (dev/staging) - SMTP aziendale in produzione
- **Database**: PostgreSQL con Prisma ORM v6.19.0
- **Adapter**: @auth/prisma-adapter v2.11.1 per persistenza sessioni

## Comandi di Sviluppo

```bash
# Avvia server di sviluppo (default: http://localhost:3000)
npm run dev

# Build per produzione
npm run build

# Avvia server di produzione
npm start

# Esegui linter
npm run lint

# Database - Prisma
npx prisma generate      # Genera Prisma Client
npx prisma db push       # Sincronizza schema con database
npx prisma studio        # Apri interfaccia visuale database
npx prisma migrate dev   # Crea nuova migration
```

## Architettura dell'Applicazione

### Struttura Routing

- `/` (app/page.tsx) - Landing page con hero section, features e spiegazione workflow
- `/login` (app/login/page.tsx) - Autenticazione via magic link email (NextAuth + Resend)
- `/dashboard` (app/dashboard/page.tsx) - Interfaccia principale per la generazione documenti (protetta da autenticazione)
- `/api/auth/[...nextauth]` (app/api/auth/[...nextauth]/route.ts) - API route per NextAuth (signin, callback, signout)

### Design System

L'applicazione usa un tema scuro verde con accenti oro/verdi definiti in `app/globals.css`:

- **Background**: Verde scuro (#0a1410, #0f1b14 per le card)
- **Foreground**: Bianco con tinta verde chiaro (#e8f5f0)
- **Accent/Gold**: Colore verde accento (#22c55e) usato come colore primario per le CTA
- **Border**: Verde scuro (#1e3a2a)

Accedi ai design tokens tramite classi Tailwind: `bg-background`, `text-foreground`, `text-gold`, `bg-card-bg`, `border-border`

### Pattern dei Componenti

1. **Client Components**: Pagine che richiedono interattività (login, dashboard) usano la direttiva `"use client"`
2. **Server Components**: Default per contenuti statici (landing page, layout)
3. **Ottimizzazione Immagini**: Usa il componente `Image` di Next.js con il logo `/icona.png`
4. **Gestione dello Stato**: State locale React con useState (nessuna libreria di stato globale per ora)

### Stato Implementazione Corrente

**Implementato:**
- Landing page con contenuti marketing
- Sistema di autenticazione completo con magic link (NextAuth + Resend)
- Filtro email su dominio autorizzato (attualmente `matteo.peretti@hotmail.it`)
- Database PostgreSQL con Prisma (modelli: User, Session, Account, VerificationToken)
- Protezione route /dashboard con verifica sessione
- UI della dashboard con upload file e selezione documenti
- Navigazione sidebar che mostra documenti recenti (dati mock)
- Logout funzionante con distruzione sessione

**Da Completare:**
- **Migrazione SMTP**: Sostituire Resend con SMTP aziendale per produzione
- **Aggiornamento filtro email**: Passare da `hotmail.it` a `@gardachiese.it`
- Processamento e parsing del file caricato
- Logica di generazione documenti (Affidamento, Proposta, Determina)
- Endpoint API backend per generazione documenti
- Persistenza documenti generati nel database
- Sostituire dati mock con query database reali

## Path Aliases

TypeScript è configurato con `@/*` che punta alla directory root per import puliti:
```typescript
import { Component } from "@/components/Component"
```

## Convenzioni di Styling

- Usa classi utility Tailwind per tutto lo styling
- Sfrutta i color tokens personalizzati: `bg-gold`, `text-foreground`, `border-border`, ecc.
- Mantieni spacing consistente con la scala Tailwind
- Usa transitions per stati interattivi: `transition-colors`, `transition-all`
- Segui il pattern card stabilito: `bg-card-bg border border-border rounded-xl p-8`

## Sistema di Autenticazione

L'applicazione utilizza **NextAuth.js v4** con strategia **magic link via email**.

### Architettura Autenticazione

**File principali:**
- `lib/auth.ts` - Configurazione NextAuth e logica validazione email
- `app/api/auth/[...nextauth]/route.ts` - API routes per autenticazione
- `app/login/page.tsx` - Pagina di login con form email
- `prisma/schema.prisma` - Schema database per User, Session, Account, VerificationToken

### Flusso di Autenticazione

1. **Utente inserisce email** su `/login`
2. **Validazione dominio**: Il sistema verifica che l'email appartenga a un dominio autorizzato
3. **Invio magic link**: Se autorizzata, viene inviata email con link di accesso (valido 24 ore)
4. **Click sul link**: L'utente clicca il link nell'email ricevuta
5. **Verifica token**: NextAuth verifica il token e crea sessione nel database
6. **Redirect a dashboard**: L'utente viene reindirizzato alla dashboard con sessione attiva (30 giorni)

### Configurazione Dominio Email

Il filtro email è controllato dalla variabile d'ambiente `ALLOWED_EMAIL_DOMAINS` nel file `.env`:

```env
# Configurazione attuale (sviluppo)
ALLOWED_EMAIL_DOMAINS="hotmail.it"

# Configurazione futura (produzione)
ALLOWED_EMAIL_DOMAINS="gardachiese.it"
```

**Logica di validazione** (`lib/auth.ts:11-20`):
```typescript
function isEmailAllowed(email: string): boolean {
  const allowedDomains = process.env.ALLOWED_EMAIL_DOMAINS?.split(',').map(d => d.trim()) || []
  const emailDomain = email.split('@')[1]?.toLowerCase()

  if (!emailDomain) return false

  return allowedDomains.some(domain => {
    const normalizedDomain = domain.toLowerCase()
    return emailDomain === normalizedDomain
  })
}
```

Il controllo avviene in **due punti**:
1. Prima di inviare il magic link (`lib/auth.ts:31`)
2. Durante il callback di sign-in (`lib/auth.ts:85`)

### Provider Email

**Sviluppo/Staging**: Resend (richiede API key e dominio verificato)
**Produzione**: SMTP aziendale (da configurare)

**Variabili d'ambiente necessarie:**
```env
# Email provider (Resend)
RESEND_API_KEY="re_your_api_key_here"
EMAIL_FROM="noreply@yourdomain.com"  # Deve essere verificato in Resend

# SMTP aziendale (produzione - da configurare)
SMTP_HOST="smtp.gardachiese.it"
SMTP_PORT="587"
SMTP_USER="noreply@gardachiese.it"
SMTP_PASSWORD="your_password"
```

### Sessioni

- **Strategia**: Database (persistente su PostgreSQL)
- **Durata**: 30 giorni
- **Aggiornamento**: Ogni 24 ore
- **Logout**: Distrugge la sessione dal database

### Protezione Route

Le route protette usano `useSession()` da `next-auth/react`:

```typescript
const { data: session, status } = useSession()

useEffect(() => {
  if (status === "unauthenticated") {
    router.push("/login")
  }
}, [status, router])
```

### Schema Database (Prisma)

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

### Note di Sicurezza

- Magic link validi per **24 ore**
- Token univoci e usa-e-getta
- `NEXTAUTH_SECRET` deve essere una stringa casuale forte in produzione
- Doppia validazione del dominio email (invio + callback)
- Sessioni salvate nel database (non JWT in cookie)

## Variabili d'Ambiente

Crea un file `.env` nella root del progetto basandoti su `.env.example`:

```env
# Database PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"  # Usa URL produzione in prod
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"  # Genera con: openssl rand -base64 32

# Email Provider (Resend - solo sviluppo/staging)
RESEND_API_KEY="re_your_api_key_here"  # Da https://resend.com/api-keys
EMAIL_FROM="noreply@yourdomain.com"    # Deve essere verificato in Resend

# Email Whitelist
# Domini autorizzati separati da virgola (senza @)
# Attuale: "hotmail.it" (solo matteo.peretti@hotmail.it)
# Futuro: "gardachiese.it" (tutti gli utenti @gardachiese.it)
ALLOWED_EMAIL_DOMAINS="hotmail.it"
```

**IMPORTANTE per la produzione:**
- Sostituire Resend con SMTP aziendale
- Cambiare `ALLOWED_EMAIL_DOMAINS` da `"hotmail.it"` a `"gardachiese.it"`
- Generare un `NEXTAUTH_SECRET` forte e univoco
- Configurare `NEXTAUTH_URL` con l'URL di produzione

## Sistema di Estrazione Dati da PDF

L'applicazione utilizza un approccio ibrido per estrarre dati strutturati dai preventivi PDF:
1. **Parsing tradizionale** con `pdf-parse` per estrarre il testo
2. **LLM locale** (Ollama + Qwen 2.5 7B) per strutturare i dati

### Architettura Estrazione

**File principali:**
- `lib/pdf-extractor.ts` - Estrazione testo da PDF con pdf-parse
- `lib/llm-parser.ts` - Parsing dati strutturati con LLM locale (Ollama)
- `app/api/preventivi/upload/route.ts` - Upload PDF ed estrazione testo
- `app/api/preventivi/parse/route.ts` - Parsing con LLM
- `prisma/schema.prisma` - Modello Preventivo

### Flusso di Estrazione

1. **Upload PDF** → L'utente carica un preventivo PDF
2. **Estrazione testo** → pdf-parse estrae il testo grezzo dal PDF
3. **Salvataggio DB** → Testo salvato nel campo `rawText` (status: `EXTRACTED`)
4. **Parsing LLM** → Qwen 2.5 analizza il testo ed estrae dati strutturati
5. **Salvataggio dati** → Dati salvati in `extractedData` JSON (status: `PARSED`)

### Modello Database

```prisma
model Preventivo {
  id            String            @id @default(cuid())
  fileName      String
  fileSize      Int
  filePath      String
  rawText       String?           @db.Text
  extractedData Json?
  status        PreventivoStatus  @default(UPLOADED)
  errorMessage  String?
  userId        String
  user          User              @relation(...)
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
}

enum PreventivoStatus {
  UPLOADED   // File caricato
  EXTRACTED  // Testo estratto
  PARSED     // Dati strutturati estratti
  ERROR      // Errore durante processing
}
```

### Dati Estratti

Il sistema estrae automaticamente:
- **Importi**: totale, IVA esclusa/inclusa, aliquota IVA
- **Fornitore**: ragione sociale, P.IVA, CF, indirizzo, contatti
- **Descrizione**: oggetto, descrizione dettagliata, voci di preventivo
- **Date**: data preventivo, validità, tempi di consegna
- **Altro**: numero preventivo, note

### Configurazione LLM Locale

**Prerequisito**: Ollama installato e in esecuzione

```bash
# Installa Ollama (Windows)
# Download da: https://ollama.com/download/windows

# Scarica modello Qwen 2.5 7B
ollama pull qwen2.5:7b

# Verifica installazione
ollama run qwen2.5:7b "test"
```

**Variabili d'ambiente:**
```env
OLLAMA_URL="http://localhost:11434"
OLLAMA_MODEL="qwen2.5:7b"
```

### API Endpoints

**Upload PDF:**
```
POST /api/preventivi/upload
Content-Type: multipart/form-data
Body: { file: <PDF file> }
```

**Parse con LLM:**
```
POST /api/preventivi/parse
Content-Type: application/json
Body: { preventivoId: "xxx" }
```

### Performance

- **Estrazione testo**: ~1-2 secondi
- **Parsing LLM** (CPU i7-1165G7): ~5-10 secondi
- **Totale**: ~6-12 secondi per preventivo

### Limitazioni Attuali

- Solo PDF testuali (non scansioni/immagini)
- Limite dimensione: 10MB
- Ollama deve essere in esecuzione localmente

### Note di Sviluppo

- Per PDF scansionati sarà necessario implementare OCR
- Il modello può essere cambiato modificando `OLLAMA_MODEL` in `.env`
- Modelli alternativi: `llama3.1:8b`, `mistral:7b`, `phi3:medium`
- In produzione, Ollama può girare su server dedicato (configurare `OLLAMA_URL`)

**Guida completa**: Vedi `GUIDA_ESTRAZIONE_PDF.md` per istruzioni dettagliate
