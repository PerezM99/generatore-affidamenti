import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseWithLLM } from "@/lib/llm-parser";

/**
 * API route per parsare il testo di un preventivo con LLM
 *
 * POST /api/preventivi/parse
 * Body: { preventivoId: string }
 *
 * Estrae i dati strutturati dal testo del preventivo usando Ollama
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verifica autenticazione
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non autenticato" },
        { status: 401 }
      );
    }

    // 2. Recupera utente dal database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utente non trovato" },
        { status: 404 }
      );
    }

    // 3. Recupera ID preventivo dal body
    const body = await request.json();
    const { preventivoId } = body;

    if (!preventivoId) {
      return NextResponse.json(
        { error: "ID preventivo mancante" },
        { status: 400 }
      );
    }

    // 4. Recupera preventivo dal database
    const preventivo = await prisma.preventivo.findUnique({
      where: { id: preventivoId },
    });

    if (!preventivo) {
      return NextResponse.json(
        { error: "Preventivo non trovato" },
        { status: 404 }
      );
    }

    // 5. Verifica che il preventivo appartenga all'utente
    if (preventivo.userId !== user.id) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 403 }
      );
    }

    // 6. Verifica che ci sia testo estratto
    if (!preventivo.rawText) {
      return NextResponse.json(
        { error: "Nessun testo estratto dal preventivo" },
        { status: 400 }
      );
    }

    // 7. Chiama LLM per estrarre dati strutturati
    let extractedData;
    try {
      console.log(`📄 Parsing preventivo ${preventivo.id} con LLM...`);
      extractedData = await parseWithLLM(preventivo.rawText);
    } catch (llmError) {
      console.error("Errore durante parsing LLM:", llmError);

      // Aggiorna status a ERROR
      await prisma.preventivo.update({
        where: { id: preventivoId },
        data: {
          status: "ERROR",
          errorMessage: llmError instanceof Error
            ? llmError.message
            : "Errore sconosciuto durante il parsing",
        },
      });

      return NextResponse.json(
        {
          error: "Errore durante l'estrazione dati con LLM",
          details: llmError instanceof Error ? llmError.message : "Errore sconosciuto"
        },
        { status: 500 }
      );
    }

    // 8. Salva dati estratti nel database
    const updatedPreventivo = await prisma.preventivo.update({
      where: { id: preventivoId },
      data: {
        extractedData: extractedData as any, // Prisma Json type
        status: "PARSED",
        errorMessage: null,
      },
    });

    console.log(`✅ Preventivo ${preventivo.id} parsato con successo`);

    // 9. Ritorna dati estratti
    return NextResponse.json({
      success: true,
      preventivo: {
        id: updatedPreventivo.id,
        status: updatedPreventivo.status,
        extractedData: updatedPreventivo.extractedData,
      },
    });

  } catch (error) {
    console.error("Errore durante parsing preventivo:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
