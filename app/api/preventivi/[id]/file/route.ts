import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verifica autenticazione
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non autenticato" },
        { status: 401 }
      );
    }

    // Trova l'utente
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utente non trovato" },
        { status: 404 }
      );
    }

    // Trova il preventivo
    const preventivo = await prisma.preventivo.findUnique({
      where: { id: params.id },
    });

    if (!preventivo) {
      return NextResponse.json(
        { error: "Preventivo non trovato" },
        { status: 404 }
      );
    }

    // Verifica che il preventivo appartenga all'utente
    if (preventivo.userId !== user.id) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 403 }
      );
    }

    // Leggi il file dal filesystem
    const filePath = join(process.cwd(), "uploads", preventivo.filePath);
    const fileBuffer = await readFile(filePath);

    // Ritorna il file con headers appropriati per visualizzazione inline
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${preventivo.fileName}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Errore nel servire il file PDF:", error);
    return NextResponse.json(
      { error: "Errore nel recuperare il file" },
      { status: 500 }
    );
  }
}
