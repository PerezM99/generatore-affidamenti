"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConflictData {
  field: string;
  dbValue: string | null;
  preventivoValue: string | null;
}

interface NewData {
  field: string;
  value: string;
}

interface FornitoreMatchData {
  fornitoreId: string;
  isFromDatabase: boolean;
  matchCount: number;
  matchedFields: string[];
  conflicts: ConflictData[];
  newData: NewData[];
  needsUserInput: boolean;
}

interface Props {
  matchData: FornitoreMatchData;
  ragioneSociale: string;
  onResolve: (resolvedData: Record<string, string>) => void;
  onCancel: () => void;
}

const fieldLabels: Record<string, string> = {
  ragioneSociale: "Ragione Sociale",
  codiceFiscale: "Codice Fiscale",
  partitaIva: "Partita IVA",
  indirizzo: "Indirizzo",
  cap: "CAP",
  comune: "Comune",
  provincia: "Provincia",
  email: "Email",
  pec: "PEC",
  telefono: "Telefono",
};

export default function FornitoreConflictResolver({
  matchData,
  ragioneSociale,
  onResolve,
  onCancel,
}: Props) {
  // Stato per le scelte dell'utente
  const [conflictChoices, setConflictChoices] = useState<Record<string, "db" | "preventivo">>({});
  const [saveNewData, setSaveNewData] = useState(true); // Di default salva i nuovi dati

  const handleConflictChoice = (field: string, choice: "db" | "preventivo") => {
    setConflictChoices((prev) => ({ ...prev, [field]: choice }));
  };

  const handleConfirm = () => {
    // Costruisci i dati risolti
    const resolvedData: Record<string, string> = {};

    // Aggiungi scelte per conflitti
    matchData.conflicts.forEach((conflict) => {
      const choice = conflictChoices[conflict.field] || "db"; // Default: DB
      const value = choice === "db" ? conflict.dbValue : conflict.preventivoValue;
      if (value) {
        resolvedData[conflict.field] = value;
      }
    });

    // Aggiungi nuovi dati se l'utente vuole salvarli
    if (saveNewData) {
      matchData.newData.forEach((newData) => {
        resolvedData[newData.field] = newData.value;
      });
    }

    onResolve(resolvedData);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
          className="bg-card-bg border-2 border-gold/30 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        >
        {/* Header */}
        <div className="bg-gold/10 border-b border-gold/30 p-6">
          <h2 className="text-2xl font-bold text-gold mb-2">
            Fornitore trovato nel database
          </h2>
          <p className="text-foreground/80">
            <strong className="text-foreground">{ragioneSociale}</strong> è già presente nel database.
          </p>
          <p className="text-foreground/60 text-sm mt-2">
            Sono stati trovati <strong>{matchData.matchCount}</strong> campi corrispondenti: {matchData.matchedFields.join(", ")}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Conflitti */}
          {matchData.conflicts.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="text-yellow-500">⚠️</span>
                Conflitti rilevati ({matchData.conflicts.length})
              </h3>
              <p className="text-foreground/70 text-sm mb-4">
                I seguenti campi hanno valori diversi tra database e preventivo. Scegli quale valore mantenere:
              </p>

              <div className="space-y-4">
                {matchData.conflicts.map((conflict) => (
                  <div key={conflict.field} className="bg-background/50 border border-border rounded-lg p-4">
                    <div className="font-medium text-foreground mb-3">
                      {fieldLabels[conflict.field] || conflict.field}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Opzione DB */}
                      <button
                        onClick={() => handleConflictChoice(conflict.field, "db")}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          (conflictChoices[conflict.field] || "db") === "db"
                            ? "border-gold bg-gold/10"
                            : "border-border bg-background/30 hover:border-gold/50"
                        }`}
                      >
                        <div className="text-xs text-foreground/60 mb-1">Database</div>
                        <div className="font-medium text-foreground break-words">
                          {conflict.dbValue || <span className="text-foreground/30 italic">vuoto</span>}
                        </div>
                      </button>

                      {/* Opzione Preventivo */}
                      <button
                        onClick={() => handleConflictChoice(conflict.field, "preventivo")}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          conflictChoices[conflict.field] === "preventivo"
                            ? "border-gold bg-gold/10"
                            : "border-border bg-background/30 hover:border-gold/50"
                        }`}
                      >
                        <div className="text-xs text-foreground/60 mb-1">Preventivo</div>
                        <div className="font-medium text-foreground break-words">
                          {conflict.preventivoValue || <span className="text-foreground/30 italic">vuoto</span>}
                        </div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nuovi dati */}
          {matchData.newData.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="text-blue-500">📝</span>
                Nuovi dati dal preventivo ({matchData.newData.length})
              </h3>
              <p className="text-foreground/70 text-sm mb-4">
                I seguenti campi sono presenti nel preventivo ma non nel database:
              </p>

              <div className="bg-background/50 border border-border rounded-lg p-4 space-y-3">
                {matchData.newData.map((data) => (
                  <div key={data.field} className="flex justify-between items-center">
                    <span className="font-medium text-foreground">
                      {fieldLabels[data.field] || data.field}:
                    </span>
                    <span className="text-foreground/80 break-words max-w-md text-right">
                      {data.value}
                    </span>
                  </div>
                ))}
              </div>

              <label className="flex items-center gap-3 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveNewData}
                  onChange={(e) => setSaveNewData(e.target.checked)}
                  className="w-5 h-5 rounded border-border bg-background checked:bg-gold checked:border-gold"
                />
                <span className="text-foreground">
                  Salva questi dati nel database per mantenerlo aggiornato
                </span>
              </label>
            </div>
          )}

          {/* Note */}
          <div className="bg-gold/5 border border-gold/20 rounded-lg p-4">
            <p className="text-foreground/70 text-sm">
              <strong className="text-foreground">Nota:</strong> Le scelte che effettui verranno salvate nel database
              per mantenere i dati aggiornati. I campi che non hanno conflitti useranno automaticamente
              i valori del database.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-background/50 border-t border-border p-6 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-lg border border-border text-foreground hover:bg-background/50 transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 rounded-lg bg-gold text-background font-medium hover:bg-gold/90 transition-colors"
          >
            Conferma e Continua
          </button>
        </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
