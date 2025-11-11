/**
 * LLM Parser per estrarre dati strutturati dal testo del preventivo
 *
 * Questo modulo si connette a un LLM locale (Ollama) per analizzare
 * il testo estratto dal PDF e restituire dati strutturati.
 */

// Interfaccia per i dati estratti dal preventivo
export interface ExtractedData {
  // Dati fornitore
  fornitore?: {
    ragioneSociale?: string; // Nome o ragione sociale
    codiceFiscale?: string; // Codice fiscale (se presente)
    partitaIva?: string; // Partita IVA
    indirizzo?: string; // Via e numero civico (es. "Via Roma, 10")
    cap?: string; // CAP (es. "46100")
    comune?: string; // Comune (es. "Mantova")
    provincia?: string; // Sigla provincia (es. "MN")
    email?: string; // Email normale (opzionale)
    pec?: string; // PEC (opzionale, almeno uno tra email e PEC)
    telefono?: string; // Numero di telefono (opzionale)
  };

  // Oggetto dell'affidamento
  oggetto?: string; // Riassunto/descrizione per l'inizio del documento
  tipoAffidamento?: "fornitura" | "servizi" | "lavori"; // Tipo di affidamento

  // Riferimenti documento
  numeroPreventivo?: string; // Numero preventivo (stringa alfanumerica/simbolica)
  numeroProtocollo?: string; // Formato: "XXXX/AAAA" es. "1234/2024"
  dataProtocollo?: string; // Formato: "XX/XX/XXXX" es. "15/10/2024"
  dataPreventivo?: string; // Data emissione preventivo (formato: "XX/XX/XXXX")

  // Voci/articoli del preventivo
  vociPreventivo?: Array<{
    descrizione: string; // Descrizione della voce
    quantita?: number; // Quantità
    prezzoUnitario?: number; // Prezzo unitario (IVA esclusa)
    iva?: number; // Aliquota IVA per questa voce (es. 22)
  }>;

  // Importi complessivi
  importoImponibile?: number; // Totale imponibile (IVA esclusa)
  importoIva?: number; // Totale IVA
  importoTotale?: number; // Totale generale (IVA inclusa)
  aliquotaIva?: number; // Aliquota IVA principale (es. 22)

  // Tempistiche e condizioni
  tempiConsegna?: string; // Tempi di consegna
  validitaOfferta?: string; // Validità dell'offerta
  condizioniPagamento?: string; // Condizioni di pagamento

  // Altri dati utili
  note?: string; // Eventuali note aggiuntive
}

/**
 * Estrae dati strutturati dal testo del preventivo usando un LLM locale
 *
 * @param rawText Testo estratto dal PDF
 * @returns Dati strutturati estratti
 */
