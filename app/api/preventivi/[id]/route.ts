import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 📚 PATCH: Aggiorna i dati estratti di un preventivo
// Questa API viene chiamata quando l'utente salva le modifiche
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

    // 📚 IMPORTANTE: In Next.js 16, params è una Promise e deve essere awaited
    const { id } = await params;
    const body = await request.json();
    const { extractedData } = body;

    // 📚 VALIDAZIONE: Verifica che il preventivo esista e sia dell'utente
    const existingPreventivo = await prisma.preventivo.findUnique({
      where: { id },
      include: {
        user: {
          select: { email: true },
        },
      },
    });

    if (!existingPreventivo) {
      return NextResponse.json(
        { error: "Preventivo non trovato" },
        { status: 404 }
      );
    }

    // Verifica proprietà
    if (existingPreventivo.user.email !== session.user.email) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    // 📚 UPDATE: Aggiorna il campo extractedData nel database
    // Prisma gestisce automaticamente la conversione in JSONB
    const updatedPreventivo = await prisma.preventivo.update({
      where: { id },
      data: {
        extractedData: extractedData,
        // updatedAt viene aggiornato automaticamente dal database
      },
    });

    return NextResponse.json({
      success: true,
      preventivo: updatedPreventivo,
    });

  } catch (error) {
    console.error("❌ Errore durante l'aggiornamento del preventivo:", error);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento" },
      { status: 500 }
    );
  }
}

// 📚 GET: Recupera un preventivo per ID con tutte le relazioni
// Include: user, fornitore, affidamenti (con dirigente e rup)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verifica autenticazione
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    // 📚 IMPORTANTE: In Next.js 16, params è una Promise e deve essere awaited
    const { id } = await params;

    const preventivo = await prisma.preventivo.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            telefono: true,
          },
        },
        fornitore: true,
        affidamenti: {
          include: {
            dirigente: true,
            rup: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!preventivo) {
      return NextResponse.json(
        { error: "Preventivo non trovato" },
        { status: 404 }
      );
    }

    // Verifica proprietà
    if (preventivo.user.email !== session.user.email) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      preventivo,
    });

  } catch (error) {
    console.error("❌ Errore durante il recupero del preventivo:", error);
    return NextResponse.json(
      { error: "Errore durante il recupero" },
      { status: 500 }
    );
  }
}

// 📚 DELETE: Elimina un preventivo
// CASCADE elimina automaticamente gli affidamenti collegati
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verifica autenticazione
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const { id } = await params;

    // Verifica che il preventivo esista e sia dell'utente
    const preventivo = await prisma.preventivo.findUnique({
      where: { id },
      include: {
        user: {
          select: { email: true },
        },
      },
    });

    if (!preventivo) {
      return NextResponse.json(
        { error: "Preventivo non trovato" },
        { status: 404 }
      );
    }

    // Verifica proprietà
    if (preventivo.user.email !== session.user.email) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    // Elimina il preventivo (CASCADE eliminerà anche gli affidamenti)
    await prisma.preventivo.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Preventivo eliminato",
    });
  } catch (error) {
    console.error("❌ Errore nell'eliminazione preventivo:", error);
    return NextResponse.json(
      { error: "Errore nell'eliminazione del preventivo" },
      { status: 500 }
    );
  }
}
