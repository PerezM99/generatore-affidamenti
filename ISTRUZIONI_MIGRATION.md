# Istruzioni per Migration Database

## Riepilogo Modifiche

Ho completato l'implementazione del sistema per la gestione dei placeholder del documento di affidamento. Ecco cosa è stato fatto:

### 1. ✅ Schema Prisma Aggiornato

**File**: `prisma/schema.prisma`

**Nuove tabelle create:**
- `Fornitore` - Anagrafica fornitori con tutti i dati (ragione sociale, P.IVA, indirizzo, contatti)
- `Dirigente` - Dirigenti (Direttore Generale / Area Territorio) con ruolo enum
- `RUP` - Responsabili Unici del Progetto
- `Affidamento` - Documenti generati con relazioni a tutte le entità

**Modifiche a tabelle esistenti:**
- `User`: aggiunto campo `telefono` (interno telefonico del referente)
- `Preventivo`: aggiunto campo `fornitoreId` (relazione opzionale con Fornitore)

**Nuovi enum:**
- `DirigenteRuolo`: GENERALE | AREA_TERRITORIO
- `TipoDocumento`: AFFIDAMENTO | PROPOSTA_AFFIDAMENTO | DETERMINA

### 2. ✅ Parser LLM Aggiornato

**File**: `lib/llm-parser.ts`

**Nuovi campi estratti dal preventivo:**
- Codice fiscale fornitore
- Indirizzo separato in: via, CAP, comune, provincia
- Telefono fornitore
- Data preventivo
- Numero e data protocollo
- Aliquota IVA
- Tempistiche consegna
- Condizioni di pagamento
- Validità offerta

### 3. ✅ Tipi TypeScript Placeholder

**File**: `lib/types/document-placeholders.ts`

Definisce:
- Interfaccia `DocumentPlaceholders` con tutti i 29 placeholder del documento
- Helper functions per formattazione dati
- Mapping tra dati estratti e placeholder
- Documentazione completa

### 4. ✅ Script SQL e Seed

**File SQL**: `prisma/migrations/manual_migration.sql`
**File Seed**: `prisma/seed.ts`

---

## 🚀 Come Procedere

### Passo 1: Esegui la Migration SQL

Poiché Supabase non supporta IPv4, devi eseguire l'SQL manualmente:

1. Accedi a Supabase Dashboard
2. Vai alla sezione **SQL Editor**
3. Copia e incolla il contenuto di `prisma/migrations/manual_migration.sql`
4. Esegui lo script

Lo script creerà:
- 2 nuovi ENUM (DirigenteRuolo, TipoDocumento)
- 4 nuove tabelle (Fornitore, Dirigente, RUP, Affidamento)
- 1 nuovo campo in User (telefono)
- 1 nuovo campo in Preventivo (fornitoreId)
- Tutte le foreign keys e indici necessari

### Passo 2: Aggiorna i Nominativi nel Seed

Modifica il file `prisma/seed.ts` e sostituisci i dati placeholder con i nominativi reali:

```typescript
// Esempio per Direttore Generale
{
  titolo: "Dott.",        // ⬅️ Aggiorna
  nome: "Mario",          // ⬅️ Aggiorna
  cognome: "Rossi",       // ⬅️ Aggiorna
  ruolo: "GENERALE",
  email: "direttore.generale@gardachiese.it", // ⬅️ Aggiorna
}
```

Aggiorna:
- Direttore Generale
- Direttore Area Territorio
- RUP (tutti quelli che hai)
- Interno telefonico dell'utente principale

### Passo 3: Esegui il Seed

**IMPORTANTE**: Prima di eseguire il seed, installa `tsx` (TypeScript executor):

```bash
npm install -D tsx
```

Poi esegui:

```bash
npx tsx prisma/seed.ts
```

Questo popolerà il database con:
- Dirigenti
- RUP
- Alcuni fornitori di esempio
- Aggiornamento interno telefonico utente esistente

