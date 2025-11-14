import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateWordDocument } from "@/lib/word-generator";

// Timeout normale per generazione Word (senza LLM)
export const maxDuration = 60;

/**
 * POST /api/affidamenti/generate
 *
 * Genera il documento Word finale:
 * - Prende i dati compilati dal form (che includono già i campi formattati dall'LLM)
 * - Genera documento Word con sostituzione placeholder
 * - Restituisce il file Word come download
 *
 * NOTA: L'unica chiamata LLM avviene durante il parsing del PDF (in /api/preventivi/parse)
 * e genera sia dati strutturati che i 6 campi formattati in un'unica chiamata
 */
export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const body = await request.json();
    const {
      tipoDocumento, // "AFFIDAMENTO" | "PROPOSTA" | "DETERMINA"
      datiCompilati, // Tutti i dati dal form (includono già i campi formattati dall'LLM)
    } = body;

    console.log("📄 Generazione documento Word finale");
    console.log("📊 Tipo documento:", tipoDocumento);
    console.log("📝 Dati compilati (con campi formattati):", datiCompilati);

    // Genera documento Word con i placeholder sostituiti
    // I campi formattati (Oggetto, Descrizione, ecc.) sono già inclusi in datiCompilati
    console.log("\n📄 Generazione documento Word...");
    const wordBuffer = await generateWordDocument(datiCompilati);
    console.log("✅ Documento Word generato con successo");

    // FASE 3: Restituisci il file come download
    const fileName = `Affidamento_${datiCompilati.F_Ragione?.replace(/[^a-zA-Z0-9]/g, "_") || "Fornitore"}_${new Date().toISOString().split("T")[0]}.docx`;

    console.log(`📥 Invio file: ${fileName}`);

    // Converti Buffer in Uint8Array per compatibilità con NextResponse
    return new NextResponse(new Uint8Array(wordBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": wordBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("❌ Errore nella generazione documento:", error);

    // Log stack trace per debugging
    if (error instanceof Error) {
      console.error("Stack trace:", error.stack);
    }

    return NextResponse.json(
      {
        error: "Errore nella generazione del documento",
        details: error instanceof Error ? error.message : "Errore sconosciuto",
      },
      { status: 500 }
    );
  }
}
