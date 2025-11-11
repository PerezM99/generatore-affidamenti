/**
 * Word Generator - Generazione documento Word con sostituzione placeholder
 *
 * Usa docxtemplater per sostituire i placeholder nel template Word
 */

import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import fs from "fs";
import path from "path";
import { DatiCompilati, TestoGenerato } from "./document-generator";

/**
 * Genera il documento Word sostituendo i placeholder
 *
 * @param datiCompilati - Dati inseriti dall'utente nel form
 * @param testoGenerato - Testo formattato generato dall'LLM
 * @returns Buffer del documento Word generato
 */
export async function generateWordDocument(
  datiCompilati: DatiCompilati,
  testoGenerato: TestoGenerato
): Promise<Buffer> {
  try {
    // 1. Carica il template Word
    const templatePath = path.join(
      process.cwd(),
      "public",
      "M-APP-08A_TAGGED_Ordine affidamento diretto_RUP uguale DIRIGENTE_rev00.docx"
    );

    console.log("📄 Caricamento template Word:", templatePath);

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
    const placeholderData = mapDataToPlaceholders(datiCompilati, testoGenerato);

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
 * Mappa i dati compilati e il testo generato ai placeholder del documento Word
 */
function mapDataToPlaceholders(
  dati: DatiCompilati,
  testo: TestoGenerato
): Record<string, string> {
  // Calcola CF/P.IVA (se entrambi presenti, uniscili)
  let cfPiva = "";
  if (dati.F_CF_IVA) {
    cfPiva = dati.F_CF_IVA;
  }

  // Formatta cap-comune-provincia
  const capComuneProvincia = [dati.F_Cap_Comune_Provincia]
    .filter(Boolean)
    .join(" ");

  return {
    // ===== FORNITORE =====
    Metodo_Invio: dati.Metodo_Invio || "PEC",
    F_Ragione: dati.F_Ragione || "",
    F_Indirizzo: dati.F_Indirizzo || "",
    F_Cap_Comune_Provincia: capComuneProvincia,
    "F_CF/IVA": cfPiva,
    F_Mail: dati.F_Mail || "",
    F_Pec: dati.F_Pec || "",

    // ===== OGGETTO =====
    Oggetto_Completo: testo.Oggetto_Completo || "",

    // ===== RIFERIMENTI =====
    Riferimento: dati.Riferimento || "",
    P_Numero: dati.P_Numero || "",
    P_Data: dati.P_Data || "",

    // ===== CORPO DOCUMENTO =====
    Descrizione_Fluente: testo.Descrizione_Fluente || "",

    // ===== NOTE OPZIONALI =====
    Condizioni_Formattate: testo.Condizioni_Formattate || "",
    Tempistiche_Formattate: testo.Tempistiche_Formattate || "",
    Prescrizioni_Formattate: testo.Prescrizioni_Formattate || "",
    Garanzie_Formattate: testo.Garanzie_Formattate || "",

    // ===== IMPORTI =====
    Totale_Numero: dati.Totale_Numero?.toFixed(2) || "0.00",
    Totale_Lettere: dati.Totale_Lettere || "",

    // ===== PROPOSTA RUP (opzionale) =====
    Proposta: dati.Proposta || "",

    // ===== FIRME =====
    Direttore_Nome: dati.Direttore_Nome || "",
    Direttore_Ruolo: dati.Direttore_Ruolo || "",
    R_Nome: dati.R_Nome || "",
    R_Interno: dati.R_Interno || "",
    R_Mail: dati.R_Mail || "",
  };
}
