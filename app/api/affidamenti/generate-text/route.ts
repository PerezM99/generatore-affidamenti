import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateDocumentText } from "@/lib/document-generator";

// Aumenta timeout a 5 minuti per generazione LLM
export const maxDuration = 300;

/**
 * POST /api/affidamenti/generate-text
 *
 * SECONDA CHIAMATA LLM (dopo che l'utente ha confermato i dati strutturati):
 * - Prende i dati compilati dall'utente nel form
 * - Chiama l'LLM per generare testo ricco e scorrevole in italiano
 * - Restituisce il testo generato che l'utente potrà ancora modificare
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
      datiCompilati, // Tutti i dati dal form
    } = body;

    console.log("🤖 SECONDA CHIAMATA LLM: Generazione testo ricco");
    console.log("📊 Tipo documento:", tipoDocumento);
    console.log("📝 Dati compilati dall'utente:", datiCompilati);

    // Chiama il LLM per generare il testo finale formattato
    console.log("\n🤖 Chiamata LLM per generare testo in italiano...");
    const testoGenerato = await generateDocumentText(tipoDocumento, datiCompilati);
    console.log("✅ Testo generato con successo");
    console.log("📄 Testo generato:", testoGenerato);

    // Restituisci il testo generato
    return NextResponse.json({
      success: true,
      testoGenerato,
    });
  } catch (error) {
    console.error("❌ Errore nella generazione del testo:", error);

    // Log stack trace per debugging
    if (error instanceof Error) {
      console.error("Stack trace:", error.stack);
    }

    return NextResponse.json(
      {
        error: "Errore nella generazione del testo",
        details: error instanceof Error ? error.message : "Errore sconosciuto",
      },
      { status: 500 }
    );
  }
}
