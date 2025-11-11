/**
 * Fornitore Matcher - Matching intelligente fornitori
 *
 * Logica: Se almeno 2 campi corrispondono tra i dati estratti e un record DB,
 * considera che è lo stesso fornitore e sostituisci TUTTI i dati con quelli del DB
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface FornitoreEstratto {
  ragioneSociale?: string;
  codiceFiscale?: string;
  partitaIva?: string;
  indirizzo?: string;
  cap?: string;
  comune?: string;
  provincia?: string;
  email?: string;
  pec?: string;
  telefono?: string;
}

export interface ConflictData {
  field: string;
  dbValue: string | null;
  preventivoValue: string | null;
}

export interface NewData {
  field: string;
  value: string;
}

export interface FornitoreMatched extends FornitoreEstratto {
  fornitoreId?: string; // ID del fornitore nel DB se trovato
  isFromDatabase: boolean; // true se è stato matchato con DB
  matchCount: number; // Numero di campi corrispondenti
  matchedFields?: string[]; // Campi che hanno matchato (per debug)

  // Nuovi campi per gestione conflitti e dati nuovi
  conflicts?: ConflictData[]; // Campi con valori diversi tra DB e preventivo
  newData?: NewData[]; // Campi nuovi presenti solo nel preventivo
  needsUserInput?: boolean; // true se ci sono conflitti o dati nuovi da confermare
}

/**
 * Normalizza una stringa per il confronto
 */
function normalizeString(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " "); // Normalizza spazi multipli
}

/**
 * Merge intelligente tra dati estratti e dati DB
 *
 * Logica:
 * - Se DB ha il dato e preventivo no → usa DB
 * - Se preventivo ha il dato e DB no → usa preventivo (segnala come nuovo)
 * - Se entrambi hanno il dato ma sono diversi → segnala conflitto, usa DB temporaneamente
 */
function mergeFornitoreData(
  preventivo: FornitoreEstratto,
  db: any
): {
  merged: FornitoreEstratto;
  conflicts: ConflictData[];
  newData: NewData[];
} {
  const merged: FornitoreEstratto = {};
  const conflicts: ConflictData[] = [];
  const newData: NewData[] = [];

  // Tutti i campi da considerare
  const allFields: (keyof FornitoreEstratto)[] = [
    "ragioneSociale",
    "codiceFiscale",
    "partitaIva",
    "indirizzo",
    "cap",
    "comune",
    "provincia",
    "email",
    "pec",
    "telefono",
  ];

  for (const field of allFields) {
    const prevValue = preventivo[field];
    const dbValue = db[field];

    // Caso 1: Entrambi hanno il dato
    if (prevValue && dbValue) {
      // Verifica se sono uguali (normalizzati)
      if (normalizeString(prevValue) === normalizeString(dbValue)) {
        // Sono uguali → usa DB (versione canonica)
        merged[field] = dbValue;
      } else {
        // Sono diversi → CONFLITTO
        conflicts.push({
          field,
          dbValue,
          preventivoValue: prevValue,
        });
        // Temporaneamente usa il valore del DB (più affidabile)
        merged[field] = dbValue;
      }
    }
    // Caso 2: Solo DB ha il dato
    else if (!prevValue && dbValue) {
      merged[field] = dbValue;
    }
    // Caso 3: Solo preventivo ha il dato → DATO NUOVO
    else if (prevValue && !dbValue) {
      merged[field] = prevValue;
      newData.push({
        field,
        value: prevValue,
      });
    }
    // Caso 4: Nessuno ha il dato
    else {
      merged[field] = undefined;
    }
  }

  // Log per debug
  if (conflicts.length > 0) {
    console.log(`⚠️ ${conflicts.length} conflitti rilevati:`, conflicts.map(c => c.field).join(", "));
  }
  if (newData.length > 0) {
    console.log(`📝 ${newData.length} dati nuovi dal preventivo:`, newData.map(d => d.field).join(", "));
  }

  return { merged, conflicts, newData };
}

/**
 * Verifica se due stringhe normalizzate corrispondono
 */
function fieldsMatch(
  extracted: string | null | undefined,
  db: string | null | undefined
): boolean {
  if (!extracted || !db) return false;

  const norm1 = normalizeString(extracted);
  const norm2 = normalizeString(db);

  if (!norm1 || !norm2) return false;

  return norm1 === norm2;
}

/**
 * Confronta il fornitore estratto con tutti i fornitori nel DB
 * Se 2+ campi corrispondono, restituisce i dati completi dal DB
 */
