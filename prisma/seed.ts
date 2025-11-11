/**
 * Script di seed per popolare il database con dati iniziali
 *
 * Esegui con: npx tsx prisma/seed.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Inizio seeding del database...\n");

  // ========== DIRIGENTI ==========
  console.log("📋 Creazione Dirigenti...");

  const dirigenteGenerale = await prisma.dirigente.upsert({
    where: { email: "magri@gardachiese.it" },
    update: {},
    create: {
      titolo: "Ing.",
      nome: "Paolo",
      cognome: "Magri",
      ruolo: "GENERALE",
      email: "magri@gardachiese.it",
      attivo: true,
    },
  });
  console.log(`  ✅ Direttore Generale: ${dirigenteGenerale.titolo} ${dirigenteGenerale.nome} ${dirigenteGenerale.cognome}`);

  const direttoreAreaTerritorio = await prisma.dirigente.upsert({
    where: { email: "panizza@gardachiese.it" },
    update: {},
    create: {
      titolo: "Ing.",
      nome: "Antonio",
      cognome: "Panizza",
      ruolo: "AREA_TERRITORIO",
      email: "panizza@gardachiese.it",
      attivo: true,
    },
  });
  console.log(`  ✅ Direttore Area Territorio: ${direttoreAreaTerritorio.titolo} ${direttoreAreaTerritorio.nome} ${direttoreAreaTerritorio.cognome}`);

  // ========== RUP ==========
  console.log("\n📋 Creazione RUP...");

  const rupTosi = await prisma.rUP.upsert({
    where: { email: "tosi.i@gardachiese.it" },
    update: {},
    create: {
      titolo: "Ing.",
      nome: "Luca",
      cognome: "Tosi",
      email: "tosi.i@gardachiese.it",
      attivo: true,
    },
  });
  console.log(`  ✅ RUP: ${rupTosi.titolo} ${rupTosi.nome} ${rupTosi.cognome}`);

  const rupMonteverdi = await prisma.rUP.upsert({
    where: { email: "monteverdi@gardachiese.it" },
    update: {},
    create: {
      titolo: "Ing.",
      nome: "Claudio",
      cognome: "Monteverdi",
      email: "monteverdi@gardachiese.it",
      attivo: true,
    },
  });
  console.log(`  ✅ RUP: ${rupMonteverdi.titolo} ${rupMonteverdi.nome} ${rupMonteverdi.cognome}`);

  // Nota: Panizza e Magri sono già inseriti come Dirigenti.
  // Per i RUP che sono anche Dirigenti, creiamo record separati senza email
  // (evita constraint UNIQUE su email)
  const rupPanizza = await prisma.rUP.upsert({
    where: { id: "rup-panizza" }, // Usa ID fisso per upsert
    update: {},
    create: {
      id: "rup-panizza",
      titolo: "Ing.",
      nome: "Antonio",
      cognome: "Panizza",
      email: null, // Email NULL perché già usata come Dirigente
      attivo: true,
    },
  });
  console.log(`  ✅ RUP: ${rupPanizza.titolo} ${rupPanizza.nome} ${rupPanizza.cognome} (anche Dirigente)`);

  const rupMagri = await prisma.rUP.upsert({
    where: { id: "rup-magri" }, // Usa ID fisso per upsert
    update: {},
    create: {
      id: "rup-magri",
      titolo: "Ing.",
      nome: "Paolo",
      cognome: "Magri",
      email: null, // Email NULL perché già usata come Dirigente
      attivo: true,
    },
  });
  console.log(`  ✅ RUP: ${rupMagri.titolo} ${rupMagri.nome} ${rupMagri.cognome} (anche Dirigente)`);

  // ========== FORNITORI DI ESEMPIO ==========
  console.log("\n📋 Creazione Fornitori di esempio...");

  const fornitore1 = await prisma.fornitore.upsert({
    where: { partitaIva: "12345678901" },
    update: {},
    create: {
      ragioneSociale: "Acme S.r.l.",
      partitaIva: "12345678901",
      codiceFiscale: "12345678901",
      indirizzo: "Via Roma, 10",
      cap: "46100",
      comune: "Mantova",
      provincia: "MN",
      email: "info@acme.it",
      pec: "acme@pec.it",
      telefono: "0376123456",
    },
  });
  console.log(`  ✅ Fornitore: ${fornitore1.ragioneSociale} (${fornitore1.partitaIva})`);

  const fornitore2 = await prisma.fornitore.upsert({
    where: { partitaIva: "98765432109" },
    update: {},
    create: {
      ragioneSociale: "Beta S.p.A.",
      partitaIva: "98765432109",
      codiceFiscale: "98765432109",
      indirizzo: "Via Milano, 20",
      cap: "25121",
      comune: "Brescia",
      provincia: "BS",
      email: "contatti@beta.it",
      pec: "beta@pec.it",
      telefono: "030987654",
    },
  });
  console.log(`  ✅ Fornitore: ${fornitore2.ragioneSociale} (${fornitore2.partitaIva})`);

  // ========== AGGIORNA USER ESISTENTE CON TELEFONO ==========
  console.log("\n📋 Aggiornamento utenti esistenti...");

  const existingUser = await prisma.user.findFirst({
    where: { email: "matteo.peretti@hotmail.it" },
  });

  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        telefono: "123", // TODO: Aggiornare con interno reale
      },
    });
    console.log(`  ✅ Aggiornato utente: ${existingUser.email} (interno: 123)`);
  } else {
    console.log(`  ⚠️ Utente matteo.peretti@hotmail.it non trovato`);
  }

  console.log("\n✅ Seeding completato con successo!\n");
}

main()
  .catch((e) => {
    console.error("\n❌ Errore durante il seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
