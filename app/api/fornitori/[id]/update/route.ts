import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/fornitori/[id]/update
 *
 * Aggiorna i dati di un fornitore dopo conferma utente
 * Usato per risolvere conflitti e salvare dati nuovi
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verifica autenticazione
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    // Await params in Next.js 15+
    const { id: fornitoreId } = await params;
    const body = await request.json();
    const { updatedData } = body; // Dati aggiornati dall'utente

    console.log(`🔄 Aggiornamento fornitore ${fornitoreId}`);
    console.log("📊 Dati da aggiornare:", updatedData);

    // Verifica che il fornitore esista
    const fornitore = await prisma.fornitore.findUnique({
      where: { id: fornitoreId },
    });

    if (!fornitore) {
      return NextResponse.json(
        { error: "Fornitore non trovato" },
        { status: 404 }
      );
    }

    // Aggiorna il fornitore
    const updatedFornitore = await prisma.fornitore.update({
      where: { id: fornitoreId },
      data: {
        ragioneSociale: updatedData.ragioneSociale || fornitore.ragioneSociale,
        codiceFiscale: updatedData.codiceFiscale ?? fornitore.codiceFiscale,
        partitaIva: updatedData.partitaIva ?? fornitore.partitaIva,
        indirizzo: updatedData.indirizzo ?? fornitore.indirizzo,
        cap: updatedData.cap ?? fornitore.cap,
        comune: updatedData.comune ?? fornitore.comune,
        provincia: updatedData.provincia ?? fornitore.provincia,
        email: updatedData.email ?? fornitore.email,
        pec: updatedData.pec ?? fornitore.pec,
        telefono: updatedData.telefono ?? fornitore.telefono,
      },
    });

    console.log(`✅ Fornitore ${fornitoreId} aggiornato con successo`);

    return NextResponse.json({
      success: true,
      fornitore: updatedFornitore,
    });
  } catch (error) {
    console.error("❌ Errore aggiornamento fornitore:", error);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento del fornitore" },
      { status: 500 }
    );
  }
}