export async function matchFornitore(
  fornitoreEstratto: FornitoreEstratto
): Promise<FornitoreMatched> {
  console.log("🔍 Inizio matching fornitore...");
  console.log("📋 Dati estratti:", fornitoreEstratto);

  // Campi da controllare per il matching
  // ESCLUSI: indirizzo, cap, comune, provincia (troppo soggetti a errori LLM)
  const fieldsToCheck = [
    "ragioneSociale",
    "partitaIva",
    "codiceFiscale",
    "pec",
    "email",
  ] as const;

  try {
    // Ottieni tutti i fornitori dal DB
    const fornitoriDb = await prisma.fornitore.findMany();
    console.log(`📊 Trovati ${fornitoriDb.length} fornitori nel DB`);

    let bestMatch: {
      fornitore: any;
      matchCount: number;
      matchedFields: string[];
    } | null = null;

    // Per ogni fornitore nel DB, conta i campi corrispondenti
    for (const fornitoreDb of fornitoriDb) {
      let matchCount = 0;
      const matchedFields: string[] = [];

      for (const field of fieldsToCheck) {
        const extractedValue = fornitoreEstratto[field];
        const dbValue = fornitoreDb[field];

        if (fieldsMatch(extractedValue, dbValue)) {
          matchCount++;
          matchedFields.push(field);
        }
      }

      // Se questo fornitore ha più match del precedente migliore, salvalo
      if (matchCount >= 2 && (!bestMatch || matchCount > bestMatch.matchCount)) {
        bestMatch = {
          fornitore: fornitoreDb,
          matchCount,
          matchedFields,
        };
      }
    }

    // Se abbiamo trovato un match con 2+ campi
    if (bestMatch) {
      console.log(`✅ Match trovato: ${bestMatch.fornitore.ragioneSociale}`);
      console.log(`   - ${bestMatch.matchCount} campi corrispondenti: ${bestMatch.matchedFields.join(", ")}`);

      // Esegui merge intelligente e rileva conflitti/dati nuovi
      const mergeResult = mergeFornitoreData(fornitoreEstratto, bestMatch.fornitore);

      return {
        ...mergeResult.merged,
        fornitoreId: bestMatch.fornitore.id,
        isFromDatabase: true,
        matchCount: bestMatch.matchCount,
        matchedFields: bestMatch.matchedFields,
        conflicts: mergeResult.conflicts,
        newData: mergeResult.newData,
        needsUserInput: mergeResult.conflicts.length > 0 || mergeResult.newData.length > 0,
      };
    }

    // Nessun match trovato - usa dati estratti
    console.log("⚠️ Nessun match trovato nel DB (< 2 campi corrispondenti)");
    console.log("   Verranno usati i dati estratti dal PDF");

    return {
      ...fornitoreEstratto,
      isFromDatabase: false,
      matchCount: 0,
    };
  } catch (error) {
    console.error("❌ Errore durante matching fornitore:", error);

    // In caso di errore, ritorna i dati estratti
    return {
      ...fornitoreEstratto,
      isFromDatabase: false,
      matchCount: 0,
    };
  }
}

/**
 * Crea o aggiorna il fornitore nel database
 * Se è già presente (isFromDatabase), restituisce l'ID esistente
 * Altrimenti crea un nuovo record
 */
export async function upsertFornitore(
  fornitoreData: FornitoreMatched
): Promise<string> {
  try {
    // Se il fornitore è dal DB, restituisci l'ID esistente
    if (fornitoreData.isFromDatabase && fornitoreData.fornitoreId) {
      console.log(`♻️ Fornitore esistente nel DB: ${fornitoreData.fornitoreId}`);
      return fornitoreData.fornitoreId;
    }

    // Altrimenti crea un nuovo fornitore
    console.log("➕ Creazione nuovo fornitore nel DB...");

    const newFornitore = await prisma.fornitore.create({
      data: {
        ragioneSociale: fornitoreData.ragioneSociale || "Fornitore sconosciuto",
        codiceFiscale: fornitoreData.codiceFiscale,
        partitaIva: fornitoreData.partitaIva,
        indirizzo: fornitoreData.indirizzo,
        cap: fornitoreData.cap,
        comune: fornitoreData.comune,
        provincia: fornitoreData.provincia,
        email: fornitoreData.email,
        pec: fornitoreData.pec,
        telefono: fornitoreData.telefono,
      },
    });

    console.log(`✅ Nuovo fornitore creato: ${newFornitore.id}`);
    return newFornitore.id;
  } catch (error) {
    console.error("❌ Errore durante upsert fornitore:", error);
    throw error;
  }
}
