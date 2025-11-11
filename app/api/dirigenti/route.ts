import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/dirigenti
 *
 * Ottiene la lista di tutti i dirigenti attivi
 */
export async function GET() {
  try {
    // Verifica autenticazione
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    // Ottieni tutti i dirigenti attivi, ordinati per ruolo e cognome
    const dirigenti = await prisma.dirigente.findMany({
      where: {
        attivo: true,
      },
      orderBy: [
        { ruolo: "asc" }, // GENERALE prima di AREA_TERRITORIO
        { cognome: "asc" },
      ],
    });

    return NextResponse.json({
      success: true,
      dirigenti,
    });
  } catch (error) {
    console.error("Errore nel recupero dirigenti:", error);
    return NextResponse.json(
      { error: "Errore nel recupero dei dirigenti" },
      { status: 500 }
    );
  }
}
