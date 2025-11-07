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
```

## Architettura dell'Applicazione

### Struttura Routing

- `/` (app/page.tsx) - Landing page con hero section, features e spiegazione workflow
- `/login` (app/login/page.tsx) - Pagina di autenticazione (client component, attualmente bypassa l'auth)
- `/dashboard` (app/dashboard/page.tsx) - Interfaccia principale per la generazione documenti

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
- UI della pagina di login (logica di autenticazione non ancora implementata)
- UI della dashboard con upload file e selezione documenti
- Navigazione sidebar che mostra documenti recenti (dati mock)

**Non Ancora Implementato:**
- Sistema di autenticazione effettivo (il login attualmente reindirizza direttamente alla dashboard)
- Processamento e parsing del file caricato
- Logica di generazione documenti
- Endpoint API backend
- Integrazione database
- Persistenza documenti precedenti (attualmente usa dati mock in app/dashboard/page.tsx:15-20)

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
