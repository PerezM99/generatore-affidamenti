import pdfParse from "pdf-parse";

/**
 * Estrae il testo da un file PDF
 *
 * @param buffer Buffer del file PDF
 * @returns Testo estratto dal PDF
 * @throws Error se il PDF non può essere processato
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);

    // Rimuove spazi multipli e righe vuote eccessive
    const cleanedText = data.text
      .replace(/\s+/g, ' ')           // Sostituisce spazi multipli con uno solo
      .replace(/\n{3,}/g, '\n\n')     // Rimuove più di 2 newline consecutive
      .trim();

    if (!cleanedText || cleanedText.length < 10) {
      throw new Error("Il PDF sembra vuoto o non contiene testo estraibile");
    }

    return cleanedText;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Errore durante l'estrazione del testo dal PDF: ${error.message}`);
    }
    throw new Error("Errore sconosciuto durante l'estrazione del testo dal PDF");
  }
}

/**
 * Informazioni sul PDF estratte durante il parsing
 */
export interface PDFInfo {
  text: string;
  numPages: number;
  info?: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: string;
  };
}

/**
 * Estrae testo e metadati completi da un PDF
 *
 * @param buffer Buffer del file PDF
 * @returns Oggetto con testo e informazioni sul PDF
 */
export async function extractPDFInfo(buffer: Buffer): Promise<PDFInfo> {
  try {
    const data = await pdfParse(buffer);

    const cleanedText = data.text
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!cleanedText || cleanedText.length < 10) {
      throw new Error("Il PDF sembra vuoto o non contiene testo estraibile");
    }

    return {
      text: cleanedText,
      numPages: data.numpages,
      info: data.info ? {
        title: data.info.Title,
        author: data.info.Author,
        subject: data.info.Subject,
        creator: data.info.Creator,
        producer: data.info.Producer,
        creationDate: data.info.CreationDate,
      } : undefined,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Errore durante l'estrazione del PDF: ${error.message}`);
    }
    throw new Error("Errore sconosciuto durante l'estrazione del PDF");
  }
}
