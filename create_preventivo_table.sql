-- ============================================
-- SQL per creare la tabella Preventivo
-- Esegui questo nella Supabase SQL Editor
-- ============================================

-- 1. Crea l'enum per lo status del preventivo
CREATE TYPE "PreventivoStatus" AS ENUM ('UPLOADED', 'EXTRACTED', 'PARSED', 'ERROR');

-- 2. Crea la tabella Preventivo
CREATE TABLE "Preventivo" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "rawText" TEXT,
    "extractedData" JSONB,
    "status" "PreventivoStatus" NOT NULL DEFAULT 'UPLOADED',
    "errorMessage" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Preventivo_pkey" PRIMARY KEY ("id")
);

-- 3. Aggiungi foreign key verso la tabella User
ALTER TABLE "Preventivo"
    ADD CONSTRAINT "Preventivo_userId_fkey"
    FOREIGN KEY ("userId")
    REFERENCES "User"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- 4. Crea indice su userId per migliorare le performance delle query
CREATE INDEX "Preventivo_userId_idx" ON "Preventivo"("userId");

-- 5. Aggiungi trigger per aggiornare automaticamente updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_preventivo_updated_at
    BEFORE UPDATE ON "Preventivo"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Verifica che tutto sia stato creato correttamente
SELECT
    'Tabella Preventivo creata con successo!' as status,
    COUNT(*) as numero_preventivi
FROM "Preventivo";
