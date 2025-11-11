/**
 * Document Generator - Seconda interrogazione LLM
 *
 * Questo modulo prende i dati compilati dall'utente e genera
 * il testo finale ben formattato per il documento Word
 */

export interface DatiCompilati {
  // Fornitore
  F_Ragione: string;
  F_CF_IVA: string;
  F_Indirizzo: string;
  F_Cap_Comune_Provincia: string;
  F_Mail?: string;
  F_Pec?: string;

  // Documento
  Metodo_Invio: string;
  Lettera: "a)" | "b)";
  tipoServizioFornitura?: "servizi" | "fornitura"; // Solo per lettera b)
  Oggetto: string;
  CUP?: string;
  Codice_Lavoro?: string;
  Capitolo_Bilancio: string;
  CPV?: string;

  // Riferimenti
  Riferimento: string;
  P_Numero: string;
  P_Data: string;

  // RUP
  Proposta?: string;

  // Descrizione e voci
  vociPreventivo?: Array<{
    descrizione: string;
    quantita?: number;
    prezzoUnitario?: number;
    iva?: number;
  }>;
  Descrizione: string;

  // Note
  Condizioni?: string;
  Tempistiche?: string;
  Prescrizioni_Tecniche?: string;
  Garanzie?: string;

  // Importi
  Totale_Numero: number;
  Totale_Lettere: string;

  // Firme
  Direttore_Nome: string;
  Direttore_Ruolo: string;
  R_Nome: string;
  R_Interno: string;
  R_Mail: string;
}

export interface TestoGenerato {
  Oggetto_Completo: string; // Oggetto formattato completo
  Descrizione_Fluente: string; // Descrizione ben scritta che si integra con il testo
  Condizioni_Formattate?: string;
  Tempistiche_Formattate?: string;
  Prescrizioni_Formattate?: string;
  Garanzie_Formattate?: string;
}

/**
 * Genera il testo finale del documento usando il LLM
 */
export async function generateDocumentText(
  tipoDocumento: "AFFIDAMENTO" | "PROPOSTA" | "DETERMINA",
  datiCompilati: DatiCompilati
): Promise<TestoGenerato> {
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  const ollamaModel = process.env.OLLAMA_MODEL || "qwen2.5:7b";

  try {
    // Costruisci il prompt specifico per il tipo di documento
    const prompt = buildPrompt(tipoDocumento, datiCompilati);

    console.log(`🤖 Generazione testo documento (${tipoDocumento})...`);
    console.log(`📡 URL: ${ollamaUrl}/api/generate`);

    const startTime = Date.now();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minuti

    try {
      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Connection: "keep-alive",
        },
        body: JSON.stringify({
          model: ollamaModel,
          prompt: prompt,
          stream: false,
          format: "json",
          options: {
            temperature: 0.3, // Creatività controllata per testo formale
            top_p: 0.9,
          },
        }),
        signal: controller.signal,
      });

      const fetchTime = Date.now() - startTime;
      console.log(`⏱️ Tempo generazione: ${(fetchTime / 1000).toFixed(1)}s`);

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const generatedText = data.response;

      const totalTime = Date.now() - startTime;
      console.log(`✅ Testo generato in ${(totalTime / 1000).toFixed(1)}s`);

      clearTimeout(timeoutId);

      // Parse JSON
      let testoGenerato: TestoGenerato;
      try {
        testoGenerato = JSON.parse(generatedText);
      } catch (parseError) {
        console.error("❌ Errore parsing JSON dall'LLM:", generatedText);
        throw new Error("L'LLM non ha generato un JSON valido");
      }

      return testoGenerato;
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("❌ Timeout: Ollama non ha risposto entro 5 minuti");
        throw new Error("Timeout durante la generazione del testo");
      }

      throw fetchError;
    }
  } catch (error) {
    console.error("❌ Errore durante generazione testo:", error);

    if (error instanceof Error && error.message.includes("fetch failed")) {
      console.warn("⚠️ Ollama non è raggiungibile su:", ollamaUrl);
      throw new Error("Ollama non è raggiungibile. Avvia Ollama e riprova.");
    }

    throw error;
  }
}

/**
 * Costruisce il prompt per il LLM in base al tipo di documento
 */
