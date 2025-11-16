/**
 * LLM Parser per estrarre dati strutturati dal testo del preventivo
 *
 * Questo modulo si connette all'API di OpenAI per analizzare
 * il testo estratto dal PDF e restituire dati strutturati.
 */

import OpenAI from "openai";

// Interfaccia per i dati estratti dal preventivo
export interface ExtractedData {
  // Dati fornitore
  fornitore?: {
    ragioneSociale?: string; // Nome o ragione sociale
    indirizzo?: string; // Via e numero civico (es. "Via Europa, 30")
    capComuneProvincia?: string; // CAP, comune e provincia (es. "46100 Mantova (MN)")
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
 * Estrae dati strutturati dal testo del preventivo usando OpenAI API
 *
 * @param rawText Testo estratto dal PDF
 * @returns Dati strutturati estratti
 */
export async function parseWithLLM(rawText: string): Promise<ExtractedData> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const openaiModel = process.env.OPENAI_MODEL || "gpt-5-nano";

  if (!openaiApiKey) {
    throw new Error("OPENAI_API_KEY non configurata nel file .env");
  }

  try {
    // Inizializza il client OpenAI
    const client = new OpenAI({
      apiKey: openaiApiKey,
    });

    // Costruisce il prompt con il testo del preventivo
    const prompt = EXTRACTION_PROMPT_TEMPLATE.replace("{TEXT}", rawText);

    console.log(`🤖 Chiamata a OpenAI (${openaiModel})...`);
    console.log(`📊 Lunghezza prompt: ${prompt.length} caratteri`);

    const startTime = Date.now();

    // Chiama l'API di OpenAI usando la nuova API responses
    const response = await client.responses.create({
      model: openaiModel,
      input: prompt,
    });

    const totalTime = Date.now() - startTime;
    console.log(
      `✅ Risposta ricevuta da OpenAI in ${(totalTime / 1000).toFixed(1)}s`
    );

    // Estrai il testo generato
    const generatedText = response.output_text;

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
    console.log("   CAP/Comune/Prov:", extractedData.fornitore?.capComuneProvincia || "N/A");
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
  } catch (error) {
    console.error("❌ Errore durante parsing con OpenAI:", error);

    if (error instanceof Error) {
      // Gestisci errori specifici di OpenAI
      if (error.message.includes("API key")) {
        throw new Error(
          "Errore di autenticazione OpenAI. Verifica la tua API key."
        );
      }
      if (error.message.includes("model")) {
        throw new Error(
          `Modello ${openaiModel} non disponibile. Verifica il nome del modello.`
        );
      }
    }

    throw error;
  }
}

/**
 * Template del prompt per l'LLM
 * Guida l'LLM nell'estrazione dei dati secondo la struttura definita
 */
export const EXTRACTION_PROMPT_TEMPLATE = `Analizza il seguente preventivo italiano per enti pubblici ed estrai i dati in formato JSON.

TESTO:
{TEXT}

REGOLE:
- Estrai SOLO dati presenti nel testo, NON inventare nulla
- Se un campo manca, omettilo dal JSON
- Restituisci SOLO JSON valido, nessun altro testo

=== DESCRIZIONE SINTETICA ===
Completa: "Affidamento diretto, ai sensi dell'art. 50, comma 1, lettera b) del D.Lgs. 36/2023, [TUA PARTE]"

Scrivi SOLO [TUA PARTE]:
- Inizia con "della fornitura di", "del servizio di" o "per i lavori di"
- Aggiungi breve descrizione (es: "materiale informatico")
- Termina con un punto finale
- NON ripetere l'intestazione

=== DESCRIZIONE ESTESA ===
Completa: "...si affida alla spettabile ditta [NOME], c.f./p.iva [P.IVA], [TUA PARTE]"

Scrivi SOLO [TUA PARTE] dopo "p.iva XXXXXXX, ":

CON elenco voci (se ci sono quantità e prezzi):
"la fornitura di:\n- N. [qty] [descrizione breve], al costo unitario di € [prezzo],XX + IVA;\n- N. [qty] [descrizione breve], al costo unitario di € [prezzo],XX + IVA."

SENZA elenco (servizio generico):
"il servizio di [descrizione 2-3 righe]."

IMPORTANTE:
- Usa \n (newline) tra le voci dell'elenco
- Ogni voce termina con ; (punto e virgola), l'ultima con . (punto)
- Riassumi sigle lunghe non essenziali (es: "monitor LED" invece di "ASUS VG279QM 27\" FHD IPS 280Hz...")
- Mantieni specifiche tecniche importanti (es: dimensioni, potenza, certificazioni)
- NON iniziare con "Si affida" o "Con riferimento"

=== INDIRIZZO FORNITORE ===
Dividi l'indirizzo in DUE parti:
- "indirizzo": solo via e numero civico (es: "Via Europa, 30")
- "capComuneProvincia": CAP, comune e provincia (es: "46100 Mantova (MN)")

=== STRUTTURA JSON ===

{
  "fornitore": {
    "ragioneSociale": "...",
    "indirizzo": "...",
    "capComuneProvincia": "...",
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

Restituisci SOLO il JSON.`;

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
