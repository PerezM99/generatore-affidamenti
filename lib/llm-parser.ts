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
    indirizzo?: string; // Indirizzo completo
    email?: string; // Email normale (opzionale)
    pec?: string; // PEC (opzionale)
    partitaIva?: string; // Partita IVA
  };

  // Descrizioni
  descrizioneSintetica?: string; // Riassunto breve dell'oggetto del preventivo (una frase)
  descrizioneEstesa?: string; // Descrizione dettagliata delle forniture/servizi/lavori (max 5-6 righe)

  // Tipo affidamento
  tipoAffidamento?: "fornitura" | "servizi" | "lavori";

  // Voci/articoli del preventivo
  vociPreventivo?: Array<{
    descrizione: string; // Descrizione della voce
    quantita?: number; // Quantità
    prezzoUnitario?: number; // Prezzo unitario (IVA esclusa)
  }>;

  // Importo totale
  importoImponibile?: number; // Totale imponibile (IVA esclusa)

  // Condizioni rilevanti
  condizioniRilevanti?: string[]; // Array di condizioni importanti (consegna, garanzie, tempi, ecc.)
}

/**
 * Estrae dati strutturati dal testo del preventivo usando un LLM locale
 *
 * @param rawText Testo estratto dal PDF
 * @returns Dati strutturati estratti
 */
export async function parseWithLLM(rawText: string): Promise<ExtractedData> {
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  const ollamaModel = process.env.OLLAMA_MODEL || "qwen2.5:7b-instruct";

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

      // Stampa risultati nel terminale
      console.log("\n" + "=".repeat(80));
      console.log("📊 RISULTATI ESTRAZIONE DATI DAL PREVENTIVO");
      console.log("=".repeat(80));
      console.log("\n🏢 FORNITORE:");
      console.log(
        "   Ragione Sociale:",
        extractedData.fornitore?.ragioneSociale || "N/A"
      );
      console.log("   Indirizzo:", extractedData.fornitore?.indirizzo || "N/A");
      console.log("   Email:", extractedData.fornitore?.email || "N/A");
      console.log("   PEC:", extractedData.fornitore?.pec || "N/A");
      console.log("   P.IVA:", extractedData.fornitore?.partitaIva || "N/A");

      console.log("\n📝 DESCRIZIONE:");
      console.log("   Sintetica:", extractedData.descrizioneSintetica || "N/A");
      console.log("   Estesa:", extractedData.descrizioneEstesa || "N/A");

      console.log("\n📋 AFFIDAMENTO:");
      console.log("   Tipo:", extractedData.tipoAffidamento || "N/A");

      console.log("\n💰 IMPORTO:");
      console.log(
        "   Imponibile:",
        extractedData.importoImponibile
          ? `€ ${extractedData.importoImponibile.toFixed(2)}`
          : "N/A"
      );

      if (
        extractedData.vociPreventivo &&
        extractedData.vociPreventivo.length > 0
      ) {
        console.log("\n📦 VOCI PREVENTIVO:");
        extractedData.vociPreventivo.forEach((voce, index) => {
          console.log(`   ${index + 1}. ${voce.descrizione}`);
          console.log(`      Quantità: ${voce.quantita || "N/A"}`);
          console.log(
            `      Prezzo unitario: ${
              voce.prezzoUnitario
                ? `€ ${voce.prezzoUnitario.toFixed(2)}`
                : "N/A"
            }`
          );
        });
      }

      if (
        extractedData.condizioniRilevanti &&
        extractedData.condizioniRilevanti.length > 0
      ) {
        console.log("\n📌 CONDIZIONI RILEVANTI:");
        extractedData.condizioniRilevanti.forEach((condizione, index) => {
          console.log(`   ${index + 1}. ${condizione}`);
        });
      }

      console.log("\n" + "=".repeat(80));
      console.log("✅ ESTRAZIONE COMPLETATA");
      console.log("=".repeat(80) + "\n");

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
export const EXTRACTION_PROMPT_TEMPLATE = `Sei un assistente specializzato nell'analisi di preventivi italiani per enti pubblici.

Analizza il seguente TESTO del preventivo e restituisci SOLO un JSON con i dati estratti.

TESTO:
{TEXT}

REGOLE CRITICHE:
- NON inventare NESSUN dato. Se non è scritto nel testo, NON inserirlo nel JSON.
- Se un campo non è presente nel preventivo, omettilo completamente.
- Restituisci SOLO JSON valido, nessun testo aggiuntivo.

=== DESCRIZIONE SINTETICA ===

La frase completa nel documento sarà:
"Affidamento diretto, ai sensi dell'art. 50, comma 1, lettera b) del D.Lgs. 36/2023, [TUA CONTINUAZIONE]"

Tu devi scrivere SOLO la parte [TUA CONTINUAZIONE].

FORMATO:
- Inizia con: "della fornitura di" oppure "del servizio di" oppure "per i lavori di"
- Continua con una breve descrizione (es: "materiale informatico" o "manutenzione caldaie")

NON scrivere frasi complete, NON ripetere l'intestazione.

=== DESCRIZIONE ESTESA ===

La frase completa nel documento sarà:
"Con riferimento al preventivo n. X del GG/MM/AAAA, recepito a protocollo con n. Y del GG/MM/AAAA, si affida alla spettabile ditta [NOME], c.f./p.iva [P.IVA], [TUA CONTINUAZIONE]"

Tu devi scrivere SOLO la parte [TUA CONTINUAZIONE] dopo "p.iva XXXXXXX, ".

SE il preventivo contiene un ELENCO di prodotti/servizi con quantità e prezzi:
Usa questo formato con elenco puntato (un trattino per ogni voce):
"la fornitura di:
- N. [quantità] [descrizione prodotto], al costo unitario di € [prezzo],XX + IVA
- N. [quantità] [descrizione prodotto], al costo unitario di € [prezzo],XX + IVA"

SE il preventivo descrive un servizio generico SENZA elenco voci:
Scrivi 2-4 righe discorsive che spiegano di cosa si tratta.
Inizia con "il servizio di..." o "la fornitura di..." e spiega i dettagli.

IMPORTANTE: NON ripetere la frase precedente, NON iniziare con "Si affida" o "Con riferimento".

=== STRUTTURA JSON ===

{
  "fornitore": {
    "ragioneSociale": "...",
    "indirizzo": "...",
    "email": "...",
    "pec": "...",
    "partitaIva": "..."
  },

  "descrizioneSintetica": "...",

  "descrizioneEstesa": "...",

  "tipoAffidamento": "fornitura o servizi o lavori",

  "vociPreventivo": [
    {
      "descrizione": "...",
      "quantita": numero,
      "prezzoUnitario": numero
    }
  ],

  "importoImponibile": numero,

  "condizioniRilevanti": [
    "solo se presenti nel testo"
  ]
}

ATTENZIONE FINALE:
- descrizioneSintetica: breve, inizia con "della/del/per", NON è una frase completa
- descrizioneEstesa: se ci sono voci, usa formato con trattini "- N. X ..., al costo unitario..."
- vociPreventivo: estrai TUTTE le voci con quantità e prezzo dal preventivo
- condizioniRilevanti: estrai SOLO se sono scritte nel preventivo (tempi consegna, garanzie, ecc.). Se NON ci sono, ometti il campo o metti array vuoto.
- importoImponibile: estrai il totale IVA esclusa. NON inventare, usa solo il valore nel testo.

Restituisci SOLO il JSON valido.`;

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
