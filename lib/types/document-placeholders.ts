/**
 * Tipi TypeScript per la gestione dei placeholder nei documenti Word
 *
 * Questo file definisce la struttura dati per tutti i placeholder
 * presenti nei modelli di documento (Affidamento, Proposta, Determina)
 */

/**
 * Interfaccia completa per tutti i placeholder di un documento di affidamento
 *
 * I placeholder sono raggruppati per origine:
 * - Dal preventivo (estratti automaticamente)
 * - Dall'utente (inseriti manualmente)
 * - Dal database (anagrafica dirigenti, RUP, referenti)
 * - Calcolati (generati automaticamente dalla logica)
 */
export interface DocumentPlaceholders {
  // ========== DATI FORNITORE (da preventivo) ==========
  /** Ragione sociale del fornitore */
  F_Ragione: string;

  /** Codice fiscale o P.IVA del fornitore */
  F_CF_IVA: string;

  /** Indirizzo: Via e numero civico (es. "Via Roma, 10") */
  F_Indirizzo: string;

  /** CAP, Comune e Provincia (es. "46100 Mantova (MN)") */
  F_Cap_Comune_Provincia: string;

  /** Email del fornitore (opzionale) */
  F_Mail?: string;

  /** PEC del fornitore (opzionale) */
  F_Pec?: string;

  // ========== DATI DOCUMENTO (misto preventivo + utente) ==========
  /** Metodo di invio: "PEC" o altro */
  Metodo_Invio: string;

  /** Lettera dell'articolo: "a)" per lavori, "b)" per servizi/forniture */
  Lettera: "a)" | "b)";

  /** Oggetto dell'affidamento nella forma "del servizio di..." / "della fornitura di..." / "dei lavori di..." */
  Oggetto: string;

  /** Codice CUP (solo per lavori, opzionale) */
  CUP?: string;

  /** Codice lavoro (solo per lavori, opzionale) */
  Codice_Lavoro?: string;

  /** Capitolo di bilancio */
  Capitolo_Bilancio: string;

  /** Codice CPV (Vocabolario Comune per gli Appalti) */
  CPV?: string;

  // ========== RIFERIMENTI PROTOCOLLO (da preventivo) ==========
  /** Riferimento completo: "al preventivo n. XXXXX" o "al preventivo" */
  Riferimento: string;

  /** Numero di protocollo (es. "1234/2024") */
  P_Numero: string;

  /** Data di protocollo (formato GG/MM/AAAA) */
  P_Data: string;

  // ========== PROPOSTA RUP (opzionale, da DB + utente) ==========
  /**
   * Proposta del RUP (opzionale)
   *
   * Formato: "vista la proposta del Responsabile Unico del Progetto ing. Mario Rossi in data 15/10/2024"
   *
   * Regole:
   * - Presente solo se RUP ≠ Dirigente
   * - "in data XX/XX/XXXX" solo se importo > 5.000€
   * - Vuoto se RUP = Dirigente
   */
  Proposta?: string;

  // ========== DESCRIZIONE E IMPORTI (da preventivo + utente) ==========
  /** Descrizione dettagliata dell'ordine (può essere paragrafo o elenco voci) */
  Descrizione: string;

  /** Totale IVA esclusa (numero, es. 1234.56) */
  Totale_Numero: number;

  /** Totale IVA esclusa in lettere (es. "milleduecentotrentaquattro/56") */
  Totale_Lettere: string;

  // ========== NOTE OPZIONALI (da utente) ==========
  /** Condizioni contrattuali particolari (opzionale) */
  Condizioni?: string;

  /** Tempistiche di consegna/esecuzione (opzionale) */
  Tempistiche?: string;

  /** Prescrizioni tecniche (opzionale) */
  Prescrizioni_Tecniche?: string;

  /** Garanzie richieste (opzionale) */
  Garanzie?: string;

  // ========== DATI DIRIGENTE (da DB) ==========
  /** Nome completo del dirigente con titolo (es. "Dott. Mario Rossi") */
  Direttore_Nome: string;

  /** Ruolo del dirigente: "GENERALE" o "AREA TERRITORIO" */
  Direttore_Ruolo: "GENERALE" | "AREA TERRITORIO";

  // ========== DATI REFERENTE (da DB, user loggato) ==========
  /** Nome e cognome del referente che redige il documento */
  R_Nome: string;

  /** Interno telefonico del referente */
  R_Interno: string;

  /** Email del referente */
  R_Mail: string;
}

/**
 * Tipo per i dati estratti dal preventivo mappati ai placeholder
 *
 * Questo tipo rappresenta i dati che possiamo ottenere automaticamente
 * dall'estrazione e parsing del PDF
 */
