import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseWithLLM } from "@/lib/llm-parser";
import { extractProtocollo } from "@/lib/pdf-extractor";
import { matchFornitore, upsertFornitore } from "@/lib/fornitore-matcher";

// 📚 IMPORTANTE: Aumenta il timeout a 5 minuti (300 secondi)
// Qwen può impiegare 2-4 minuti per analizzare il preventivo
export const maxDuration = 300; // 5 minuti

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

    // 7. Estrai protocollo con regex (veloce e affidabile)
    console.log(`📋 Estrazione protocollo dal testo...`);
    const protocolloData = extractProtocollo(preventivo.rawText);

    // 8. Chiama LLM per estrarre gli altri dati
    let llmData;
    try {
      console.log(`📄 Parsing preventivo ${preventivo.id} con LLM...`);
      llmData = await parseWithLLM(preventivo.rawText);
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

    // 9. Combina dati: LLM + protocollo estratto con regex
    const extractedData = {
      ...llmData,
      ...protocolloData, // Sovrascrive con dati del protocollo
    };

    console.log(`✅ Dati combinati (LLM + regex protocollo)`);

    // 10. Matching fornitore con database
    let fornitoreId: string | null = null;
    let fornitoreMatchData: any = null;

    if (extractedData.fornitore) {
      console.log(`\n🔍 Inizio matching fornitore con database...`);

      try {
        const fornitoreMatched = await matchFornitore(extractedData.fornitore);

        // Sostituisci i dati del fornitore con quelli merged
        extractedData.fornitore = {
          ragioneSociale: fornitoreMatched.ragioneSociale,
          codiceFiscale: fornitoreMatched.codiceFiscale,
          partitaIva: fornitoreMatched.partitaIva,
          indirizzo: fornitoreMatched.indirizzo,
          cap: fornitoreMatched.cap,
          comune: fornitoreMatched.comune,
          provincia: fornitoreMatched.provincia,
          email: fornitoreMatched.email,
          pec: fornitoreMatched.pec,
          telefono: fornitoreMatched.telefono,
        };

        // Salva dati di matching per mostrarli all'utente
        fornitoreMatchData = {
          fornitoreId: fornitoreMatched.fornitoreId,
          isFromDatabase: fornitoreMatched.isFromDatabase,
          matchCount: fornitoreMatched.matchCount,
          matchedFields: fornitoreMatched.matchedFields,
          conflicts: fornitoreMatched.conflicts || [],
          newData: fornitoreMatched.newData || [],
          needsUserInput: fornitoreMatched.needsUserInput || false,
        };

        // Se trovato nel DB, usa l'ID esistente
        // Se non ci sono conflitti/dati nuovi, crea/aggiorna automaticamente
        // Altrimenti aspetta conferma utente
        if (!fornitoreMatched.needsUserInput) {
          fornitoreId = await upsertFornitore(fornitoreMatched);

          if (fornitoreMatched.isFromDatabase) {
            console.log(`✅ Fornitore matchato nel DB: ${fornitoreMatched.ragioneSociale}`);
            console.log(`   Match: ${fornitoreMatched.matchCount} campi (${fornitoreMatched.matchedFields?.join(", ")})`);
          } else {
            console.log(`➕ Nuovo fornitore creato: ${fornitoreMatched.ragioneSociale}`);
          }
        } else {
          // Usa l'ID esistente ma NON aggiornare il DB
          fornitoreId = fornitoreMatched.fornitoreId || null;
          console.log(`⚠️ Richiesta conferma utente per ${fornitoreMatched.conflicts?.length || 0} conflitti e ${fornitoreMatched.newData?.length || 0} dati nuovi`);
        }
      } catch (matchError) {
        console.error("⚠️ Errore durante matching fornitore:", matchError);
        console.log("   Continuo con i dati estratti dal PDF...");
      }
    }

    // 11. Salva dati estratti nel database (inclusi dati di matching)
    const dataToSave = {
      ...extractedData,
      _fornitoreMatch: fornitoreMatchData, // Metadata di matching per UI
    };

    const updatedPreventivo = await prisma.preventivo.update({
      where: { id: preventivoId },
      data: {
        extractedData: dataToSave as any, // Prisma Json type
        status: "PARSED",
        errorMessage: null,
        fornitoreId: fornitoreId, // Collega al fornitore se trovato/creato
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