export async function parseWithLLM(rawText: string): Promise<ExtractedData> {
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  const ollamaModel = process.env.OLLAMA_MODEL || "qwen2.5:3b";

  try {
    // Costruisce il prompt con il testo del preventivo
    const prompt = EXTRACTION_PROMPT_TEMPLATE.replace("{TEXT}", rawText);

    console.log(`🤖 Chiamata a Ollama (${ollamaModel})...`);
    console.log(`📡 URL: ${ollamaUrl}/api/generate`);
    console.log(`📊 Lunghezza prompt: ${prompt.length} caratteri`);

    const startTime = Date.now();

    // 📚 Crea un AbortController per gestire timeout di 10 minuti
    // Questo previene che la fetch vada in timeout prima che Ollama finisca
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minuti

    try {
      // Chiama l'API di Ollama
      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Connection: "keep-alive", // Mantieni connessione aperta
        },
        body: JSON.stringify({
          model: ollamaModel,
          prompt: prompt,
          stream: false, // Richiede risposta completa, non streaming
          format: "json", // Richiede output JSON
          options: {
            temperature: 0.1, // Bassa temperatura per output più deterministico
            top_p: 0.9,
          },
        }),
        signal: controller.signal, // Aggiungi signal per timeout personalizzato
      });

      const fetchTime = Date.now() - startTime;
      console.log(`⏱️ Tempo fetch: ${(fetchTime / 1000).toFixed(1)}s`);

      if (!response.ok) {
        throw new Error(
          `Ollama API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // Ollama ritorna il testo generato in data.response
      const generatedText = data.response;

      const totalTime = Date.now() - startTime;
      console.log(
        `✅ Risposta ricevuta da Ollama in ${(totalTime / 1000).toFixed(
          1
        )}s (${(totalTime / 60000).toFixed(1)} min)`
      );

      // Pulisci il timeout
      clearTimeout(timeoutId);

      // Parse del JSON generato dall'LLM
      let extractedData: ExtractedData;
      try {
        extractedData = JSON.parse(generatedText);
      } catch (parseError) {
        console.error("❌ Errore parsing JSON dall'LLM:", generatedText);
        throw new Error("L'LLM non ha generato un JSON valido");
      }

      // Valida e normalizza i dati
      return validateExtractedData(extractedData);
    } catch (fetchError) {
      clearTimeout(timeoutId);

      // Gestisci errore di abort (timeout)
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("❌ Timeout: Ollama non ha risposto entro 10 minuti");
        throw new Error(
          "Timeout: l'analisi del documento sta richiedendo troppo tempo. Prova con un documento più semplice o contatta il supporto."
        );
      }

      throw fetchError;
    }
  } catch (error) {
    console.error("❌ Errore durante parsing con LLM:", error);

    // Se Ollama non è disponibile, ritorna un oggetto vuoto
    if (error instanceof Error && error.message.includes("fetch failed")) {
      console.warn(
        "⚠️ Ollama non è raggiungibile. Assicurati che sia in esecuzione su:",
        ollamaUrl
      );
      throw new Error("Ollama non è raggiungibile. Avvia Ollama e riprova.");
    }

    throw error;
  }
}

/**
 * Template del prompt per l'LLM
 * Guida l'LLM nell'estrazione dei dati secondo la struttura definita
 */
export const EXTRACTION_PROMPT_TEMPLATE = `Sei un assistente specializzato nell'estrazione di dati da preventivi italiani per enti pubblici.

Analizza il seguente testo estratto da un preventivo e ritorna un oggetto JSON con i dati strutturati.

TESTO PREVENTIVO:
{TEXT}

IMPORTANTE - REGOLE PER I NUMERI:
- Presta MASSIMA attenzione alle cifre numeriche
- Nel PDF italiano troverai numeri come: 2.101,50 (duemilacentouno virgola cinquanta)
- ESEMPI di conversione:
  * PDF: "1.234,56" → JSON: 1234.56
  * PDF: "2.101,00" → JSON: 2101.00
  * PDF: "45.678,99" → JSON: 45678.99
- Per le voci: estrai SOLO il prezzo unitario IVA esclusa (non calcolare importi per voce)
- Verifica i totali complessivi:
  * importoImponibile: totale IVA esclusa
  * importoIva: totale IVA
  * importoTotale: totale IVA inclusa

Estrai i seguenti dati (se presenti nel testo, altrimenti lascia il campo vuoto o omettilo):

1. DATI FORNITORE:
   - ragioneSociale: nome o ragione sociale del fornitore (non può essere MAI Consorzio di bonifica Garda Chiese)
   - codiceFiscale: codice fiscale del fornitore (se presente)
   - partitaIva: partita IVA (11 cifre)
   - indirizzo: SOLO via e numero civico (es. "Via Roma, 10")
   - cap: SOLO il codice postale (es. "46100")
   - comune: SOLO il nome del comune (es. "Mantova")
   - provincia: SOLO la sigla della provincia (es. "MN")
   - email: indirizzo email normale (se presente)
   - pec: indirizzo PEC (se presente)
   - telefono: numero di telefono (se presente)

2. OGGETTO AFFIDAMENTO:
   - oggetto: descrizione che COMPLETA la frase. Esempi:
     * Per forniture: "della fornitura di materiale informatico"
     * Per servizi: "del servizio di manutenzione impianti elettrici"
     * Per lavori: "dei lavori di ristrutturazione edificio"
   - tipoAffidamento: scegli tra "fornitura", "servizi" o "lavori" in base al contenuto

3. RIFERIMENTI DOCUMENTO:
   - numeroPreventivo: numero assegnato dal FORNITORE al preventivo (può essere in qualsiasi formato alfanumerico)
   - numeroProtocollo: numero di protocollo nel formato "XXXX/AAAA" (es. "1234/2024")
   - dataProtocollo: data di protocollo nel formato "GG/MM/AAAA" (es. "15/10/2024")
   - dataPreventivo: data di emissione del preventivo nel formato "GG/MM/AAAA"

4. VOCI/ARTICOLI:
   - vociPreventivo: array di voci, ciascuna con:
     * descrizione: descrizione dell'articolo/servizio (es. "TV LG 55 pollici", "Manutenzione caldaia")
     * quantita: quantità numerica (es. 3)
     * prezzoUnitario: prezzo unitario IVA esclusa (numero decimale preciso)
     * iva: aliquota IVA in percentuale (es. 22 per 22%)
     NON calcolare importi per singola voce - solo il prezzo unitario
     Ogni voce deve indicare un elemento distinto

   IMPORTANTE: Se ci sono voci con quantità, la descrizione nel documento dovrà essere formattata come:
   "la fornitura dei seguenti beni: N. 1 [descrizione], al costo unitario di € XXX + IVA; N. 2 [descrizione], al costo unitario di € YYY + IVA"

5. IMPORTI COMPLESSIVI:
   - importoImponibile: totale imponibile (IVA esclusa) - cerca "Imponibile", "Totale IVA esclusa"
   - importoIva: totale IVA - cerca "IVA", "Imposta"
   - importoTotale: totale generale (IVA inclusa) - cerca "Totale", "Totale IVA inclusa"
   - aliquotaIva: aliquota IVA principale in percentuale (es. 22 per 22%)

6. TEMPISTICHE E CONDIZIONI:
   - tempiConsegna: tempi di consegna indicati
   - validitaOfferta: validità dell'offerta
   - condizioniPagamento: condizioni di pagamento

7. NOTE:
   - note: eventuali note o condizioni particolari aggiuntive

ESEMPIO OUTPUT (nota i numeri con SOLO punto decimale):
{
  "fornitore": {
    "ragioneSociale": "Acme S.r.l.",
    "codiceFiscale": "RSSMRA80A01H501U",
    "partitaIva": "12345678901",
    "indirizzo": "Via Roma, 10",
    "cap": "46100",
    "comune": "Mantova",
    "provincia": "MN",
    "email": "info@acme.it",
    "pec": "acme@pec.it",
    "telefono": "0376123456"
  },
  "oggetto": "Fornitura materiale informatico",
  "tipoAffidamento": "fornitura",
  "numeroPreventivo": "PREV-2024-042",
  "numeroProtocollo": "1234/2024",
  "dataProtocollo": "15/10/2024",
  "dataPreventivo": "10/10/2024",
  "vociPreventivo": [
    {
      "descrizione": "Notebook HP EliteBook",
      "quantita": 5,
      "prezzoUnitario": 800.00,
      "iva": 22
    },
    {
      "descrizione": "Mouse wireless",
      "quantita": 5,
      "prezzoUnitario": 25.00,
      "iva": 22
    }
  ],
  "importoImponibile": 4125.00,
  "importoIva": 907.50,
  "importoTotale": 5032.50,
  "aliquotaIva": 22,
  "tempiConsegna": "30 giorni dalla conferma d'ordine",
  "validitaOfferta": "60 giorni",
  "condizioniPagamento": "Bonifico bancario 30 giorni data fattura",
  "note": "Prezzi IVA esclusa"
}

RICORDA:
1. NON aggiungere commenti, spiegazioni o testo extra. SOLO JSON valido.`;

/**
 * Valida e normalizza i dati estratti dall'LLM
 */
export function validateExtractedData(data: any): ExtractedData {
  // TODO: Implementare validazione quando necessario
  // Qui si possono aggiungere controlli tipo:
  // - Importi devono essere numeri positivi
  // - P.IVA deve essere 11 cifre
  // - Email deve essere valida
  // etc.

  return data as ExtractedData;
}
