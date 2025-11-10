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
    ragioneSociale?: string;           // Nome o ragione sociale
    indirizzo?: string;                 // Formato: "Via Esempio, 10\n46100 Mantova (MN)"
    email?: string;                     // Email normale (opzionale)
    pec?: string;                       // PEC (opzionale, almeno uno tra email e PEC)
    partitaIva?: string;               // Partita IVA
  };

  // Oggetto dell'affidamento
  oggetto?: string;                     // Riassunto/descrizione per l'inizio del documento
  tipoAffidamento?: "fornitura" | "servizi" | "lavori";  // Tipo di affidamento

  // Riferimenti documento
  numeroPreventivo?: string;            // Numero preventivo (stringa alfanumerica/simbolica)
  numeroProtocollo?: string;            // Formato: "XXXX/AAAA" es. "1234/2024"
  dataProtocollo?: string;              // Formato: "XX/XX/XXXX" es. "15/10/2024"

  // Voci/articoli del preventivo
  vociPreventivo?: Array<{
    descrizione: string;                // Descrizione della voce
    quantita?: number;                  // Quantità
    prezzoUnitario?: number;            // Prezzo unitario (IVA esclusa)
    iva?: number;                       // Aliquota IVA per questa voce (es. 22)
  }>;

  // Importi complessivi
  importoImponibile?: number;           // Totale imponibile (IVA esclusa)
  importoIva?: number;                  // Totale IVA
  importoTotale?: number;               // Totale generale (IVA inclusa)

  // Altri dati utili
  note?: string;                        // Eventuali note aggiuntive
}

/**
 * Estrae dati strutturati dal testo del preventivo usando un LLM locale
 *
 * @param rawText Testo estratto dal PDF
 * @returns Dati strutturati estratti
 */
export async function parseWithLLM(rawText: string): Promise<ExtractedData> {
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  const ollamaModel = process.env.OLLAMA_MODEL || "qwen2.5:7b";

  try {
    // Costruisce il prompt con il testo del preventivo
    const prompt = EXTRACTION_PROMPT_TEMPLATE.replace("{TEXT}", rawText);

    console.log(`🤖 Chiamata a Ollama (${ollamaModel})...`);

    // Chiama l'API di Ollama
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Ollama ritorna il testo generato in data.response
    const generatedText = data.response;

    console.log("✅ Risposta ricevuta da Ollama");

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

  } catch (error) {
    console.error("❌ Errore durante parsing con LLM:", error);

    // Se Ollama non è disponibile, ritorna un oggetto vuoto
    if (error instanceof Error && error.message.includes("fetch failed")) {
      console.warn("⚠️ Ollama non è raggiungibile. Assicurati che sia in esecuzione su:", ollamaUrl);
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
- Nel JSON devi convertire in formato standard: 2101.50 (SOLO PUNTO per i decimali)
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
   - ragioneSociale: nome o ragione sociale del fornitore
   - indirizzo: indirizzo completo nel formato "Via Esempio, 10\\n46100 Mantova (MN)"
   - email: indirizzo email normale (se presente)
   - pec: indirizzo PEC (se presente)
   - partitaIva: partita IVA (11 cifre)

2. OGGETTO AFFIDAMENTO:
   - oggetto: un riassunto breve dell'affidamento da mettere all'inizio del documento
   - tipoAffidamento: scegli tra "fornitura", "servizi" o "lavori" in base al contenuto

3. RIFERIMENTI DOCUMENTO (CRUCIALE - LEGGI ATTENTAMENTE):
   - numeroPreventivo: numero assegnato dal FORNITORE al preventivo (può essere in qualsiasi formato alfanumerico)

   - numeroProtocollo: cerca ESATTAMENTE questa sequenza nel testo:
     * Cerca la stringa "Reg. nr." oppure "Reg.nr." oppure "Reg nr"
     * Subito dopo troverai il numero in formato "XXXXXXX/AAAA" (può avere zeri iniziali)
     * ESEMPI REALI da estrarre:
       - "Reg. nr.0005229/2025 del 11/09/2025" → estrai "0005229/2025"
       - "Reg.nr.0001234/2024 del 05/03/2024" → estrai "0001234/2024"
       - "Reg. nr.0000123/2023 del 20/12/2023" → estrai "0000123/2023"
     * MANTIENI gli zeri iniziali nel numero (es. "0005229/2025", NON "5229/2025")

   - dataProtocollo: cerca ESATTAMENTE la data subito dopo il numero di protocollo:
     * Cerca la parola "del" dopo il numero di protocollo
     * La data sarà nel formato "GG/MM/AAAA" (es. "11/09/2025")
     * ESEMPIO: "Reg. nr.0005229/2025 del 11/09/2025" → estrai "11/09/2025"

4. VOCI/ARTICOLI:
   - vociPreventivo: array di voci, ciascuna con:
     * descrizione: descrizione della voce/articolo
     * quantita: quantità numerica
     * prezzoUnitario: prezzo unitario IVA esclusa (numero decimale preciso)
     * iva: aliquota IVA in percentuale (es. 22 per 22%)
     NON calcolare importi per singola voce - solo il prezzo unitario

5. IMPORTI COMPLESSIVI:
   - importoImponibile: totale imponibile (IVA esclusa) - cerca "Imponibile", "Totale IVA esclusa"
   - importoIva: totale IVA - cerca "IVA", "Imposta"
   - importoTotale: totale generale (IVA inclusa) - cerca "Totale", "Totale IVA inclusa"

6. NOTE:
   - note: eventuali note o condizioni particolari

ESEMPIO OUTPUT (nota i numeri con SOLO punto decimale e gli zeri nel protocollo):
{
  "fornitore": {
    "ragioneSociale": "Acme S.r.l.",
    "indirizzo": "Via Roma, 10\\n46100 Mantova (MN)",
    "email": "info@acme.it",
    "pec": "acme@pec.it",
    "partitaIva": "12345678901"
  },
  "oggetto": "Fornitura materiale informatico",
  "tipoAffidamento": "fornitura",
  "numeroPreventivo": "PREV-2024-042",
  "numeroProtocollo": "0005229/2025",
  "dataProtocollo": "11/09/2025",
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
  "note": "Consegna entro 30 giorni"
}

RICORDA - CONTROLLI FINALI:
1. Cerca "Reg. nr." o "Reg.nr." nel testo per trovare numero e data protocollo
2. MANTIENI gli zeri iniziali nel numero di protocollo (es. "0005229/2025")
3. Converti TUTTI i numeri in formato JSON standard con SOLO punto decimale:
   - PDF: "2.101,50" → JSON: 2101.50
   - PDF: "1.234,56" → JSON: 1234.56
4. Per le voci: SOLO prezzo unitario IVA esclusa (no importi per voce)
5. NON aggiungere commenti, spiegazioni o testo extra. SOLO JSON valido.`;

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
