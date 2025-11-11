import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/rup
 *
 * Ottiene la lista di tutti i RUP attivi
 */
export async function GET() {
  try {
    // Verifica autenticazione
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    // Ottieni tutti i RUP attivi, ordinati per cognome
    const rups = await prisma.rUP.findMany({
      where: {
        attivo: true,
      },
      orderBy: {
        cognome: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      rups,
    });
  } catch (error) {
    console.error("Errore nel recupero RUP:", error);
    return NextResponse.json(
      { error: "Errore nel recupero dei RUP" },
      { status: 500 }
    );
  }
}
