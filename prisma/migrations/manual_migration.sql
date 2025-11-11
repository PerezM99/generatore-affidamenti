-- ============================================
-- MIGRATION MANUALE: Aggiunte tabelle Fornitore, Dirigente, RUP, Affidamento
-- Data: 2025-11-11
-- ============================================

-- Step 1: Crea ENUM per ruolo dirigente
CREATE TYPE "DirigenteRuolo" AS ENUM ('GENERALE', 'AREA_TERRITORIO');

-- Step 2: Crea ENUM per tipo documento
CREATE TYPE "TipoDocumento" AS ENUM ('AFFIDAMENTO', 'PROPOSTA_AFFIDAMENTO', 'DETERMINA');

-- Step 3: Modifica tabella User (aggiungi campo telefono)
ALTER TABLE "User" ADD COLUMN "telefono" TEXT;

-- Step 4: Crea tabella Fornitore
CREATE TABLE "Fornitore" (
    "id" TEXT NOT NULL,
    "ragioneSociale" TEXT NOT NULL,
    "codiceFiscale" TEXT,
    "partitaIva" TEXT,
    "indirizzo" TEXT,
    "cap" TEXT,
    "comune" TEXT,
    "provincia" TEXT,
    "email" TEXT,
    "pec" TEXT,
    "telefono" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fornitore_pkey" PRIMARY KEY ("id")
);

-- Step 5: Crea indice unique su partitaIva
CREATE UNIQUE INDEX "Fornitore_partitaIva_key" ON "Fornitore"("partitaIva");

-- Step 6: Crea tabella Dirigente
CREATE TABLE "Dirigente" (
    "id" TEXT NOT NULL,
    "titolo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL,
    "ruolo" "DirigenteRuolo" NOT NULL,
    "email" TEXT,
    "attivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dirigente_pkey" PRIMARY KEY ("id")
);

-- Step 7: Crea indice unique su email Dirigente
CREATE UNIQUE INDEX "Dirigente_email_key" ON "Dirigente"("email");

-- Step 8: Crea tabella RUP
CREATE TABLE "RUP" (
    "id" TEXT NOT NULL,
    "titolo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL,
    "email" TEXT,
    "attivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RUP_pkey" PRIMARY KEY ("id")
);

-- Step 9: Crea indice unique su email RUP
CREATE UNIQUE INDEX "RUP_email_key" ON "RUP"("email");

-- Step 10: Aggiungi campo fornitoreId a Preventivo
ALTER TABLE "Preventivo" ADD COLUMN "fornitoreId" TEXT;

-- Step 11: Aggiungi foreign key da Preventivo a Fornitore
ALTER TABLE "Preventivo" ADD CONSTRAINT "Preventivo_fornitoreId_fkey"
    FOREIGN KEY ("fornitoreId") REFERENCES "Fornitore"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 12: Crea tabella Affidamento
CREATE TABLE "Affidamento" (
    "id" TEXT NOT NULL,
    "preventivoId" TEXT NOT NULL,
    "tipoDocumento" "TipoDocumento" NOT NULL DEFAULT 'AFFIDAMENTO',
    "datiDocumento" JSONB NOT NULL,
    "filePath" TEXT,
    "fornitoreId" TEXT NOT NULL,
    "dirigenteId" TEXT NOT NULL,
    "rupId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Affidamento_pkey" PRIMARY KEY ("id")
);

-- Step 13: Crea foreign keys per Affidamento
ALTER TABLE "Affidamento" ADD CONSTRAINT "Affidamento_preventivoId_fkey"
    FOREIGN KEY ("preventivoId") REFERENCES "Preventivo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Affidamento" ADD CONSTRAINT "Affidamento_fornitoreId_fkey"
    FOREIGN KEY ("fornitoreId") REFERENCES "Fornitore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Affidamento" ADD CONSTRAINT "Affidamento_dirigenteId_fkey"
    FOREIGN KEY ("dirigenteId") REFERENCES "Dirigente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Affidamento" ADD CONSTRAINT "Affidamento_rupId_fkey"
    FOREIGN KEY ("rupId") REFERENCES "RUP"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Affidamento" ADD CONSTRAINT "Affidamento_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================
-- MIGRATION COMPLETATA
-- ============================================
