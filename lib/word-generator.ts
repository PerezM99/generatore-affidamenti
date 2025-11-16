/**
 * Word Generator - Generazione documento Word con sostituzione placeholder
 *
 * Usa docxtemplater per sostituire i placeholder nel template Word
 */

import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import fs from "fs";
import path from "path";

/**
 * Interfaccia per i dati compilati dall'utente nel form
 * Include sia i dati grezzi che i campi formattati dall'LLM
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
  tipoServizioFornitura?: "servizi" | "fornitura";
  Oggetto: string; // Campo formattato dall'LLM
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
  Descrizione: string; // Campo formattato dall'LLM

  // Note (campi formattati dall'LLM)
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

/**
 * Genera il documento Word sostituendo i placeholder
 *
 * @param datiCompilati - Dati inseriti dall'utente nel form (includono già i campi formattati dall'LLM)
 * @returns Buffer del documento Word generato
 */
export async function generateWordDocument(
  datiCompilati: DatiCompilati
): Promise<Buffer> {
  try {
    // 1. Carica il template Word (FIXED - con placeholder corretti)
    const templatePath = path.join(
      process.cwd(),
      "public",
      "M-APP-08A_FIXED_Ordine affidamento diretto_RUP uguale DIRIGENTE_rev00.docx"
    );

    console.log("📄 Caricamento template Word FIXED:", templatePath);

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template Word non trovato: ${templatePath}`);
    }

    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);

    // 2. Crea documento con docxtemplater
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true, // Supporta \n come a capo
      delimiters: {
        start: "{",
        end: "}",
      },
    });

    // 3. Mappa i dati ai placeholder
    // I campi formattati sono già inclusi in datiCompilati
    const placeholderData = mapDataToPlaceholders(datiCompilati);

    console.log("🔄 Sostituzione placeholder...");
    console.log("📋 Placeholder mappati:", Object.keys(placeholderData).length);

    // 4. Sostituisci i placeholder
    doc.render(placeholderData);

    // 5. Genera il buffer del documento
    const buffer = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    console.log("✅ Documento Word generato con successo");

    return buffer;
  } catch (error) {
    console.error("❌ Errore durante generazione documento Word:", error);

    if (error instanceof Error) {
      // Log errore dettagliato per docxtemplater
      console.error("Dettagli errore:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
    }

    throw error;
  }
}

/**
 * Converte newline escapati in caratteri newline reali
 * Necessario perché JSON.stringify converte \n in \\n
 */
function unescapeNewlines(text: string | undefined): string {
  if (!text) return "";
  // Sostituisce \\n con veri newline
  return text.replace(/\\n/g, "\n");
}

/**
 * Mappa i dati compilati ai placeholder del documento Word
 * Tutti i 29 placeholder del template FIXED
 * I campi formattati (Oggetto, Descrizione, ecc.) sono già inclusi in datiCompilati
 */
function mapDataToPlaceholders(
  dati: DatiCompilati
): Record<string, string> {
  return {
    // ===== FORNITORE (8 placeholder) =====
    Metodo_Invio: dati.Metodo_Invio || "PEC",
    F_Ragione: dati.F_Ragione || "",
    F_CF_IVA: dati.F_CF_IVA || "",
    F_Indirizzo: dati.F_Indirizzo || "",
    F_Cap_Comune_Provincia: dati.F_Cap_Comune_Provincia || "",
    F_Mail: dati.F_Mail || "",
    F_Pec: dati.F_Pec || "",
    Lettera: dati.Lettera || "",

    // ===== OGGETTO E RIFERIMENTI (7 placeholder) =====
    Oggetto: dati.Oggetto || "", // Campo formattato dall'LLM (già in dati)
    Capitolo_Bilancio: dati.Capitolo_Bilancio || "",
    CPV: dati.CPV || "",
    CUP: dati.CUP || "",
    Codice_Lavoro: dati.Codice_Lavoro || "",
    Riferimento: dati.Riferimento || "",
    P_Numero: dati.P_Numero || "",

    // ===== DESCRIZIONE E NOTE (5 placeholder) =====
    P_Data: dati.P_Data || "",
    Descrizione: unescapeNewlines(dati.Descrizione), // Converte \\n in newline reali
    Condizioni: unescapeNewlines(dati.Condizioni), // Converte \\n in newline reali
    Tempistiche: unescapeNewlines(dati.Tempistiche), // Converte \\n in newline reali
    Prescrizioni_Tecniche: unescapeNewlines(dati.Prescrizioni_Tecniche), // Converte \\n in newline reali
    Garanzie: unescapeNewlines(dati.Garanzie), // Converte \\n in newline reali

    // ===== IMPORTI (2 placeholder) =====
    Totale_Numero: dati.Totale_Numero?.toFixed(2) || "0.00",
    Totale_Lettere: dati.Totale_Lettere || "",

    // ===== PROPOSTA RUP (1 placeholder) =====
    Proposta: dati.Proposta || "",

    // ===== FIRME (5 placeholder) =====
    Direttore_Nome: dati.Direttore_Nome || "",
    Direttore_Ruolo: dati.Direttore_Ruolo || "",
    R_Nome: dati.R_Nome || "",
    R_Interno: dati.R_Interno || "",
    R_Mail: dati.R_Mail || "",
  };
}
