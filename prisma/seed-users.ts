/**
 * Script di seed per popolare gli utenti con interni telefonici
 *
 * Esegui con: npx tsx prisma/seed-users.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Lista utenti con interni telefonici
const users = [
  { nome: "Valentina", cognome: "Caldarella", interno: "245", email: "caldarella@gardachiese.it" },
  { nome: "Elena", cognome: "Cantarelli", interno: "237", email: "cantarelli@gardachiese.it" },
  { nome: "Alessandra", cognome: "Castagna", interno: "205", email: "castagna@gardachiese.it" },
  { nome: "Debora", cognome: "Tosoni", interno: "276", email: "tosoni@gardachiese.it" },
  { nome: "Direttore", cognome: "Amministrativo", interno: "227", email: "amministrativo@gardachiese.it" },
  { nome: "Aurora", cognome: "Bottazzi", interno: "225", email: "bottazzi@gardachiese.it" },
  { nome: "Nicole", cognome: "Scaravelli", interno: "223", email: "scaravelli@gardachiese.it" },
  { nome: "Irene", cognome: "Gandolfi", interno: "244", email: "gandolfi@gardachiese.it" },
  { nome: "Andrea", cognome: "Ganzerla", interno: "218", email: "ganzerla@gardachiese.it" },
  { nome: "Valentina", cognome: "Signoretti", interno: "202", email: "signoretti@gardachiese.it" },
  { nome: "Andrea", cognome: "Boni", interno: "216", email: "boni@gardachiese.it" },
  { nome: "Alessandro", cognome: "Cortelazzi", interno: "209", email: "cortelazzi@gardachiese.it" },
  { nome: "Sara", cognome: "Daeder", interno: "236", email: "daeder@gardachiese.it" },
  { nome: "Denis", cognome: "Girelli", interno: "217", email: "girelli@gardachiese.it" },
  { nome: "Stefano", cognome: "Lucchini", interno: "249", email: "lucchini@gardachiese.it" },
  { nome: "Claudio", cognome: "Monteverdi", interno: "211", email: "monteverdi@gardachiese.it" },
  { nome: "Luca", cognome: "Papotti", interno: "222", email: "papotti@gardachiese.it" },
  { nome: "Norma", cognome: "Rondini", interno: "243", email: "rondini@gardachiese.it" },
  { nome: "Luca", cognome: "Tosi", interno: "246", email: "tosi.i@gardachiese.it" }, // Ing. Luca Tosi
  { nome: "Sara", cognome: "Pieropan", interno: "272", email: "pieropan@gardachiese.it" },
  { nome: "Alessandro", cognome: "Borghesan", interno: "208", email: "borghesan@gardachiese.it" },
  { nome: "Andrea", cognome: "Lavagnini", interno: "206", email: "lavagnini@gardachiese.it" },
  { nome: "Gianluca", cognome: "Lazzarini", interno: "213", email: "lazzarini@gardachiese.it" },
  { nome: "Aldo", cognome: "Bignotti", interno: "241", email: "bignotti@gardachiese.it" },
  { nome: "Sala", cognome: "Consiliare", interno: "221", email: "consiliare@gardachiese.it" },
  { nome: "Tiziana", cognome: "Barbiero", interno: "285", email: "barbiero@gardachiese.it" },
  { nome: "Monica", cognome: "Madella", interno: "215", email: "madella@gardachiese.it" },
  { nome: "Veronica", cognome: "Minuti", interno: "238", email: "minuti@gardachiese.it" },
  { nome: "Andrea", cognome: "Baraldi", interno: "274", email: "baraldi@gardachiese.it" },
  { nome: "Simone", cognome: "Bianchi", interno: "207", email: "bianchi@gardachiese.it" },
  { nome: "Antonio", cognome: "Panizza", interno: "214", email: "panizza@gardachiese.it" },
  { nome: "Chiara", cognome: "Salami", interno: "242", email: "salami@gardachiese.it" },
  { nome: "Cristian", cognome: "Stafetta", interno: "220", email: "stafetta@gardachiese.it" },
  { nome: "Elisa", cognome: "Zanichelli", interno: "297", email: "zanichelli@gardachiese.it" },
  { nome: "Stefano", cognome: "Balestra", interno: "226", email: "balestra@gardachiese.it" },
  { nome: "Matteo", cognome: "Peretti", interno: "219", email: "peretti@gardachiese.it" },
  { nome: "Luca", cognome: "Tosi", interno: "247", email: "tosi.p@gardachiese.it" }, // Perito Luca Tosi
  { nome: "Paolo", cognome: "Magri", interno: "212", email: "magri@gardachiese.it" },
  { nome: "Gianluca", cognome: "Memini", interno: "201", email: "memini@gardachiese.it" },
  { nome: "Massimo", cognome: "Berasi", interno: "273", email: "berasi@gardachiese.it" },
  { nome: "Francesco", cognome: "Rampani", interno: "275", email: "rampani@gardachiese.it" },
];

async function main() {
  console.log("🌱 Inizio seeding utenti con interni telefonici...\n");

  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const userData of users) {
    try {
      // Verifica se l'utente esiste già
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        // Aggiorna solo se non ha già un telefono o se è diverso
        if (!existingUser.telefono || existingUser.telefono !== userData.interno) {
          await prisma.user.update({
            where: { email: userData.email },
            data: {
              name: `${userData.nome} ${userData.cognome}`,
              telefono: userData.interno,
            },
          });
          console.log(`  ✅ Aggiornato: ${userData.nome} ${userData.cognome} (${userData.email}) - Interno: ${userData.interno}`);
          updatedCount++;
        } else {
          console.log(`  ⏭️  Saltato: ${userData.nome} ${userData.cognome} (già configurato)`);
          skippedCount++;
        }
      } else {
        // Crea nuovo utente (verrà completato al primo login con magic link)
        await prisma.user.create({
          data: {
            email: userData.email,
            name: `${userData.nome} ${userData.cognome}`,
            telefono: userData.interno,
            emailVerified: null, // Verrà verificato al primo login
          },
        });
        console.log(`  ✨ Creato: ${userData.nome} ${userData.cognome} (${userData.email}) - Interno: ${userData.interno}`);
        createdCount++;
      }
    } catch (error) {
      console.error(`  ❌ Errore per ${userData.nome} ${userData.cognome}:`, error);
    }
  }

  console.log(`\n📊 Riepilogo:`);
  console.log(`  - Creati: ${createdCount}`);
  console.log(`  - Aggiornati: ${updatedCount}`);
  console.log(`  - Saltati: ${skippedCount}`);
  console.log(`  - Totale processati: ${users.length}`);
  console.log("\n✅ Seeding utenti completato!\n");
}

main()
  .catch((e) => {
    console.error("\n❌ Errore durante il seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