### Passo 4: Verifica

Dopo la migration e il seed, verifica che tutto sia OK:

1. **Controlla le tabelle**:
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```

2. **Verifica i dati**:
   ```sql
   SELECT * FROM "Dirigente";
   SELECT * FROM "RUP";
   SELECT * FROM "Fornitore";
   ```

3. **Rigenera Prisma Client** (localmente):
   ```bash
   npx prisma generate
   ```

---

## 📋 Mapping Placeholder → Database

Ecco come i placeholder del documento vengono popolati:

### Dal Preventivo (estratto automaticamente)
- `F_Ragione` ← `fornitore.ragioneSociale`
- `F_CF_IVA` ← `fornitore.partitaIva` o `codiceFiscale`
- `F_Indirizzo` ← `fornitore.indirizzo`
- `F_Cap_Comune_Provincia` ← formato da `cap`, `comune`, `provincia`
- `F_Mail` ← `fornitore.email`
- `F_Pec` ← `fornitore.pec`
- `P_Numero` ← `numeroProtocollo`
- `P_Data` ← `dataProtocollo`
- `Totale_Numero` ← `importoImponibile`
- `Riferimento` ← costruito da `numeroPreventivo`

### Dall'Utente (input manuale)
- `Metodo_Invio` ← "PEC" o altro
- `Lettera` ← "a)" (lavori) o "b)" (servizi/forniture)
- `Oggetto` ← descrizione personalizzata
- `CUP` ← codice CUP (solo lavori)
- `Codice_Lavoro` ← codice lavoro (solo lavori)
- `Capitolo_Bilancio` ← codice capitolo
- `CPV` ← codice CPV
- `Descrizione` ← descrizione dettagliata
- `Condizioni`, `Tempistiche`, `Prescrizioni_Tecniche`, `Garanzie` ← note opzionali

### Dal Database (selezione dropdown)
- `Direttore_Nome` ← `Dirigente.titolo + nome + cognome`
- `Direttore_Ruolo` ← `Dirigente.ruolo`
- `Proposta` ← costruita da `RUP` (se selezionato)
- `R_Nome` ← `User.name` (utente loggato)
- `R_Interno` ← `User.telefono`
- `R_Mail` ← `User.email`

### Calcolati
- `Totale_Lettere` ← conversione numero → lettere di `Totale_Numero`

---

## 🎯 Prossimi Passi

Dopo aver completato la migration e il seed, dovrai implementare:

1. **UI per compilazione documento**
   - Form con campi per input utente
   - Dropdown per selezione Dirigente/RUP
   - Preview placeholder popolati

2. **Logica generazione documento**
   - Caricamento template Word fisso
   - Sostituzione placeholder
   - Salvataggio documento generato

3. **API endpoints**
   - `POST /api/affidamenti/generate` - Genera documento
   - `GET /api/dirigenti` - Lista dirigenti
   - `GET /api/rup` - Lista RUP
   - `GET /api/fornitori` - Lista fornitori

---

## 📌 Note

- Il documento Word fixato è in: `public/M-APP-08A_FIXED_Ordine affidamento diretto_RUP uguale DIRIGENTE_rev00.docx`
- Sono stati identificati **29 placeholder** totali
- Il parser LLM è configurato per estrarre automaticamente il massimo possibile dal PDF
- Gli helper in `lib/types/document-placeholders.ts` ti aiuteranno a formattare i dati correttamente

---

## ❓ Domande da Risolvere

Prima di procedere con l'implementazione dell'UI, mi servirebbe sapere:

1. **Nominativi reali** di Dirigenti e RUP da inserire nel seed
2. Come vuoi gestire il **CPV** (Codice Vocabolario Comune per gli Appalti)? Input manuale o selezione da lista?
3. Per la **conversione numero → lettere**: vuoi usare una libreria NPM o un servizio custom?
4. Come gestire i **documenti multipli** dello stesso preventivo (Affidamento + Proposta + Determina)?
