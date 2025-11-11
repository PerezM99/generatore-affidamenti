import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateDocumentText } from "@/lib/document-generator";

/**
 * POST /api/affidamenti/generate
 *
 * Genera il testo finale del documento usando il LLM
 * Questa è la seconda interrogazione LLM che formatta il testo in modo fluente
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

    console.log("🚀 Generazione documento:", tipoDocumento);
    console.log("📊 Dati compilati:", datiCompilati);

    // Chiama il LLM per generare il testo finale formattato
    const testoGenerato = await generateDocumentText(tipoDocumento, datiCompilati);

    return NextResponse.json({
      success: true,
      testo: testoGenerato,
    });
  } catch (error) {
    console.error("❌ Errore nella generazione documento:", error);
    return NextResponse.json(
      { error: "Errore nella generazione del documento" },
      { status: 500 }
    );
  }
}
