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
 * - Prende i dati compilati (incluso il testo già generato dall'LLM)
 * - Genera documento Word con sostituzione placeholder
 * - Restituisce il file Word come download
 *
 * NOTA: La chiamata LLM avviene PRIMA, in /api/affidamenti/generate-text
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
      datiCompilati, // Tutti i dati dal form (incluso testo già generato dall'LLM)
      testoGenerato, // Testo generato dall'LLM nella chiamata precedente
    } = body;

    console.log("📄 Generazione documento Word finale");
    console.log("📊 Tipo documento:", tipoDocumento);
    console.log("📝 Dati compilati:", datiCompilati);
    console.log("✍️ Testo generato (da LLM):", testoGenerato);

    // Genera documento Word con i placeholder sostituiti
    console.log("\n📄 Generazione documento Word...");
    const wordBuffer = await generateWordDocument(datiCompilati, testoGenerato);
    console.log("✅ Documento Word generato con successo");

    // FASE 3: Restituisci il file come download
    const fileName = `Affidamento_${datiCompilati.F_Ragione?.replace(/[^a-zA-Z0-9]/g, "_") || "Fornitore"}_${new Date().toISOString().split("T")[0]}.docx`;

    console.log(`📥 Invio file: ${fileName}`);

    return new NextResponse(wordBuffer, {
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