export interface ExtractedToPlaceholders {
  // Fornitore
  F_Ragione?: string;
  F_CF_IVA?: string;
  F_Indirizzo?: string;
  F_Cap_Comune_Provincia?: string;
  F_Mail?: string;
  F_Pec?: string;

  // Riferimenti
  Riferimento?: string; // Costruito da numeroPreventivo
  P_Numero?: string;
  P_Data?: string;

  // Importi
  Totale_Numero?: number;
  Totale_Lettere?: string; // Generato da Totale_Numero

  // Descrizione base
  Descrizione?: string; // Costruita da vociPreventivo o oggetto
}

/**
 * Tipo per i dati che l'utente deve inserire manualmente
 */
export interface UserInputPlaceholders {
  // Classificazione
  Lettera: "a)" | "b)";
  Metodo_Invio: string;

  // Oggetto personalizzato
  Oggetto: string;

  // Codici (opzionali per lavori)
  CUP?: string;
  Codice_Lavoro?: string;
  Capitolo_Bilancio: string;
  CPV?: string;

  // Descrizione aggiuntiva (se necessaria)
  Descrizione_Extra?: string;

  // Note
  Condizioni?: string;
  Tempistiche?: string;
  Prescrizioni_Tecniche?: string;
  Garanzie?: string;

  // Selezioni da DB
  dirigenteId: string; // ID del dirigente selezionato
  rupId?: string; // ID del RUP selezionato (opzionale)
  dataPropostaRup?: string; // Data proposta RUP (se importo > 5000€)
}

/**
 * Tipo per validare che tutti i placeholder obbligatori siano presenti
 */
export type RequiredPlaceholders = Required<
  Pick<
    DocumentPlaceholders,
    | "F_Ragione"
    | "F_CF_IVA"
    | "F_Indirizzo"
    | "F_Cap_Comune_Provincia"
    | "Metodo_Invio"
    | "Lettera"
    | "Oggetto"
    | "Capitolo_Bilancio"
    | "Riferimento"
    | "P_Numero"
    | "P_Data"
    | "Descrizione"
    | "Totale_Numero"
    | "Totale_Lettere"
    | "Direttore_Nome"
    | "Direttore_Ruolo"
    | "R_Nome"
    | "R_Interno"
    | "R_Mail"
  >
>;

/**
 * Enum per il tipo di documento da generare
 */
export enum TipoDocumento {
  AFFIDAMENTO = "AFFIDAMENTO",
  PROPOSTA_AFFIDAMENTO = "PROPOSTA_AFFIDAMENTO",
  DETERMINA = "DETERMINA",
}

/**
 * Enum per il tipo di affidamento (mappato da tipoAffidamento)
 */
export enum TipoAffidamento {
  LAVORI = "lavori",
  SERVIZI = "servizi",
  FORNITURA = "fornitura",
}

/**
 * Helper per mappare TipoAffidamento a Lettera
 */
export function getLetteraFromTipo(tipo: TipoAffidamento): "a)" | "b)" {
  return tipo === TipoAffidamento.LAVORI ? "a)" : "b)";
}

/**
 * Helper per formattare indirizzo completo
 */
export function formatIndirizzoCompleto(
  cap?: string,
  comune?: string,
  provincia?: string
): string {
  if (!cap || !comune) return "";

  if (provincia) {
    return `${cap} ${comune} (${provincia})`;
  }
  return `${cap} ${comune}`;
}

/**
 * Helper per costruire riferimento preventivo
 */
export function buildRiferimento(numeroPreventivo?: string): string {
  if (numeroPreventivo) {
    return `al preventivo n. ${numeroPreventivo}`;
  }
  return "al preventivo";
}

/**
 * Helper per convertire numero in lettere (semplificato)
 *
 * TODO: Implementare conversione completa numero -> lettere
 * Per ora ritorna placeholder da completare manualmente
 */
export function numberToWords(num: number): string {
  // Implementazione base - da completare con libreria dedicata
  const parts = num.toFixed(2).split(".");
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Per ora ritorna formato base
  return `${integerPart}/${decimalPart}`;
}

/**
 * Helper per costruire testo proposta RUP
 */
export function buildPropostaRup(
  rupNome: string,
  rupTitolo: string,
  dataProposta?: string,
  importo?: number
): string {
  const baseText = `vista la proposta del Responsabile Unico del Progetto ${rupTitolo} ${rupNome}`;

  // Aggiungi data solo se importo > 5000€ e data presente
  if (importo && importo > 5000 && dataProposta) {
    return `${baseText} in data ${dataProposta}`;
  }

  return baseText;
}
