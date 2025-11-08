/**
 * LLM Parser per estrarre dati strutturati dal testo del preventivo
 *
 * Questo modulo si connette a un LLM locale (Ollama) per analizzare
 * il testo estratto dal PDF e restituire dati strutturati.
 */

// Interfaccia per i dati estratti dal preventivo
export interface ExtractedData {
  // Importi
  importoTotale?: number;
  importoIvaEsclusa?: number;
  importoIvaInclusa?: number;
  iva?: number;

  // Dati fornitore
  fornitore?: {
    ragioneSociale?: string;
    partitaIva?: string;
    codiceFiscale?: string;
    indirizzo?: string;
    citta?: string;
    cap?: string;
    telefono?: string;
    email?: string;
    pec?: string;
  };

  // Descrizione lavori/servizi
  oggetto?: string;
  descrizione?: string;
  vociPreventivo?: Array<{
    descrizione: string;
    quantita?: number;
    prezzoUnitario?: number;
    importo?: number;
  }>;

  // Date e scadenze
  dataPreventivo?: string;
  validitaPreventivo?: string;
  tempiConsegna?: string;

  // Altri dati utili
  numeroPreventivo?: string;
  note?: string;
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
 * Verrà usato quando l'integrazione sarà completata
 */
export const EXTRACTION_PROMPT_TEMPLATE = `Sei un assistente specializzato nell'estrazione di dati da preventivi italiani.

Analizza il seguente testo estratto da un preventivo e ritorna un oggetto JSON con i dati strutturati.

TESTO PREVENTIVO:
{TEXT}

Estrai i seguenti dati (se presenti nel testo):
- Importo totale, IVA esclusa, IVA inclusa
- Dati fornitore (ragione sociale, P.IVA, indirizzo, contatti)
- Oggetto e descrizione dei lavori/servizi
- Voci di preventivo (descrizione, quantità, prezzo unitario)
- Date (data preventivo, validità, tempi di consegna)
- Numero preventivo e note

Ritorna SOLO un oggetto JSON valido nel seguente formato:
{
  "importoTotale": 1000.00,
  "importoIvaEsclusa": 820.00,
  "importoIvaInclusa": 1000.00,
  "iva": 22,
  "fornitore": {
    "ragioneSociale": "Nome Azienda S.r.l.",
    "partitaIva": "12345678901",
    ...
  },
  "oggetto": "Descrizione breve",
  "descrizione": "Descrizione dettagliata",
  ...
}

NON aggiungere commenti o testo extra. SOLO JSON valido.`;

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
