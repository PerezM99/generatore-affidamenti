/**
 * Script di seed per popolare i fornitori
 *
 * Esegui con: npx tsx prisma/seed-fornitori.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const fornitori = [
  { ragioneSociale: "A.G.A. s.r.l.", indirizzo: "Via Trensasco 9A", cap: "16138", comune: "Genova", provincia: "GE", pec: "info@pec.agasrl.com", email: "elio.montagano@agasrl.com", partitaIva: null, codiceFiscale: null, telefono: null },
  { ragioneSociale: "A.s.i. Commerciale", indirizzo: "Via G. di Vittorio 30", cap: "25030", comune: "Castel Mella", provincia: "BS", pec: "a.s.i.commercialesrl@legalmail.it", email: null, partitaIva: null, codiceFiscale: null, telefono: null },
  { ragioneSociale: "A2A AMBIENTE S.p.A.", indirizzo: "via Lamarmora n. 230", cap: "25124", comune: "Brescia", provincia: "BS", pec: "a2a.ambiente@pec.a2a.eu", email: "giovanni.wieland@a2a.it", partitaIva: null, codiceFiscale: null, telefono: null },
  { ragioneSociale: "AB Service di Bardini Alessandro", indirizzo: "Via Levata n.1/F", cap: "46044", comune: "Goito", provincia: "MN", pec: "bardinialessandro@pec.it", email: "info@abserviceutility.com", partitaIva: null, codiceFiscale: null, telefono: null },
  { ragioneSociale: "ACCA software S.p.A.", indirizzo: "Contrada Rosole n° 13", cap: "83043", comune: "Bagnoli Irpino", provincia: "AV", pec: "acca@pec.it", email: null, partitaIva: null, codiceFiscale: null, telefono: null },
  { ragioneSociale: "ADV Service s.r.l.", indirizzo: "Via Montello n°8", cap: "46100", comune: "Mantova", provincia: "MN", pec: "adv.service@pec.it", email: "advservice.snc@gmail.com", partitaIva: null, codiceFiscale: null, telefono: null },
  { ragioneSociale: "AGLIETTA MARIO SaS", indirizzo: "Via Verona n°13", cap: "46100", comune: "Mantova", provincia: "MN", pec: "aglietta.mario@pec.it", email: "aglietta@aglietta.com", partitaIva: null, codiceFiscale: null, telefono: null },
  { ragioneSociale: "Agricola Riparazioni", indirizzo: "Via Toscana 30", cap: "46041", comune: "Asola", provincia: "MN", pec: null, email: "info@agricolarubes.it", partitaIva: null, codiceFiscale: null, telefono: null },
  { ragioneSociale: "Agricorte S.n.c.", indirizzo: "Via Garibaldi 5", cap: "26020", comune: "Corte de' Cortesi", provincia: "CR", pec: null, email: "agricortesnc@libero.it", partitaIva: null, codiceFiscale: null, telefono: null },
  { ragioneSociale: "Aracnos s.r.l.", indirizzo: "Via A. Volta 5/7", cap: "46043", comune: "Castiglione d/Stiviere", provincia: "MN", pec: "aracnosdisinfestazioni@pec.it", email: null, partitaIva: null, codiceFiscale: null, telefono: null },
  { ragioneSociale: "RICOM s.r.l.", indirizzo: "Via Pierre e Marie Curie n°6", cap: "46010", comune: "Curtatone", provincia: "MN", pec: "ricom.mn@pec.it", email: "info@ricom.mn.it", partitaIva: null, codiceFiscale: null, telefono: null },
  { ragioneSociale: "Eurosistemi s.r.l.", indirizzo: "Via San Giorgio n°6", cap: "46044", comune: "Cerlongo di Goito", provincia: "MN", pec: "eurosistemi.srl@legalmail.it", email: "info@eurosistemimn.it", partitaIva: null, codiceFiscale: null, telefono: null },
  { ragioneSociale: "MyNet s.r.l.", indirizzo: "Via Ciro Menotti n°14", cap: "46100", comune: "Mantova", provincia: "MN", pec: "postacertificata@pec-mynet.it", email: "info@mynet.it", partitaIva: null, codiceFiscale: null, telefono: null },
  { ragioneSociale: "Posio s.p.a.", indirizzo: "Via Ulisse Barbieri n° 8", cap: "46100", comune: "Mantova", provincia: "MN", pec: null, email: "info@posiospa.it", partitaIva: null, codiceFiscale: null, telefono: null },
  // Ulteriori fornitori comuni (da ampliare con lista completa)
  { ragioneSociale: "Aruba S.p.A.", indirizzo: "Via San Clemente 53", cap: "24036", comune: "Ponte San Pietro", provincia: "BG", pec: "aruba@aruba.pec.it", email: "info@aruba.it", partitaIva: null, codiceFiscale: null, telefono: null },
  { ragioneSociale: "Autostrade per l'Italia S.p.A.", indirizzo: "Via Bergamini 50", cap: "00159", comune: "Roma", provincia: "RM", pec: "autostrade@pec.autostrade.it", email: null, partitaIva: null, codiceFiscale: null, telefono: null },
  { ragioneSociale: "Fastweb S.p.A.", indirizzo: "Piazza Adriano Olivetti 1", cap: "20864", comune: "Agrate Brianza", provincia: "MB", pec: "fastweb@pec.fastweb.it", email: null, partitaIva: null, codiceFiscale: null, telefono: null },
  { ragioneSociale: "Microsoft Italia S.r.l.", indirizzo: "Via Pasubio 21", cap: "20154", comune: "Milano", provincia: "MI", pec: "microsoft@pec.microsoft.it", email: null, partitaIva: null, codiceFiscale: null, telefono: null },
  { ragioneSociale: "Oracle Italia S.r.l.", indirizzo: "Viale Città d'Europa 679", cap: "00144", comune: "Roma", provincia: "RM", pec: "oracle@pec.oracle.it", email: null, partitaIva: null, codiceFiscale: null, telefono: null },
  { ragioneSociale: "SAP Italia S.p.A.", indirizzo: "Viale Isonzo 14/1", cap: "37126", comune: "Verona", provincia: "VR", pec: "sap@pec.sap.it", email: null, partitaIva: null, codiceFiscale: null, telefono: null },
  { ragioneSociale: "TeamSystem S.p.A.", indirizzo: "Via Sandro Penna 1", cap: "47521", comune: "Cesena", provincia: "FC", pec: "teamsystem@legalmail.it", email: null, partitaIva: null, codiceFiscale: null, telefono: null },
  { ragioneSociale: "TIM S.p.A.", indirizzo: "Via Gaetano Negri 1", cap: "20123", comune: "Milano", provincia: "MI", pec: "telecomitalia@pec.telecomitalia.it", email: null, partitaIva: null, codiceFiscale: null, telefono: null },
  { ragioneSociale: "Vodafone Italia S.p.A.", indirizzo: "Lorenteggio 257", cap: "20152", comune: "Milano", provincia: "MI", pec: "vodafone@vodafone.pec.it", email: null, partitaIva: null, codiceFiscale: null, telefono: null },
  { ragioneSociale: "Windtre S.p.A.", indirizzo: "Via Cesare Giulio Viola 48", cap: "00148", comune: "Roma", provincia: "RM", pec: "windtre@pec.windtre.it", email: null, partitaIva: null, codiceFiscale: null, telefono: null },
];

async function main() {
  console.log("🌱 Inizio seeding fornitori...\n");

  let createdCount = 0;
  let skippedCount = 0;

  for (const fornitore of fornitori) {
    try {
      // Verifica se esiste già (per PEC o email)
      const existing = await prisma.fornitore.findFirst({
        where: {
          OR: [
            { pec: fornitore.pec },
            { email: fornitore.email },
          ].filter(Boolean),
        },
      });

      if (existing) {
        console.log(`  ⏭️  Saltato: ${fornitore.ragioneSociale} (già esistente)`);
        skippedCount++;
        continue;
      }

      // Crea fornitore
      await prisma.fornitore.create({
        data: fornitore,
      });

      console.log(`  ✅ Creato: ${fornitore.ragioneSociale}`);
      createdCount++;
    } catch (error) {
      console.error(`  ❌ Errore per ${fornitore.ragioneSociale}:`, error);
    }
  }

  console.log(`\n📊 Riepilogo:`);
  console.log(`  - Creati: ${createdCount}`);
  console.log(`  - Saltati: ${skippedCount}`);
  console.log(`  - Totale processati: ${fornitori.length}`);
  console.log("\n✅ Seeding fornitori completato!\n");
}

main()
  .catch((e) => {
    console.error("\n❌ Errore durante il seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
