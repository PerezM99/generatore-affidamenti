import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractPDFInfo } from "@/lib/pdf-extractor";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

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

    // 3. Estrai il file dal form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Nessun file caricato" },
        { status: 400 }
      );
    }

    // 4. Valida che sia un PDF
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Il file deve essere un PDF" },
        { status: 400 }
      );
    }

    // 5. Limita dimensione file (es. 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Il file non può superare i 10MB" },
        { status: 400 }
      );
    }

    // 6. Converti file in buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 7. Estrai testo e metadati dal PDF
    let pdfInfo;
    try {
      pdfInfo = await extractPDFInfo(buffer);
    } catch (error) {
      return NextResponse.json(
        {
          error: error instanceof Error
            ? error.message
            : "Errore durante l'estrazione del testo dal PDF"
        },
        { status: 422 }
      );
    }

    // 8. Salva il file su disco
    const uploadsDir = join(process.cwd(), "uploads");

    // Crea directory uploads se non esiste
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Nome file univoco: timestamp_originalname
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const filePath = join(uploadsDir, fileName);

    await writeFile(filePath, buffer);

    // 9. Salva nel database
    const preventivo = await prisma.preventivo.create({
      data: {
        fileName: file.name,
        fileSize: file.size,
        filePath: fileName, // Salvo solo il nome, non il path completo
        rawText: pdfInfo.text,
        status: "EXTRACTED",
        userId: user.id,
      },
    });

    // 10. Ritorna risposta con dati estratti
    return NextResponse.json({
      success: true,
      preventivo: {
        id: preventivo.id,
        fileName: preventivo.fileName,
        fileSize: preventivo.fileSize,
        numPages: pdfInfo.numPages,
        rawText: preventivo.rawText, // Testo completo per la visualizzazione
        textPreview: pdfInfo.text.substring(0, 500) + "...", // Anteprima primi 500 caratteri
        status: preventivo.status,
        createdAt: preventivo.createdAt,
      },
    });

  } catch (error) {
    console.error("Errore durante upload preventivo:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
