/**
 * Estrae il testo da un file PDF
 *
 * @param buffer Buffer del file PDF
 * @returns Testo estratto dal PDF
 * @throws Error se il PDF non può essere processato
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // pdf2json usa require e callback
      const PDFParser = require('pdf2json');
      const pdfParser = new PDFParser();

      pdfParser.on('pdfParser_dataError', (errData: any) => {
        reject(new Error(`Errore durante l'estrazione del testo dal PDF: ${errData.parserError}`));
      });

      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          // Estrai il testo da tutte le pagine
          let fullText = '';

          if (pdfData.Pages && Array.isArray(pdfData.Pages)) {
            for (const page of pdfData.Pages) {
              if (page.Texts && Array.isArray(page.Texts)) {
                for (const text of page.Texts) {
                  if (text.R && Array.isArray(text.R)) {
                    for (const run of text.R) {
                      if (run.T) {
                        // Decodifica l'URI encoding
                        fullText += decodeURIComponent(run.T) + ' ';
                      }
                    }
                  }
                }
              }
              fullText += '\n';
            }
          }

          // Rimuove spazi multipli e righe vuote eccessive
          const cleanedText = fullText
            .replace(/\s+/g, ' ')           // Sostituisce spazi multipli con uno solo
            .replace(/\n{3,}/g, '\n\n')     // Rimuove più di 2 newline consecutive
            .trim();

          if (!cleanedText || cleanedText.length < 10) {
            reject(new Error("Il PDF sembra vuoto o non contiene testo estraibile"));
            return;
          }

          resolve(cleanedText);
        } catch (error) {
          reject(error);
        }
      });

      // Parse il buffer
      pdfParser.parseBuffer(buffer);
    } catch (error) {
      if (error instanceof Error) {
        reject(new Error(`Errore durante l'estrazione del testo dal PDF: ${error.message}`));
      } else {
        reject(new Error("Errore sconosciuto durante l'estrazione del testo dal PDF"));
      }
    }
  });
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
  return new Promise((resolve, reject) => {
    try {
      const PDFParser = require('pdf2json');
      const pdfParser = new PDFParser();

      pdfParser.on('pdfParser_dataError', (errData: any) => {
        reject(new Error(`Errore durante l'estrazione del PDF: ${errData.parserError}`));
      });

      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          // Estrai il testo da tutte le pagine
          let fullText = '';

          if (pdfData.Pages && Array.isArray(pdfData.Pages)) {
            for (const page of pdfData.Pages) {
              if (page.Texts && Array.isArray(page.Texts)) {
                for (const text of page.Texts) {
                  if (text.R && Array.isArray(text.R)) {
                    for (const run of text.R) {
                      if (run.T) {
                        fullText += decodeURIComponent(run.T) + ' ';
                      }
                    }
                  }
                }
              }
              fullText += '\n';
            }
          }

          const cleanedText = fullText
            .replace(/\s+/g, ' ')
            .replace(/\n{3,}/g, '\n\n')
            .trim();

          if (!cleanedText || cleanedText.length < 10) {
            reject(new Error("Il PDF sembra vuoto o non contiene testo estraibile"));
            return;
          }

          // Estrai metadati
          const numPages = pdfData.Pages ? pdfData.Pages.length : 0;
          const meta = pdfData.Meta || {};

          resolve({
            text: cleanedText,
            numPages: numPages,
            info: {
              title: meta.Title,
              author: meta.Author,
              subject: meta.Subject,
              creator: meta.Creator,
              producer: meta.Producer,
              creationDate: meta.CreationDate,
            },
          });
        } catch (error) {
          reject(error);
        }
      });

      pdfParser.parseBuffer(buffer);
    } catch (error) {
      if (error instanceof Error) {
        reject(new Error(`Errore durante l'estrazione del PDF: ${error.message}`));
      } else {
        reject(new Error("Errore sconosciuto durante l'estrazione del PDF"));
      }
    }
  });
}