function buildPrompt(
  tipoDocumento: "AFFIDAMENTO" | "PROPOSTA" | "DETERMINA",
  dati: DatiCompilati
): string {
  const basePrompt = `Sei un assistente specializzato nella redazione di documenti amministrativi per enti pubblici italiani.

Il tuo compito è generare il testo formale e ben scritto per un documento di ${tipoDocumento}.

DATI FORNITI:
${JSON.stringify(dati, null, 2)}

COMPITO:
Genera il testo finale in italiano formale e corretto per i seguenti campi:

1. **Oggetto_Completo**:
   - Deve essere una frase completa e scorrevole
   - Parte fissa: "Affidamento diretto, ai sensi dell'art. 50, comma 1, lettera ${dati.Lettera} del D.Lgs. 36/2023,"
   - Poi aggiungi: "${dati.Oggetto}"
   ${dati.CUP ? `- Poi: "{CUP}"` : ""}
   ${dati.Codice_Lavoro ? `- Poi: "{Codice Lavoro}"` : ""}
   - Infine: "Capitolo di bilancio: ${dati.Capitolo_Bilancio}"

2. **Descrizione_Fluente**:
   - Questa è la parte più importante!
   - Deve integrarsi perfettamente con il testo fisso che la precede
   - TESTO FISSO PRIMA: "si affida a codesta spettabile ditta ${dati.F_Ragione} – c.f./p.iva ${dati.F_CF_IVA}"
   - DEVI COMPLETARE LA FRASE in modo fluente

   ${dati.vociPreventivo && dati.vociPreventivo.length > 0
     ? `- Hai ${dati.vociPreventivo.length} voci da elencare
   - Formato richiesto: "${dati.Lettera === "a)" ? "dei lavori di" : dati.tipoServizioFornitura === "servizi" ? "del servizio di" : "la fornitura dei seguenti beni"}:"
   - Poi elenca: "N. [quantità] [descrizione], al costo unitario di € [prezzo] + IVA"
   - Separa le voci con A CAPO (\\n), NON usare punto e virgola
   - Esempio: "la fornitura dei seguenti beni:\\nN. 1 TV LG 55 pollici, al costo unitario di € 800,00 + IVA\\nN. 3 Mouse wireless, al costo unitario di € 25,00 + IVA"

   VOCI DA FORMATTARE:
   ${dati.vociPreventivo.map(v => `- ${v.quantita ? `N. ${v.quantita}` : ""} ${v.descrizione}${v.prezzoUnitario ? `, al costo unitario di € ${v.prezzoUnitario.toFixed(2)} + IVA` : ""}`).join('\n   ')}`
     : `- Usa il campo Descrizione fornito: "${dati.Descrizione}"`}

   ${dati.CPV ? `- Poi aggiungi: "{CPV}"` : ""}
   - TESTO FISSO DOPO: "per l'importo complessivo di € ${dati.Totale_Numero.toFixed(2)} (${dati.Totale_Lettere}) oltre ad IVA."

3. **Condizioni_Formattate** (se presenti):
   ${dati.Condizioni ? `- Formatta in modo formale: "${dati.Condizioni}"` : "- Lascia vuoto se non ci sono condizioni"}

4. **Tempistiche_Formattate** (se presenti):
   ${dati.Tempistiche ? `- Formatta in modo formale: "${dati.Tempistiche}"` : "- Lascia vuoto se non ci sono tempistiche"}

5. **Prescrizioni_Formattate** (se presenti):
   ${dati.Prescrizioni_Tecniche ? `- Formatta in modo formale: "${dati.Prescrizioni_Tecniche}"` : "- Lascia vuoto"}

6. **Garanzie_Formattate** (se presenti):
   ${dati.Garanzie ? `- Formatta in modo formale: "${dati.Garanzie}"` : "- Lascia vuoto"}

IMPORTANTE:
- Usa linguaggio formale e burocratico appropriato
- I testi devono integrarsi perfettamente con il documento
- La Descrizione_Fluente è CRUCIALE: deve completare la frase in modo naturale
- Mantieni la struttura e i riferimenti normativi corretti
- NON aggiungere commenti o spiegazioni, SOLO il JSON richiesto

ESEMPIO OUTPUT:
{
  "Oggetto_Completo": "Affidamento diretto, ai sensi dell'art. 50, comma 1, lettera b) del D.Lgs. 36/2023, della fornitura di materiale informatico. Capitolo di bilancio: 12345",
  "Descrizione_Fluente": "la fornitura dei seguenti beni: N. 5 Notebook HP EliteBook, al costo unitario di € 800,00 + IVA; N. 5 Mouse wireless, al costo unitario di € 25,00 + IVA",
  "Condizioni_Formattate": "Pagamento a 60 giorni data fattura mediante bonifico bancario.",
  "Tempistiche_Formattate": "La consegna dovrà avvenire entro 30 giorni dalla conferma d'ordine.",
  "Prescrizioni_Formattate": "",
  "Garanzie_Formattate": ""
}

GENERA ORA IL JSON:`;

  return basePrompt;
}
