# Guida: Estrazione Dati da Preventivi PDF

Questa guida spiega come configurare e usare il sistema di estrazione automatica dei dati dai preventivi PDF.

## 📋 Prerequisiti

- Node.js e npm installati
- Database PostgreSQL configurato
- Ollama installato (vedi sezione sotto)

---

## 🔧 Installazione Ollama e Modello

### Step 1: Installa Ollama

**Windows:**

1. Scarica l'installer da: https://ollama.com/download/windows
2. Esegui il file `.exe` e segui il wizard
3. Ollama si avvierà automaticamente come servizio Windows

**Verifica installazione:**

```bash
ollama --version
```

Dovresti vedere: `ollama version 0.x.x`

### Step 2: Scarica il Modello Qwen 2.5 7B

```bash
ollama pull qwen2.5:7b
```

**Nota:** Il download è ~4GB, potrebbe richiedere alcuni minuti.

### Step 3: Testa Ollama

```bash
# Test rapido
ollama run qwen2.5:7b "Ciao, dimmi in una frase cosa sai fare"

# Se risponde, Ollama è pronto! 🎉
```

### Step 4: Verifica che Ollama sia in Esecuzione

Ollama deve essere sempre in esecuzione per funzionare. Su Windows, viene avviato automaticamente all'avvio del sistema.

**Verifica:**
```bash
# Controlla se il servizio risponde
curl http://localhost:11434/api/tags
```

Se vedi una lista di modelli (incluso `qwen2.5:7b`), tutto è OK!

---

## ⚙️ Configurazione Applicazione

### 1. Configura Variabili d'Ambiente

Crea o modifica il file `.env` nella root del progetto:

```env
# LLM Locale (Ollama)
OLLAMA_URL="http://localhost:11434"
OLLAMA_MODEL="qwen2.5:7b"
```

### 2. Sincronizza Database

```bash
npx prisma db push
npx prisma generate
```

Questo crea la tabella `Preventivo` nel database.

---

## 🚀 Come Usare il Sistema

### Flusso Completo

1. **Upload PDF** → Estrazione testo automatica
2. **Parse con LLM** → Estrazione dati strutturati
3. **Visualizzazione** → Dati estratti disponibili per generazione documenti

### API Endpoints

#### 1. Upload PDF

**Endpoint:** `POST /api/preventivi/upload`

**Request:**
```typescript
// FormData con file PDF
const formData = new FormData();
formData.append("file", pdfFile);

const response = await fetch("/api/preventivi/upload", {
  method: "POST",
  body: formData,
});
```

**Response:**
```json
{
  "success": true,
  "preventivo": {
    "id": "clx123abc...",
    "fileName": "preventivo.pdf",
    "fileSize": 245678,
    "numPages": 2,
    "textPreview": "Preventivo n. 123...",
    "status": "EXTRACTED",
    "createdAt": "2025-11-08T10:30:00.000Z"
  }
}
```

#### 2. Parse con LLM

**Endpoint:** `POST /api/preventivi/parse`

**Request:**
```typescript
const response = await fetch("/api/preventivi/parse", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    preventivoId: "clx123abc..."
  }),
});
```

**Response:**
```json
{
  "success": true,
  "preventivo": {
    "id": "clx123abc...",
    "status": "PARSED",
    "extractedData": {
      "importoTotale": 12500.00,
      "importoIvaEsclusa": 10245.90,
      "importoIvaInclusa": 12500.00,
      "iva": 22,
      "fornitore": {
        "ragioneSociale": "Azienda Fornitrice S.r.l.",
        "partitaIva": "12345678901",
        "indirizzo": "Via Roma 123",
        "citta": "Milano",
        "cap": "20100",
        "email": "info@azienda.it"
      },
      "oggetto": "Fornitura materiale edilizio",
      "descrizione": "Fornitura di materiale...",
      "dataPreventivo": "2025-11-05",
      "validitaPreventivo": "30 giorni",
      "numeroPreventivo": "PREV-2025-123"
    }
  }
}
```

---

## 📊 Dati Estratti

Il sistema estrae automaticamente:

### ✅ Importi
- Importo totale
- IVA esclusa / inclusa
- Aliquota IVA

### ✅ Dati Fornitore
- Ragione sociale
- Partita IVA / Codice Fiscale
- Indirizzo completo
- Contatti (telefono, email, PEC)

### ✅ Descrizione Lavori
- Oggetto (breve)
- Descrizione dettagliata
- Voci di preventivo (quantità, prezzi)

### ✅ Date
- Data preventivo
- Validità offerta
- Tempi di consegna

### ✅ Altro
- Numero preventivo
- Note aggiuntive

---

## 🐛 Troubleshooting

### Ollama non risponde

**Problema:** `Ollama non è raggiungibile`

**Soluzione:**
1. Verifica che Ollama sia in esecuzione:
   ```bash
   ollama serve
   ```
2. Controlla che sia raggiungibile:
   ```bash
   curl http://localhost:11434/api/tags
   ```

### Modello non trovato

**Problema:** `model 'qwen2.5:7b' not found`

**Soluzione:**
```bash
ollama pull qwen2.5:7b
```

### JSON non valido dall'LLM

**Problema:** `L'LLM non ha generato un JSON valido`

**Soluzione:**
- Il modello potrebbe aver bisogno di più contesto
- Prova ad aumentare il `temperature` in `lib/llm-parser.ts` (linea 77)
- Verifica che il testo estratto sia leggibile

### PDF vuoto o illeggibile

**Problema:** `Il PDF sembra vuoto o non contiene testo estraibile`

**Soluzione:**
- Il PDF potrebbe essere una scansione (immagine)
- Sarà necessario implementare OCR per questi casi
- Verifica che il PDF contenga testo selezionabile

---

## 🔍 Testing

### Test Upload PDF

```typescript
// Nel browser console o in un test
const testUpload = async () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/pdf";

  input.onchange = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/preventivi/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log("Upload result:", data);

    // Parse con LLM
    if (data.success) {
      const parseRes = await fetch("/api/preventivi/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preventivoId: data.preventivo.id }),
      });

      const parseData = await parseRes.json();
      console.log("Parse result:", parseData);
    }
  };

  input.click();
};

testUpload();
```

---

## ⚡ Performance

### Tempi di Processing

- **Estrazione testo PDF:** ~1-2 secondi
- **Parsing con LLM (Qwen 2.5 7B):**
  - CPU (i7-1165G7): ~5-10 secondi
  - GPU (se disponibile): ~2-3 secondi

### Ottimizzazione

Per migliorare le performance:

1. **Usa GPU se disponibile:**
   ```bash
   # Ollama rileverà automaticamente la GPU
   ```

2. **Riduci dimensione PDF:**
   - Limita a max 10 pagine
   - Comprimi immagini se presenti

3. **Server dedicato in produzione:**
   - Usa un server con GPU dedicata
   - Configura `OLLAMA_URL` per puntare al server remoto

---

## 📝 Note

- Il testo estratto viene salvato nel database (campo `rawText`)
- I dati strutturati sono salvati come JSON (campo `extractedData`)
- Ogni preventivo ha uno stato: `UPLOADED` → `EXTRACTED` → `PARSED` (o `ERROR`)
- Il sistema supporta solo PDF testuali (non scansioni)

---

## 🔮 Prossimi Sviluppi

- [ ] Supporto OCR per PDF scansionati
- [ ] Validazione avanzata dati estratti (P.IVA, email, etc.)
- [ ] Cache risultati LLM per preventivi simili
- [ ] Interfaccia UI per correzione manuale dati
- [ ] Export dati in vari formati (Excel, JSON, etc.)
